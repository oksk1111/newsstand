declare const __DEV__: boolean;

// Extend the global interface for environment variables
declare module '@env' {
  export const API_BASE_URL: string;
  export const NODE_ENV: string;
}
