"use client";

import { Button } from "@nextui-org/react";
import { useState, useCallback } from "react";
import InteractiveAvatar from "./interactive-avatar";

interface ChatButtonProps {
  knowledgeId: string;
  avatarId: string;
  language: string;
}

export default function ChatButton({ knowledgeId, avatarId, language }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingStateChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        {/* アバター画像とチャットインターフェース */}
        <div className="mb-8">
          <div className="relative">
            <img 
              src="/preview_target.webp" 
              alt="アシスタント" 
              className={`w-full h-auto rounded-lg scale-110 transition-opacity duration-500 ${showChat ? 'opacity-0' : 'opacity-100'}`}
            />
            <div className={`absolute inset-0 transition-opacity duration-500 ${showChat ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {showChat && (
                <InteractiveAvatar
                  initialKnowledgeId={knowledgeId}
                  initialAvatarId={avatarId}
                  initialLanguage={language}
                  setShowChat={setShowChat}
                  onLoadingStateChange={handleLoadingStateChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* ボタングループ */}
        <div className="flex justify-center gap-4">
          <Button
            className={`h-[160px] w-[320px] px-8 text-white text-4xl font-zen-maru-gothic rounded-[20px] border-[3px] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] transition-all duration-300 ${
              !showChat && !isLoading
                ? 'bg-[#276204] border-[#98996B] hover:bg-opacity-90'
                : 'bg-[#6B7280] border-[#6B7280] cursor-not-allowed'
            }`}
            size="lg"
            variant="solid"
            onPress={() => !isLoading && setShowChat(true)}
            isDisabled={showChat || isLoading}
            aria-label="アバターとチャットを開始"
          >
            会話をはじめる
          </Button>

          <Button
            className={`h-[160px] w-[320px] px-8 text-white text-4xl font-zen-maru-gothic rounded-[20px] border-[3px] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] transition-all duration-300 ${
              showChat && !isLoading
                ? 'bg-[#620427] border-[#996B7D] hover:bg-opacity-90'
                : 'bg-[#6B7280] border-[#6B7280] cursor-not-allowed'
            }`}
            size="lg"
            variant="solid"
            onPress={() => !isLoading && setShowChat(false)}
            isDisabled={!showChat || isLoading}
            aria-label="会話をやめる"
          >
            会話をやめる
          </Button>
        </div>
      </div>
    </div>
  );
}
