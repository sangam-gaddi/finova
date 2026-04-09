export type VoraOsCommand =
  | { type: 'open_app'; appId: string; data?: Record<string, unknown> }
  | { type: 'close_app'; appId: string; data?: Record<string, unknown> };
