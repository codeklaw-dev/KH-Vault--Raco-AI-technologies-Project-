import { create } from 'zustand';
import { getProvider } from '../ai';
import type { AiMessage, AiContext, AiAction } from '../ai/types';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: AiAction[];
  refs?: { kind: AiAction['kind']; label: string; payload: string }[];
}

interface AssistantState {
  messages: ChatTurn[];
  busy: boolean;
  send: (text: string, ctx: AiContext) => Promise<void>;
  reset: () => void;
}

let seq = 0;
const nextId = () => `m-${Date.now()}-${seq++}`;

export const useAssistant = create<AssistantState>((set, get) => ({
  messages: [],
  busy: false,
  send: async (text, ctx) => {
    const trimmed = text.trim();
    if (!trimmed || get().busy) return;
    const userTurn: ChatTurn = { id: nextId(), role: 'user', text: trimmed };
    set((s) => ({ messages: [...s.messages, userTurn], busy: true }));

    const history: AiMessage[] = get().messages.map((m) => ({ role: m.role, text: m.text }));
    try {
      const res = await getProvider().send(history, ctx);
      const aiTurn: ChatTurn = {
        id: nextId(),
        role: 'assistant',
        text: res.text,
        actions: res.actions,
        refs: res.refs,
      };
      set((s) => ({ messages: [...s.messages, aiTurn], busy: false }));
    } catch {
      const errTurn: ChatTurn = {
        id: nextId(),
        role: 'assistant',
        text:
          ctx.lang === 'ar'
            ? 'حدث خطأ ما. حاول مرة أخرى.'
            : 'Something went wrong. Please try again.',
      };
      set((s) => ({ messages: [...s.messages, errTurn], busy: false }));
    }
  },
  reset: () => set({ messages: [], busy: false }),
}));
