"use client";

import ChatButton from "@/components/chat-button";

export default function ChatPage() {
  return (
    <div className="h-full w-full p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-12 font-zen-maru-gothic text-center">アシスタントと話す</h1>
      <ChatButton
        knowledgeId="97ac3c7dcb5742cdbe572ab9d8379342"
        avatarId="Wayne_20240711"
        language="ja"
      />
    </div>
  );
}
