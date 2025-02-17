"use client";

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
import { useEffect, useRef, useState, useCallback } from "react";
import { useMemoizedFn } from "ahooks";
import InteractiveAvatarTextInput from "./interactive-avatar-text-input";
import { AVATARS, STT_LANGUAGE_LIST } from "../app/lib/constants";

interface InteractiveAvatarProps {
  initialKnowledgeId?: string;
  initialAvatarId?: string;
  initialLanguage?: string;
}

export default function InteractiveAvatar({
  initialKnowledgeId = "97ac3c7dcb5742cdbe572ab9d8379342",
  initialAvatarId = "Wayne_20240711",
  initialLanguage = "ja",
}: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>>([]);
  const [knowledgeId] = useState<string>(initialKnowledgeId);
  const [avatarId] = useState<string>(initialAvatarId);
  const [language] = useState<string>(initialLanguage);
  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("voice_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');

  async function fetchAccessToken() {
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
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      setDebug(`Access token error: ${error.message}`);
      throw error;
    }
  }

  const setupEventHandlers = useCallback((avatarInstance: StreamingAvatar) => {
    setDebug("Setting up event handlers");

    const handleAvatarStartTalking = () => {
      setCurrentAvatarMessage('');
    };

    const handleAvatarStopTalking = () => {
      // No action needed
    };

    const handleAvatarTalkingMessage = (message: any) => {
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

    const handleUserTalkingMessage = (message: any) => {
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

    const handleStreamReady = (event: any) => {
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

  const startVoiceChat = useCallback(async (avatarInstance: StreamingAvatar) => {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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

  const handleChangeChatMode = useCallback(async (key: string) => {
    setDebug(`Chat mode change requested: ${key}`);
    if (key === chatMode || !avatar.current) return;

    try {
      if (key === "text_mode") {
        setDebug("Switching to text mode");
        await avatar.current.closeVoiceChat();
        setChatMode("text_mode");
      } else {
        setDebug("Switching to voice mode");
        await startVoiceChat(avatar.current);
        setChatMode("voice_mode");
      }
    } catch (error) {
      console.error("Chat mode change error:", error);
      setDebug(`Chat mode change error: ${error.message}`);
      setChatMode("text_mode");
    }
  }, [chatMode, startVoiceChat]);

  useEffect(() => {
    if (chatMode === "text_mode" && avatar.current) {
      if (text) {
        setDebug("Start listening in text mode");
        avatar.current.startListening();
      } else {
        setDebug("Stop listening in text mode");
        avatar.current.stopListening();
      }
    }
  }, [text, chatMode]);

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

  useEffect(() => {
    const suppressDevToolsMessage = () => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const win = iframe.contentWindow;
      if (win && win.console) {
        win.console.log = () => {};
      }
      document.body.removeChild(iframe);
    };
    suppressDevToolsMessage();
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      if (!mounted) return;

      try {
        setDebug("Starting session...");
        
        const token = await fetchAccessToken();
        if (!token || !mounted) return;

        if (avatar.current) {
          setDebug("Cleaning up existing session");
          await avatar.current.closeVoiceChat().catch(console.error);
          await avatar.current.stopAvatar().catch(console.error);
          avatar.current = null;
          setStream(undefined);
        }

        setDebug("Creating new avatar instance");
        const avatarInstance = new StreamingAvatar({ token });
        cleanup = setupEventHandlers(avatarInstance);

        if (!mounted) {
          cleanup();
          return;
        }

        setDebug("Creating avatar...");
        const res = await avatarInstance.createStartAvatar({
          quality: AvatarQuality.Low,
          avatarName: avatarId,
          knowledgeId: knowledgeId,
          voice: {
            rate: 1.5,
            emotion: VoiceEmotion.EXCITED,
          },
          language: language,
          disableIdleTimeout: true,
        });

        if (!mounted) {
          cleanup();
          return;
        }

        avatar.current = avatarInstance;
        setData(res);
        setDebug("Avatar created successfully");

        if (chatMode === "voice_mode") {
          setDebug("Initializing voice mode...");
          await startVoiceChat(avatarInstance);
          setDebug("Voice mode initialized");
        }
      } catch (error) {
        if (mounted) {
          console.error("Session start error:", error);
          setDebug(`Error: ${error.message}`);
          if (cleanup) cleanup();
          await endSession();
        }
      }
    };

    setIsLoadingSession(true);
    init().finally(() => {
      if (mounted) {
        setIsLoadingSession(false);
      }
    });

    return () => {
      mounted = false;
      if (cleanup) cleanup();
      endSession();
    };
  }, [setupEventHandlers, avatarId, knowledgeId, language, chatMode, startVoiceChat]);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardBody className="relative h-[500px] p-0">
            <div className="h-full w-full bg-black rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                {stream ? (
                  <video
                    ref={mediaStream}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <div className="w-full h-full flex justify-center items-center">
                    <Spinner color="default" size="lg" />
                  </div>
                )}
                
                <div className="absolute top-4 left-0 right-0 z-50 px-4">
                  {currentUserMessage && (
                    <div className="p-2 rounded-lg bg-indigo-100/90 dark:bg-indigo-900/90 ml-auto max-w-[80%] mb-2 shadow-lg">
                      <p className="text-sm font-medium">{currentUserMessage}</p>
                    </div>
                  )}
                  {currentAvatarMessage && (
                    <div className="p-2 rounded-lg bg-gray-100/90 dark:bg-gray-800/90 mr-auto max-w-[80%] shadow-lg">
                      <p className="text-sm font-medium">{currentAvatarMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-3 right-3 z-50 flex flex-col gap-2">
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg shadow-lg"
                  size="md"
                  variant="shadow"
                  onPress={handleInterrupt}
                  isDisabled={!avatar.current}
                  aria-label="アバターの発話を中断"
                >
                  Interrupt task
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg shadow-lg"
                  size="md"
                  variant="shadow"
                  onPress={endSession}
                  isDisabled={!avatar.current}
                  aria-label="セッションを終了"
                >
                  End session
                </Button>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col gap-3 relative">
            <Tabs
              aria-label="Options"
              selectedKey={chatMode}
              onSelectionChange={(key: string) => {
                setDebug(`Tab selection changed: ${key}`);
                void handleChangeChatMode(key);
              }}
            >
              <Tab key="text_mode" title="Text mode" />
              <Tab key="voice_mode" title="Voice mode" />
            </Tabs>
            {chatMode === "text_mode" ? (
              <div className="w-full flex relative">
                <InteractiveAvatarTextInput
                  disabled={!stream}
                  input={text}
                  label="Chat"
                  loading={isLoadingRepeat}
                  placeholder="Type something for the avatar to respond"
                  setInput={setText}
                  onSubmit={handleSpeak}
                />
                {text && (
                  <Chip className="absolute right-16 top-3">Listening</Chip>
                )}
              </div>
            ) : (
              <div className="w-full text-center">
                <Button
                  isDisabled={!isUserTalking}
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white"
                  size="md"
                  variant="shadow"
                  aria-label="音声チャット"
                >
                  {isUserTalking ? "Listening" : "Voice chat"}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <Card className="w-[300px] max-h-[700px]">
          <CardBody>
            <div ref={chatContainerRef} className="flex flex-col gap-2 h-[600px] overflow-y-auto">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 ml-auto' 
                      : 'bg-gray-100 dark:bg-gray-800 mr-auto'
                  } max-w-[80%]`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      <p className="font-mono text-right">
        <span className="font-bold">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}
