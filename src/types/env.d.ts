/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_AI_URL?: string;
    readonly EXPO_PUBLIC_APP_TOKEN?: string;
  }
}
