"use client";

import InteractiveAvatar from "@/components/interactive-avatar";

export default function ChatPage() {
  return (
    <div className="h-full w-full p-6 flex flex-col">
      <h1 className="text-4xl font-bold mb-8 font-zen-maru-gothic text-center">アシスタントと話す</h1>
      <div className="flex-1">
        <InteractiveAvatar />
      </div>
    </div>
  );
}
