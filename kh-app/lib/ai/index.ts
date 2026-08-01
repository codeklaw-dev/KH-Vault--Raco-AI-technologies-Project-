import type { AiProvider } from './types';
import { isRemoteConfigured } from './config';
import { mockProvider } from './mockBrain';
import { remoteProvider } from './remoteProvider';

export * from './types';

/**
 * The single swap point. With no env config the offline mock brain runs; set
 * EXPO_PUBLIC_AI_BASE_URL and the client's private model is used instead — no UI
 * changes needed.
 */
export function getProvider(): AiProvider {
  return isRemoteConfigured() ? remoteProvider : mockProvider;
}
