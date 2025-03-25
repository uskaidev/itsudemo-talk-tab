"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useMemoizedFn } from "ahooks";
import InteractiveAvatarTextInput from "./interactive-avatar-text-input";
import { AVATARS, STT_LANGUAGE_LIST, AVATAR_CONFIG } from "@/app/lib/constants";
import { ChatMessage, StreamResponse, TalkingMessage } from "@/app/lib/types";

interface InteractiveAvatarProps {
  initialKnowledgeId?: string;
  initialAvatarId?: string;
  initialLanguage?: string;
  setShowChat: (show: boolean) => void;
  onLoadingStateChange?: (loading: boolean) => void;
}

export default function InteractiveAvatar({
  initialKnowledgeId = "97ac3c7dcb5742cdbe572ab9d8379342",
  initialAvatarId = "7438b2e84aed4f9fbf64453080e58651",
  initialLanguage = "ja",
  setShowChat,
  onLoadingStateChange,
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [knowledgeId] = useState<string>(initialKnowledgeId);
  const [avatarId] = useState<string>(initialAvatarId);
  const [language] = useState<string>(initialLanguage);
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<any>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');

  // トークンのプリロードを実装（有効期限付き）
  interface TokenInfo {
    token: string;
    expiry: number; // タイムスタンプ（ミリ秒）
  }
  
  // トークンの有効期限（ミリ秒）
  const TOKEN_EXPIRY_TIME = 8 * 60 * 1000; // 8分間
  
  const [preloadedToken, setPreloadedToken] = useState<TokenInfo | null>(null);
  
  // パフォーマンス測定用の状態
  const [loadTimes, setLoadTimes] = useState<{
    tokenFetchStart?: number;
    tokenFetchEnd?: number;
    avatarInitStart?: number;
    avatarInitEnd?: number;
  }>({});

  async function fetchAccessToken(): Promise<TokenInfo> {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const token = await response.text();
      if (!token) {
        throw new Error("Empty token received");
      }
      
      // トークンと有効期限を返す
      return {
        token,
        expiry: Date.now() + TOKEN_EXPIRY_TIME
      };
    } catch (error: any) {
      console.error("Error fetching access token:", error);
      setDebug(`Access token error: ${error.message}`);
      throw error;
    }
  }

  const setupEventHandlers = useCallback((avatarInstance: any) => {
    setDebug("Setting up event handlers");

    const handleAvatarStartTalking = () => {
      setCurrentAvatarMessage('');
    };

    const handleAvatarStopTalking = () => {
      // No action needed
    };

    const handleAvatarTalkingMessage = (message: TalkingMessage) => {
      if (message?.detail?.text?.trim()) {
        setCurrentAvatarMessage(prev => {
          const newMessage = prev ? `${prev} ${message.detail.text}` : message.detail.text;
          setDebug(`Avatar message: ${newMessage}`);
          return newMessage;
        });
      }
    };

    const handleAvatarEndMessage = () => {
      if (currentAvatarMessage?.trim()) {
        setChatHistory(prev => [
          ...prev,
          {
            role: 'assistant',
            content: currentAvatarMessage,
            timestamp: Date.now()
          }
        ]);
        setCurrentAvatarMessage('');
      }
    };

    const handleUserTalkingMessage = (message: TalkingMessage) => {
      if (message?.detail?.text?.trim()) {
        setCurrentUserMessage(prev => {
          const newMessage = prev ? `${prev} ${message.detail.text}` : message.detail.text;
          setDebug(`User message: ${newMessage}`);
          return newMessage;
        });
      }
    };

    const handleUserEndMessage = () => {
      if (currentUserMessage?.trim()) {
        setChatHistory(prev => [
          ...prev,
          {
            role: 'user',
            content: currentUserMessage,
            timestamp: Date.now()
          }
        ]);
        setCurrentUserMessage('');
      }
    };

    const handleStreamDisconnected = () => {
      setDebug("Stream disconnected");
      endSession();
    };

    const handleStreamReady = (event: StreamResponse) => {
      setDebug("Stream ready");
      setStream(event.detail);
    };

    const handleUserStart = () => {
      setIsUserTalking(true);
    };

    const handleUserStop = () => {
      setIsUserTalking(false);
    };

    avatarInstance.on(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
    avatarInstance.on(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);
    avatarInstance.on(StreamingEvents.AVATAR_TALKING_MESSAGE, handleAvatarTalkingMessage);
    avatarInstance.on(StreamingEvents.AVATAR_END_MESSAGE, handleAvatarEndMessage);
    avatarInstance.on(StreamingEvents.USER_TALKING_MESSAGE, handleUserTalkingMessage);
    avatarInstance.on(StreamingEvents.USER_END_MESSAGE, handleUserEndMessage);
    avatarInstance.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
    avatarInstance.on(StreamingEvents.STREAM_READY, handleStreamReady);
    avatarInstance.on(StreamingEvents.USER_START, handleUserStart);
    avatarInstance.on(StreamingEvents.USER_STOP, handleUserStop);

    return () => {
      setDebug("Cleaning up event handlers");
      avatarInstance.off(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
      avatarInstance.off(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);
      avatarInstance.off(StreamingEvents.AVATAR_TALKING_MESSAGE, handleAvatarTalkingMessage);
      avatarInstance.off(StreamingEvents.AVATAR_END_MESSAGE, handleAvatarEndMessage);
      avatarInstance.off(StreamingEvents.USER_TALKING_MESSAGE, handleUserTalkingMessage);
      avatarInstance.off(StreamingEvents.USER_END_MESSAGE, handleUserEndMessage);
      avatarInstance.off(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
      avatarInstance.off(StreamingEvents.STREAM_READY, handleStreamReady);
      avatarInstance.off(StreamingEvents.USER_START, handleUserStart);
      avatarInstance.off(StreamingEvents.USER_STOP, handleUserStop);
    };
  }, [currentAvatarMessage, currentUserMessage]);

  const startVoiceChat = useCallback(async (avatarInstance: any) => {
    if (!avatarInstance) return;
    
    try {
      setDebug("Starting voice chat");
      await avatarInstance.startVoiceChat({
        useSilencePrompt: false,
        language: language,
        continuous: true,
        interimResults: true
      });
      setDebug("Voice chat started successfully");
    } catch (error: any) {
      console.error("Error starting voice chat:", error);
      setDebug(`Voice chat error: ${error.message}`);
      throw error;
    }
  }, [language]);

  async function handleSpeak() {
    if (!avatar.current || !text) return;

    try {
      setIsLoadingRepeat(true);
      setDebug(`Speaking text: ${text}`);
      
      setChatHistory(prev => [
        ...prev,
        {
          role: 'user',
          content: text,
          timestamp: Date.now()
        }
      ]);
      
      await avatar.current.speak({
        text: text,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
      
      setText("");
    } catch (error: any) {
      console.error("Speak error:", error);
      setDebug(`Speak error: ${error.message}`);
    } finally {
      setIsLoadingRepeat(false);
    }
  }

  async function handleInterrupt() {
    try {
      if (!avatar.current) return;
      await avatar.current.interrupt();
    } catch (error: any) {
      console.error("Interrupt error:", error);
      setDebug(`Interrupt error: ${error.message}`);
    }
  }

  async function endSession() {
    try {
      if (avatar.current) {
        try {
          await avatar.current.closeVoiceChat();
        } catch (voiceError) {
          console.error("Error closing voice chat:", voiceError);
        }
        try {
          await avatar.current.stopAvatar();
        } catch (avatarError) {
          console.error("Error stopping avatar:", avatarError);
        }
        avatar.current = null;
      }
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setStream(undefined);
      setChatHistory([]);
      setCurrentAvatarMessage('');
      setCurrentUserMessage('');
      setIsUserTalking(false);
      setText('');
    }
  }

  async function handleEndAndReturn() {
    await endSession();
    setShowChat(false);
  }

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current?.play();
      };
    }
  }, [stream]);

  useEffect(() => {
    if (currentAvatarMessage) {
      setDebug(`Avatar message: ${currentAvatarMessage}`);
    }
  }, [currentAvatarMessage]);

  useEffect(() => {
    if (currentUserMessage) {
      setDebug(`User message: ${currentUserMessage}`);
    }
  }, [currentUserMessage]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      setDebug(`${lastMessage.role}: ${lastMessage.content}`);
    }
  }, [chatHistory]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1500; // 2000msから1500msに短縮

  // コンポーネントマウント時にトークンをプリロード
  useEffect(() => {
    let isMounted = true;
    
    const preloadToken = async () => {
      try {
        const startTime = Date.now();
        setLoadTimes(prev => ({ ...prev, tokenFetchStart: startTime }));
        
        // 既存のトークンがあり、まだ有効期限内なら再利用
        if (preloadedToken && Date.now() < preloadedToken.expiry) {
          setDebug(`Using existing token (valid until ${new Date(preloadedToken.expiry).toISOString()})`);
          return;
        }
        
        // 新しいトークンを取得
        const tokenInfo = await fetchAccessToken();
        
        if (isMounted) {
          const endTime = Date.now();
          setLoadTimes(prev => ({ ...prev, tokenFetchEnd: endTime }));
          
          setPreloadedToken(tokenInfo);
          setDebug(`Token preloaded successfully in ${endTime - startTime}ms (valid until ${new Date(tokenInfo.expiry).toISOString()})`);
        }
      } catch (error) {
        console.error("Failed to preload token:", error);
      }
    };
    
    preloadToken();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;
    let retryCount = 0;

    const initAvatar = async (token: string): Promise<StreamingAvatar | null> => {
      try {
        setDebug("Creating new avatar instance");
        const avatarInstance = new StreamingAvatar({ token });
        cleanup = setupEventHandlers(avatarInstance);

        if (!mounted) {
          cleanup?.();
          return null;
        }

        setDebug("Creating avatar...");
        await avatarInstance.createStartAvatar({
          quality: AvatarQuality.Low,
          avatarName: avatarId, // Reverted back to avatarName
          knowledgeId: knowledgeId,
          voice: {
            rate: AVATAR_CONFIG.VOICE_RATE,
          },
          language: language,
          disableIdleTimeout: AVATAR_CONFIG.IDLE_TIMEOUT,
        });

        return avatarInstance;
      } catch (error: any) {
        console.error("Error creating avatar:", error);
        if (error.response) {
          console.error("Error response:", error.response);
        }
        cleanup?.();
        throw error;
      }
    };

    const init = async () => {
      if (!mounted) return;

      try {
        const sessionStartTime = Date.now();
        setDebug(`Starting session at ${new Date(sessionStartTime).toISOString()}`);
        
        // 並列処理1: 既存セッションのクリーンアップとトークン取得を並列化
        const [_, tokenInfo] = await Promise.all([
          avatar.current ? (async () => {
            setDebug("Cleaning up existing session");
            await endSession();
          })() : Promise.resolve(),
          (async () => {
            // トークン取得（プリロードされたトークンがあればそれを使用）
            if (preloadedToken && Date.now() < preloadedToken.expiry) {
              setDebug(`Using preloaded token (valid until ${new Date(preloadedToken.expiry).toISOString()})`);
              return preloadedToken;
            } else {
              const tokenStartTime = Date.now();
              setDebug("No valid preloaded token, fetching new token");
              const newTokenInfo = await fetchAccessToken();
              const tokenFetchTime = Date.now() - tokenStartTime;
              setDebug(`Token fetched in ${tokenFetchTime}ms (valid until ${new Date(newTokenInfo.expiry).toISOString()})`);
              return newTokenInfo;
            }
          })()
        ]);
        
        // トークンを使用
        const token = tokenInfo.token;
        
        if (!token || !mounted) return;

        while (retryCount < MAX_RETRIES) {
          try {
            // 遅延を削減（500msから300msに短縮）
            await delay(300);

            // 計測開始: アバター初期化
            const avatarInitStartTime = Date.now();
            setLoadTimes(prev => ({ ...prev, avatarInitStart: avatarInitStartTime }));
            setDebug(`Avatar initialization started at ${new Date(avatarInitStartTime).toISOString()}`);
            
            const avatarInstance = await initAvatar(token);
            if (!avatarInstance || !mounted) return;

            // 計測終了: アバター初期化
            const avatarInitEndTime = Date.now();
            setLoadTimes(prev => ({ ...prev, avatarInitEnd: avatarInitEndTime }));
            const avatarInitDuration = avatarInitEndTime - (loadTimes.avatarInitStart || avatarInitEndTime);
            
            avatar.current = avatarInstance;
            setDebug(`Avatar created successfully in ${avatarInitDuration}ms`);

            // 遅延を削減（500msから300msに短縮）
            await delay(300);

            // 並列処理2: 音声チャット初期化とUI準備を並列化
            await Promise.all([
              (async () => {
                setDebug("Initializing voice chat...");
                await startVoiceChat(avatarInstance);
                setDebug("Voice chat initialized");
              })(),
              (async () => {
                // UIの準備やその他のリソースの準備
                setDebug("Preparing UI resources...");
                // UIリソースの準備（例: アニメーションの事前計算など）
                setDebug("UI resources prepared");
              })()
            ]);
            
            // 総合パフォーマンス測定結果のログ出力
            if (loadTimes.tokenFetchStart && loadTimes.tokenFetchEnd) {
              const tokenFetchDuration = loadTimes.tokenFetchEnd - loadTimes.tokenFetchStart;
              const totalInitTime = Date.now() - sessionStartTime;
              
              // トークン再利用による時間短縮の計算
              const tokenReuseTime = preloadedToken && Date.now() < preloadedToken.expiry ? 
                `Token reused (saved ~${tokenFetchDuration}ms)` : 
                "New token fetched";
              
              setDebug(`
Performance metrics:
- Token fetch time: ${tokenFetchDuration}ms
- Avatar init time: ${avatarInitDuration}ms
- Total init time: ${totalInitTime}ms
- Token status: ${tokenReuseTime}
- Parallel processing: Enabled
              `.trim());
            }
            
            // Successfully initialized
            return;
          } catch (error: any) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed:`, error);
            setDebug(`Error (attempt ${retryCount}): ${error.message}`);
            
            if (retryCount < MAX_RETRIES) {
              setDebug(`Retrying in ${RETRY_DELAY/1000} seconds...`);
              await delay(RETRY_DELAY);
            } else {
              throw error;
            }
          }
        }
      } catch (error: any) {
        if (mounted) {
          console.error("Session start error:", error);
          setDebug(`Final error: ${error.message}`);
          cleanup?.();
          await endSession();
        }
      }
    };

    setIsLoadingSession(true);
    onLoadingStateChange?.(true);
    init().finally(() => {
      if (mounted) {
        setIsLoadingSession(false);
        onLoadingStateChange?.(false);
      }
    });

    return () => {
      mounted = false;
      cleanup?.();
      endSession();
    };
  }, [setupEventHandlers, avatarId, knowledgeId, language, startVoiceChat, onLoadingStateChange]);

  return (
    <div className="w-full relative">
      <div>
        <Card className="w-full scale-110 mb-8">
          <CardBody className="p-0">
            <div className="w-full bg-black rounded-lg overflow-hidden">
              <div className="relative w-full pt-[56.25%]">
                <div className="absolute top-0 left-0 w-full h-full">
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
                  {stream ? (
                    <video
                      ref={mediaStream}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover object-center"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
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
