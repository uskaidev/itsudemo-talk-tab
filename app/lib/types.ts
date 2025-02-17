export {};

declare global {
  interface Window {
    StreamingAvatar: any;
    StreamingEvents: {
      STREAM_READY: string;
      STREAM_DISCONNECTED: string;
      AVATAR_START_TALKING: string;
      AVATAR_STOP_TALKING: string;
      AVATAR_TALKING_MESSAGE: string;
      AVATAR_END_MESSAGE: string;
      USER_TALKING_MESSAGE: string;
      USER_END_MESSAGE: string;
      USER_START: string;
      USER_STOP: string;
    };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface StreamResponse {
  detail: MediaStream;
}

export interface TalkingMessage {
  detail: {
    text: string;
  };
}
