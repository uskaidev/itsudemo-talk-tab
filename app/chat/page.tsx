"use client";

import ChatButton from "@/components/chat-button";
import { PageViewTracker } from "@/components/page-view-tracker";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <div className="h-full w-full p-6 flex flex-col items-center">
      <Suspense>
        <PageViewTracker />
      </Suspense>
      <h1 className="text-4xl font-bold mb-4 font-zen-maru-gothic text-center">アシスタントと話す</h1>
      <h2 className="text-lg mb-12 text-center">「会話をはじめる」ボタンをタッチして、アシスタントが表示されたらご自由に話かけてください。</h2>
      <ChatButton
        knowledgeId="97ac3c7dcb5742cdbe572ab9d8379342"
        avatarId="f0c626a25c6f4f87841630b9acc66482"
        language="ja"
      />
    </div>
  );
}
