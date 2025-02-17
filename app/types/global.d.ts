import type StreamingAvatar from "@heygen/streaming-avatar";

declare global {
  interface Window {
    StreamingAvatar: typeof StreamingAvatar;
  }
}

export {};
