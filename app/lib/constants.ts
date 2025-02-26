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
    id: "7438b2e84aed4f9fbf64453080e58651",
    name: "natsumi",
    voiceId: "4ca81ea8f1654aa18cc15802d50fa15e",
    defaultLanguage: "ja"
  }
];

// Language configurations
export const STT_LANGUAGE_LIST: Language[] = [
  {
    code: "ja",
    name: "Japanese",
    voiceId: "4ca81ea8f1654aa18cc15802d50fa15e"
  },
  {
    code: "en",
    name: "English",
    voiceId: "4ca81ea8f1654aa18cc15802d50fa15e"
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
  VOICE_RATE: 0.85,
  VOICE_EMOTION: "soothing" as const,
  IDLE_TIMEOUT: false
};
