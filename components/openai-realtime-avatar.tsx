"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { ChatMessage } from "@/app/lib/types";

interface OpenAIRealtimeAvatarProps {
  setShowChat: (show: boolean) => void;
  onLoadingStateChange?: (loading: boolean) => void;
  systemPrompt: string;
  useWebSockets?: boolean; // WebSocketsを使用するかどうかのフラグ
  useAudioFiltering?: boolean; // 音声フィルタリングを有効/無効にするフラグ
  audioFilterFrequency?: number; // フィルタの周波数（オプション、デフォルト値あり）
}

export default function OpenAIRealtimeAvatar({
  setShowChat,
  onLoadingStateChange,
  systemPrompt,
  useWebSockets = false, // デフォルトはWebRTC
  useAudioFiltering = false, // デフォルトは音声フィルタリング無効
  audioFilterFrequency = 8000 // デフォルトは8kHz
}: OpenAIRealtimeAvatarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // 状態管理を簡素化: 3つの状態を1つの変数で管理
  const [conversationState, setConversationState] = useState<'idle' | 'user_talking' | 'avatar_talking'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false); // デバッグモードを無効化
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null); // WebAudio APIのコンテキスト
  const stateTimerRef = useRef<NodeJS.Timeout | null>(null); // 状態遷移用タイマー
  const lastStateChangeTimeRef = useRef<number>(Date.now()); // 最後に状態が変化した時間
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null); // 短い発話をフィルタリングするためのタイマー
  const speechStartTimeRef = useRef<number | null>(null); // 発話開始時間

  // 音声処理を行う関数
  const processAudioStream = useCallback((stream: MediaStream): MediaStream => {
    if (!useAudioFiltering) {
      console.log("Audio filtering disabled - using raw stream");
      return stream;
    }
    
    try {
      console.log(`Audio filtering enabled with frequency: ${audioFilterFrequency}Hz`);
      
      // AudioContextを作成
      const context = new AudioContext();
      audioContext.current = context;
      
      // ストリームからソースを作成
      const source = context.createMediaStreamSource(stream);
      
      // ローパスフィルターを作成
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = audioFilterFrequency;
      console.log(`Created lowpass filter with frequency: ${filter.frequency.value}Hz`);
      
      // 処理済み音声の出力先を作成
      const destination = context.createMediaStreamDestination();
      
      // ノードを接続
      source.connect(filter);
      filter.connect(destination);
      
      // 処理済みのストリームを返す
      return destination.stream;
    } catch (error) {
      console.error("Audio processing error:", error);
      // エラー時は元のストリームを返す
      return stream;
    }
  }, [useAudioFiltering, audioFilterFrequency]);

  // WebRTCを使用した接続
  const connectWithWebRTC = useCallback(async () => {
    try {
      setIsLoading(true);
      onLoadingStateChange?.(true);
      setError(null);

      // エフェメラルトークンの取得
      const tokenResponse = await fetch("/api/realtime-token");
      if (!tokenResponse.ok) {
        throw new Error(`Token API error: ${tokenResponse.status}`);
      }
      const data = await tokenResponse.json();
      const ephemeralKey = data.client_secret.value;

      // ピア接続の作成
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // モデルからのリモートオーディオを再生するための設定
      if (audioElement.current) {
        audioElement.current.autoplay = true;
        pc.ontrack = e => {
          if (audioElement.current) {
            audioElement.current.srcObject = e.streams[0];
          }
        };
      }

      // ブラウザでマイク入力用のローカルオーディオトラックを追加
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      
      // 音声処理を適用
      const processedStream = processAudioStream(rawStream);
      mediaStream.current = processedStream;
      
      // 処理済みのストリームをRTCPeerConnectionに追加
      processedStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, processedStream);
      });

      // イベント送受信用のデータチャネルの設定
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      
      // データチャネルイベントリスナーの設定
      dc.addEventListener("open", () => {
        setIsConnected(true);
        setIsLoading(false);
        onLoadingStateChange?.(false);
        
        // 明示的にidle状態に設定
        setConversationState('idle');
        lastStateChangeTimeRef.current = Date.now();
        
        // セッション作成後、システムプロンプトを設定
        dc.send(JSON.stringify({
          type: "session.update",
          session: {
            instructions: systemPrompt,
            voice: "sol" // 変更: 'verse'から'sol'に変更
          }
        }));
      });
      
      dc.addEventListener("close", () => {
        setIsConnected(false);
      });
      
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Server event:", event);
        
        // 接続開始時のイベントをより詳細にログ出力
        if (isLoading || !isConnected) {
          console.log("Connection phase event:", event.type, event);
        }
        
        // セッション関連イベントは無視
        if (event.type.includes("session.")) {
          console.log("Session event ignored:", event.type);
          return; // 他のイベント処理をスキップ
        }
        
        // イベント処理（優先順位付き）
        
        // 1. ユーザーの発話（最優先）- 短い相槌をフィルタリング
        if (event.type === "input_audio_buffer.speech_started") {
          console.log("Speech detected - evaluating if it's a real utterance or just a backchannel");
          
          // 発話開始時間を記録
          speechStartTimeRef.current = Date.now();
          
          // 短い相槌を無視するためのタイマーを設定
          if (speechTimerRef.current) {
            clearTimeout(speechTimerRef.current);
          }
          
          // 短い相槌を無視するためのタイマーを設定
          speechTimerRef.current = setTimeout(() => {
            // 一定時間（例：600ms）以上続いた場合のみ、ユーザー発話状態に移行
            console.log("Speech continued for threshold period - treating as real utterance");
            setConversationState('user_talking');
            lastStateChangeTimeRef.current = Date.now();
            
            // タイマーをクリア
            if (stateTimerRef.current) {
              clearTimeout(stateTimerRef.current);
              stateTimerRef.current = null;
            }
          }, 600);
          
          return; // 他のイベント処理をスキップ
        }
        
        // 2. ユーザーの発話終了
        if (event.type === "input_audio_buffer.speech_stopped") {
          console.log("Speech stopped event received");
          
          // 短い発話フィルタリングタイマーをクリア
          if (speechTimerRef.current) {
            clearTimeout(speechTimerRef.current);
            speechTimerRef.current = null;
          }
          
          // 発話の長さを計算
          const speechDuration = speechStartTimeRef.current ? Date.now() - speechStartTimeRef.current : 0;
          console.log(`Speech duration: ${speechDuration}ms`);
          
          // 非常に短い発話は無視（相槌や周辺ノイズと判断）
          if (speechDuration < 500) {
            console.log("Ignoring very short utterance (likely backchannel or noise)");
            return;
          }
          
          // ユーザーが実際に話していた場合のみ処理
          if (conversationState === 'user_talking') {
            console.log("User stopped talking");
            
            // タイマーをクリア
            if (stateTimerRef.current) {
              clearTimeout(stateTimerRef.current);
            }
            
            // ユーザー発話終了後、少し待ってからidle状態に戻す
            stateTimerRef.current = setTimeout(() => {
              console.log("Returning to idle state after user talking");
              setConversationState('idle');
              lastStateChangeTimeRef.current = Date.now();
            }, 1200); // 1.2秒のディレイに延長
          }
          return;
        }
        
        // 3. アバターの発話（ユーザーが話していない場合のみ）- バランスの取れた条件
        if (conversationState !== 'user_talking' && 
            (
              // 音声出力関連のイベント
              event.type === "output_audio_buffer.speech_started" || 
              event.type === "output_audio_buffer.speech_detected" ||
              // 応答開始イベント（早期検出用）
              event.type === "response.created" ||
              // テキスト応答イベント
              (event.type === "response.text.delta" && event.delta?.text) ||
              // その他の応答イベント
              event.type === "response.audio_transcript.done" ||
              event.type === "response.content_part.done" ||
              event.type === "response.output_item.done"
            )) {
          
          console.log("Avatar talking event detected:", event.type);
          setConversationState('avatar_talking');
          lastStateChangeTimeRef.current = Date.now();
          
          // タイマーをクリア
          if (stateTimerRef.current) {
            clearTimeout(stateTimerRef.current);
          }
          
          // 3秒後に発話状態を解除するタイマーを設定（2秒から3秒に延長）
          stateTimerRef.current = setTimeout(() => {
            console.log("Avatar talking timer expired");
            if (conversationState === 'avatar_talking') {
              setConversationState('idle');
              lastStateChangeTimeRef.current = Date.now();
            }
          }, 3000);
          return;
        }
        
        // 注: 4. 音声出力イベントは上記の3に統合
        
        // 5. アバターの発話終了
        if (event.type === "response.done" && conversationState === 'avatar_talking') {
          console.log("Avatar response done");
          
          // タイマーをクリア
          if (stateTimerRef.current) {
            clearTimeout(stateTimerRef.current);
          }
          
          // ディレイを1秒に短縮（3秒から1秒に）
          stateTimerRef.current = setTimeout(() => {
            console.log("Avatar talking ended after response done");
            setConversationState('idle');
            lastStateChangeTimeRef.current = Date.now();
          }, 1000); // 3000msから1000msに短縮
          return;
        }
        
        // エラーイベント
        if (event.type === "error") {
          setError(`API error: ${event.message}`);
        }
      });

      // SDPを使用してセッションを開始
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP API error: ${sdpResponse.status}`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setIsLoading(false);
      onLoadingStateChange?.(false);
    }
  }, [onLoadingStateChange, systemPrompt, processAudioStream]);

  // WebSocketsを使用した接続
  const connectWithWebSockets = useCallback(async () => {
    try {
      setIsLoading(true);
      onLoadingStateChange?.(true);
      setError(null);

      // APIキーの取得（開発環境では直接使用、本番環境ではサーバーサイドで処理）
      const tokenResponse = await fetch("/api/realtime-token?websocket=true");
      if (!tokenResponse.ok) {
        throw new Error(`Token API error: ${tokenResponse.status}`);
      }
      const data = await tokenResponse.json();
      const apiKey = data.api_key;

      // WebSocketの接続
      // 注意: ブラウザのWebSocket APIはヘッダーをサポートしていないため、
      // サーバーサイドでWebSocketを使用するか、別のアプローチが必要です
      
      // 開発環境用の簡易的な実装（本番環境では使用しないでください）
      setError("ローカル開発環境ではWebSocketsの直接接続はサポートされていません。サーバーサイドプロキシが必要です。");
      
      // ダミーのWebSocketオブジェクト
      const ws = {
        send: (data: string) => {
          console.log("WebSocket send (mock):", data);
        },
        close: () => {
          console.log("WebSocket close (mock)");
          setIsConnected(false);
        }
      };
      
      // 接続成功をシミュレート
      setTimeout(() => {
        console.log("WebSocket connected (mock)");
        setIsConnected(true);
        setIsLoading(false);
        onLoadingStateChange?.(false);
      }, 1000);
      
      
      // WebSocketオブジェクトを保存
      // @ts-ignore - WebSocketをdataChannelとして扱う
      dataChannel.current = ws;
      
    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setIsLoading(false);
      onLoadingStateChange?.(false);
    }
  }, [onLoadingStateChange, systemPrompt]);

  // 接続方法の選択
  const connectToOpenAI = useCallback(async () => {
    if (useWebSockets) {
      await connectWithWebSockets();
    } else {
      await connectWithWebRTC();
    }
  }, [useWebSockets, connectWithWebRTC, connectWithWebSockets, useAudioFiltering, audioFilterFrequency]);

  const disconnectFromOpenAI = useCallback(async () => {
    try {
      // データチャネルのクローズ
      if (dataChannel.current) {
        dataChannel.current.close();
      }
      
      // ピア接続のクローズ
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      // メディアストリームのトラックを停止
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
      
      // AudioContextのクローズ
      if (audioContext.current && audioContext.current.state !== 'closed') {
        try {
          await audioContext.current.close();
          console.log("AudioContext closed successfully");
        } catch (audioError) {
          console.error("Error closing AudioContext:", audioError);
        }
        audioContext.current = null;
      }
      
      // タイマーのクリア
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current);
        stateTimerRef.current = null;
      }
      
      // 状態のリセット
      setIsConnected(false);
      setConversationState('idle');
      setChatHistory([]);
      
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  }, []);

  const handleEndAndReturn = useCallback(async () => {
    await disconnectFromOpenAI();
    setShowChat(false);
  }, [disconnectFromOpenAI, setShowChat]);

  // コンポーネントのマウント時に接続
  useEffect(() => {
    connectToOpenAI();
    
    // クリーンアップ関数
    return () => {
      disconnectFromOpenAI();
    };
  }, [connectToOpenAI, disconnectFromOpenAI]);
  
  // 動画のプリロード
  useEffect(() => {
    console.log("Preloading videos...");
    const videoSources = [
      '/user-talking.mp4',
      '/avatar-talking.mp4',
      '/avatar-idle.mp4'
    ];
    
    const preloadedVideos: HTMLVideoElement[] = [];
    
    // 各動画をプリロード
    videoSources.forEach(src => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.muted = true;
      video.style.display = 'none';
      video.load(); // 明示的に読み込みを開始
      document.body.appendChild(video);
      preloadedVideos.push(video);
    });
    
    // クリーンアップ時に削除
    return () => {
      preloadedVideos.forEach(video => {
        document.body.removeChild(video);
      });
    };
  }, []);
  
  // オーディオ要素のイベントリスナー - 実際の音声出力を検出（優先度を高く設定）
  useEffect(() => {
    if (!audioElement.current) return;
    
    const handlePlay = () => {
      console.log("Audio started playing - Setting avatar_talking state");
      // 優先度を高く設定
      setConversationState('avatar_talking');
      lastStateChangeTimeRef.current = Date.now();
      
      // タイマーをクリア
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current);
        stateTimerRef.current = null;
      }
    };
    
    const handlePause = () => {
      console.log("Audio paused");
      // 少し遅延を入れてidle状態に戻す
      setTimeout(() => {
        if (conversationState === 'avatar_talking') {
          console.log("Setting idle state after audio pause");
          setConversationState('idle');
          lastStateChangeTimeRef.current = Date.now();
        }
      }, 300); // 500msから300msに短縮
    };
    
    const handleEnded = () => {
      console.log("Audio ended");
      setConversationState('idle');
      lastStateChangeTimeRef.current = Date.now();
    };
    
    // オーディオデータの処理中に発生するイベント
    const handleAudioProcess = () => {
      console.log("Audio processing - Confirming avatar_talking state");
      if (conversationState !== 'avatar_talking') {
        setConversationState('avatar_talking');
        lastStateChangeTimeRef.current = Date.now();
      }
    };
    
    audioElement.current.addEventListener('play', handlePlay);
    audioElement.current.addEventListener('pause', handlePause);
    audioElement.current.addEventListener('ended', handleEnded);
    // audioprocessイベントは非標準だが、一部のブラウザでサポートされている
    audioElement.current.addEventListener('audioprocess', handleAudioProcess);
    
    return () => {
      if (audioElement.current) {
        audioElement.current.removeEventListener('play', handlePlay);
        audioElement.current.removeEventListener('pause', handlePause);
        audioElement.current.removeEventListener('ended', handleEnded);
        audioElement.current.removeEventListener('audioprocess', handleAudioProcess);
      }
    };
  }, [conversationState]); // conversationStateの変更を監視
  
  // 会話状態が変化した時のログ出力
  useEffect(() => {
    console.log("Conversation state changed:", conversationState);
  }, [conversationState]);
  
  // フォールバックメカニズム: 長時間同じ状態が続いている場合はリセット
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - lastStateChangeTimeRef.current;
      
      // アバターが話している状態が15秒以上続いている場合はリセット（10秒から15秒に延長）
      if (conversationState === 'avatar_talking' && elapsedTime > 15000) {
        console.log("Avatar talking state reset due to timeout");
        setConversationState('idle');
        lastStateChangeTimeRef.current = now;
      }
      
      // ユーザーが話している状態が10秒以上続いている場合もリセット
      if (conversationState === 'user_talking' && elapsedTime > 10000) {
        console.log("User talking state reset due to timeout");
        setConversationState('idle');
        lastStateChangeTimeRef.current = now;
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [conversationState]);

  return (
    <div className="w-full relative">
      <div>
        <Card className="w-full scale-110 mb-8">
          <CardBody className="p-0">
            <div className="w-full bg-black rounded-lg overflow-hidden">
              <div className="relative w-full pt-[56.25%]">
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* デバッグ表示 - 必要に応じて有効化 */}
                  {debugMode && (
                    <div className="absolute top-4 left-4 z-30 bg-black/70 text-white p-2 rounded text-xs">
                      <div>Conversation state: {conversationState}</div>
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => setConversationState('idle')}
                          className={`px-2 py-1 rounded ${conversationState === 'idle' ? 'bg-green-500' : 'bg-blue-500'}`}
                        >
                          Idle
                        </button>
                        <button 
                          onClick={() => setConversationState('user_talking')}
                          className={`px-2 py-1 rounded ${conversationState === 'user_talking' ? 'bg-green-500' : 'bg-blue-500'}`}
                        >
                          User
                        </button>
                        <button 
                          onClick={() => setConversationState('avatar_talking')}
                          className={`px-2 py-1 rounded ${conversationState === 'avatar_talking' ? 'bg-green-500' : 'bg-blue-500'}`}
                        >
                          Avatar
                        </button>
                      </div>
                      <div className="mt-2">
                        <div>Audio filtering: {useAudioFiltering ? 
                          <span className="text-green-400">ON ({audioFilterFrequency}Hz)</span> : 
                          <span className="text-red-400">OFF</span>}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div>Speech events:</div>
                        <div id="speech-events" className="max-h-20 overflow-y-auto text-[10px]">
                          {/* 最新の音声イベントがここに表示される */}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 音声認識インジケーター */}
                  {conversationState === 'user_talking' && (
                    <div className="absolute top-4 right-4 z-30">
                      <Chip
                        variant="flat"
                        classNames={{
                          base: "bg-green-500/80 animate-pulse",
                          content: "text-white font-zen-maru-gothic"
                        }}
                        startContent={
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" x2="12" y1="19" y2="22"/>
                          </svg>
                        }
                      >
                        音声認識中...
                      </Chip>
                    </div>
                  )}
                  
                  {isLoading ? (
                    <div className="w-full h-full flex flex-col justify-center items-center gap-6 bg-black/80">
                      <Spinner color="default" size="lg" />
                      <div className="text-xl font-zen-maru-gothic text-white">
                        お話をする準備をしています
                      </div>
                      <div className="w-64 h-4 bg-gray-100/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#98996B] to-[#276204] rounded-full animate-loading-progress"
                        />
                      </div>
                    </div>
                  ) : (
                    // 状態に応じて異なる動画を表示（背景画像 + フェードエフェクト）
                    <div className="w-full h-full relative">
                      {/* 背景画像（常に表示） */}
                      <img 
                        src="/natsumi_preview.webp" 
                        alt="アシスタント背景" 
                        className="w-full h-full object-cover absolute inset-0 z-0"
                      />
                      
                      {/* すべての動画を常に読み込んでおき、不透明度で表示/非表示を切り替える */}
                      {/* ユーザー発話動画 */}
                      <video
                        key="user-talking"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
                          conversationState === 'user_talking' ? 'opacity-100 z-20' : 'opacity-0 z-10'
                        }`}
                        onError={(e) => {
                          console.error("User talking video error:", e);
                        }}
                      >
                        <source src="/user-talking.mp4" type="video/mp4" />
                        <track kind="captions" />
                      </video>
                      
                      {/* アバター発話動画 */}
                      <video
                        key="avatar-talking"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
                          conversationState === 'avatar_talking' ? 'opacity-100 z-20' : 'opacity-0 z-10'
                        }`}
                        onError={(e) => {
                          console.error("Avatar talking video error:", e);
                        }}
                      >
                        <source src="/avatar-talking.mp4" type="video/mp4" />
                        <track kind="captions" />
                      </video>
                      
                      {/* アイドル状態動画 */}
                      <video
                        key="idle"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
                          conversationState === 'idle' ? 'opacity-100 z-20' : 'opacity-0 z-10'
                        }`}
                        onError={(e) => {
                          console.error("Idle video error:", e);
                        }}
                      >
                        <source src="/avatar-idle.mp4" type="video/mp4" />
                        <track kind="captions" />
                      </video>
                    </div>
                  )}
                  
                  {/* 非表示のオーディオ要素 */}
                  <audio ref={audioElement} />
                  
                  {/* エラー表示 */}
                  {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500/80 text-white p-2 rounded">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
