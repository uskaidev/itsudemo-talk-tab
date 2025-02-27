"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { ChatMessage } from "@/app/lib/types";

interface OpenAIRealtimeAvatarProps {
  setShowChat: (show: boolean) => void;
  onLoadingStateChange?: (loading: boolean) => void;
  systemPrompt: string;
  useWebSockets?: boolean; // WebSocketsを使用するかどうかのフラグ
}

export default function OpenAIRealtimeAvatar({
  setShowChat,
  onLoadingStateChange,
  systemPrompt,
  useWebSockets = false // デフォルトはWebRTC
}: OpenAIRealtimeAvatarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

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
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      mediaStream.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // イベント送受信用のデータチャネルの設定
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      
      // データチャネルイベントリスナーの設定
      dc.addEventListener("open", () => {
        setIsConnected(true);
        setIsLoading(false);
        onLoadingStateChange?.(false);
        
        // セッション作成後、システムプロンプトを設定
        dc.send(JSON.stringify({
          type: "session.update",
      session: {
        instructions: systemPrompt,
        voice: "sol", // 変更: 'verse'から'sol'に変更
      }
        }));
      });
      
      dc.addEventListener("close", () => {
        setIsConnected(false);
      });
      
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Server event:", event);
        
        // 音声認識開始イベント
        if (event.type === "input_audio_buffer.speech_started") {
          setIsUserTalking(true);
        }
        
        // 音声認識終了イベント
        if (event.type === "input_audio_buffer.speech_stopped") {
          setIsUserTalking(false);
        }
        
        // テキスト応答イベント
        if (event.type === "response.text.delta" && event.delta?.text) {
          // テキスト応答の処理（必要に応じて）
        }
        
        // 応答完了イベント
        if (event.type === "response.done") {
          // 応答完了の処理（必要に応じて）
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
  }, [onLoadingStateChange, systemPrompt]);

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
  }, [useWebSockets, connectWithWebRTC, connectWithWebSockets]);

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
      
      // 状態のリセット
      setIsConnected(false);
      setIsUserTalking(false);
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

  return (
    <div className="w-full relative">
      <div>
        <Card className="w-full scale-110 mb-8">
          <CardBody className="p-0">
            <div className="w-full bg-black rounded-lg overflow-hidden">
              <div className="relative w-full pt-[56.25%]">
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* 音声認識インジケーター */}
                  {isUserTalking && (
                    <div className="absolute top-4 right-4 z-10">
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
                    /* 待機画像（現状のまま） */
                    <img 
                      src="/natsumi_preview.webp" 
                      alt="アシスタント" 
                      className="w-full h-full object-cover"
                    />
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
