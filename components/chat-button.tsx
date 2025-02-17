"use client";

import { Button } from "@nextui-org/react";
import { useState } from "react";
import InteractiveAvatar from "./interactive-avatar";

interface ChatButtonProps {
  knowledgeId: string;
  avatarId: string;
  language: string;
}

export default function ChatButton({ knowledgeId, avatarId, language }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <div className={`transition-all duration-500 ${showChat ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'}`}>
          <img 
            src="/preview_target.webp" 
            alt="アシスタント" 
            className="w-full h-auto rounded-lg scale-110 mb-8"
          />
          <div className="flex justify-center">
            <Button
              className="h-[160px] px-8 bg-[#276204] text-white text-4xl font-zen-maru-gothic rounded-[20px] border-[3px] border-[#98996B] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-opacity-90"
              size="lg"
              variant="solid"
              onPress={() => setShowChat(true)}
              aria-label="アバターとチャットを開始"
            >
              会話をはじめる
            </Button>
          </div>
        </div>
        <div className={`transition-all duration-500 ${showChat ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
          {showChat && (
            <InteractiveAvatar
              initialKnowledgeId={knowledgeId}
              initialAvatarId={avatarId}
              initialLanguage={language}
              setShowChat={setShowChat}
            />
          )}
        </div>
      </div>
    </div>
  );
}
