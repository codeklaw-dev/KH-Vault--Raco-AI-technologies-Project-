/**
 * AI provider configuration.
 *
 * The demo ships with a scripted offline "mock brain". To run the assistant on
 * the client's own private model instead, set these Expo public env vars and the
 * RemoteProvider is selected automatically — no UI changes required.
 *
 *   EXPO_PUBLIC_AI_BASE_URL  e.g. https://ai.kh-timber.internal/v1/chat
 *   EXPO_PUBLIC_AI_MODEL     e.g. kh-ops-1
 *   EXPO_PUBLIC_AI_KEY       bearer token for the endpoint
 */
export const aiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_AI_BASE_URL ?? '',
  model: process.env.EXPO_PUBLIC_AI_MODEL ?? '',
  apiKey: process.env.EXPO_PUBLIC_AI_KEY ?? '',
  /** how long to wait on the remote model before falling back to the mock brain */
  timeoutMs: 12000,
};

export function isRemoteConfigured(): boolean {
  return aiConfig.baseUrl.trim().length > 0;
}
