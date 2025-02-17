"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

type StreamingEvents = {
  STREAM_READY: string;
  STREAM_DISCONNECTED: string;
  TALKING_START: string;
  TALKING_END: string;
}

type StreamingAvatar = {
  new(options: { token: string }): any;
  on(event: string, callback: (event: any) => void): void;
  speak(options: { text: string; task_type: string }): Promise<void>;
}

declare global {
  interface Window {
    StreamingAvatar?: StreamingAvatar;
    StreamingEvents?: StreamingEvents;
  }
}

export default function AvatarTestPage() {
  const [status, setStatus] = useState<string>("準備中...")
  const [userInput, setUserInput] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const avatarRef = useRef<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !avatarRef.current || isSending) return;

    try {
      setIsSending(true);
      await avatarRef.current.speak({
        text: userInput,
        task_type: "repeat"
      });
      setUserInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus("エラーが発生しました");
    } finally {
      setIsSending(false);
    }
  };

  const initializeAvatar = async () => {
    try {
      if (!window.StreamingAvatar || !window.StreamingEvents) {
        console.error("StreamingAvatar SDK not loaded");
        setStatus("SDKの読み込みに失敗しました");
        return;
      }

      console.log("Fetching access token...");
      const response = await fetch("/api/heygen/token", {
        method: "POST"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token fetch error:", errorData);
        setStatus("トークンの取得に失敗しました");
        throw new Error(errorData.error || `Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      console.log("Token API response:", data);
      
      if (!data.data?.token) {
        console.error("Invalid token response:", data);
        setStatus("トークンの形式が不正です");
        return;
      }

      console.log("Token received, initializing avatar...");
      const avatar = new window.StreamingAvatar({ token: data.data.token });
      avatarRef.current = avatar;

      avatar.on(window.StreamingEvents.STREAM_READY, (event: any) => {
        console.log("Stream ready:", event);
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
        setStatus("準備完了");
      });

      avatar.on(window.StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        setStatus("切断されました");
      });

      avatar.on(window.StreamingEvents.TALKING_START, () => {
        setStatus("話し中...");
      });

      avatar.on(window.StreamingEvents.TALKING_END, () => {
        setStatus("準備完了");
      });

      // 初期の挨拶
      setTimeout(() => {
        avatar.speak({
          text: "こんにちは！気軽に話しかけてください。",
          task_type: "repeat"
        });
      }, 2000);

    } catch (error) {
      console.error("Failed to initialize avatar:", error);
      setStatus("初期化に失敗しました");
    }
  };

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <Script
        src="https://sdk.heygen.ai/streaming-avatar/latest/streaming-avatar.min.js"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("Failed to load SDK:", e);
          setStatus("SDKの読み込みに失敗しました");
        }}
        onLoad={() => {
          console.log("SDK loaded successfully");
          initializeAvatar();
        }}
      />

      <h1 className="text-4xl font-bold mb-8 font-zen-maru-gothic text-center">
        アシスタントと話す - {status}
      </h1>

      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-5xl mx-auto mb-6">
          <div className="w-full h-0 pb-[56.25%] relative">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full bg-white rounded-lg"
              autoPlay
              playsInline
            />
          </div>
        </div>
        
        <div className="w-full max-w-5xl mx-auto mt-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending || status !== "準備完了"}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending || !userInput.trim() || status !== "準備完了"}
            >
              {isSending ? "送信中..." : "送信"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
