// Types
export interface Avatar {
  id: string;
  name: string;
  voiceId?: string;
  defaultLanguage?: string;
}

export interface Language {
  code: string;
  name: string;
  voiceId?: string;
}

// Avatar configurations
export const AVATARS: Avatar[] = [
  {
    id: "f0c626a25c6f4f87841630b9acc66482",
    name: "Wayne",
    voiceId: "1bd001e7e89244f5b01e5f36c3c7b926",
    defaultLanguage: "ja"
  }
];

// Language configurations
export const STT_LANGUAGE_LIST: Language[] = [
  {
    code: "ja",
    name: "Japanese",
    voiceId: "1bd001e7e89244f5b01e5f36c3c7b926"
  },
  {
    code: "en",
    name: "English",
    voiceId: "1bd001e7e89244f5b01e5f36c3c7b926"
  }
];

// API configurations
export const API_CONFIG = {
  TIMEOUT_MS: 10000,
  BASE_URL: "https://api.heygen.com/v1",
  ENDPOINTS: {
    CREATE_TOKEN: "/streaming.create_token",
    STOP_ALL: "/streaming_avatar.stop_all"
  }
};

// Avatar configurations
export const AVATAR_CONFIG = {
  QUALITY: "low" as const,
  VOICE_RATE: 0.5,
  VOICE_EMOTION: "soothing" as const,
  IDLE_TIMEOUT: false
};
