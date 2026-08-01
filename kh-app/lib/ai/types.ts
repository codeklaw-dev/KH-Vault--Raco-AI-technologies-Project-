import type { Role, Lang } from '../types';

export type AiRole = 'user' | 'assistant';

export interface AiMessage {
  role: AiRole;
  text: string;
}

export interface AiContext {
  role: Role;
  lang: Lang;
  supplierId?: string;
}

export type AiActionKind =
  | 'open_deal'
  | 'open_shipment'
  | 'open_supplier'
  | 'approve_deal'
  | 'update_shipment'
  | 'copy_invite'
  | 'draft';

export interface AiAction {
  kind: AiActionKind;
  label: string;
  labelAr: string;
  /** id/ref/text the action operates on (dealId, shipmentId, supplierId, or draft body) */
  payload: string;
}

export interface AiResponse {
  text: string;
  actions?: AiAction[];
  /** related refs offered as tappable suggestions when nothing matched */
  refs?: { kind: AiActionKind; label: string; payload: string }[];
}

export interface AiProvider {
  id: string;
  send(messages: AiMessage[], ctx: AiContext): Promise<AiResponse>;
}
