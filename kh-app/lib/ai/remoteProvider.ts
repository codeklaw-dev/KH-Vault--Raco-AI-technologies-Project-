import type { AiProvider, AiMessage, AiContext, AiResponse, AiAction } from './types';
import { aiConfig } from './config';
import { mockProvider } from './mockBrain';

/**
 * Talks to the client's own private model. Expects a JSON response shaped like:
 *   { "text": string, "actions"?: AiAction[] }
 * On any error or timeout it falls back to the offline mock brain and appends a
 * quiet notice so the demo never crashes.
 */
async function callRemote(messages: AiMessage[], ctx: AiContext): Promise<AiResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), aiConfig.timeoutMs);
  try {
    const res = await fetch(aiConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(aiConfig.apiKey ? { Authorization: `Bearer ${aiConfig.apiKey}` } : null),
      },
      body: JSON.stringify({
        model: aiConfig.model,
        context: { role: ctx.role, lang: ctx.lang, supplierId: ctx.supplierId },
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`AI endpoint ${res.status}`);
    const data = await res.json();
    const text: string =
      typeof data?.text === 'string'
        ? data.text
        : data?.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('Empty AI response');
    const actions: AiAction[] | undefined = Array.isArray(data?.actions) ? data.actions : undefined;
    return { text, actions };
  } finally {
    clearTimeout(timer);
  }
}

export const remoteProvider: AiProvider = {
  id: 'remote',
  async send(messages: AiMessage[], ctx: AiContext): Promise<AiResponse> {
    try {
      return await callRemote(messages, ctx);
    } catch {
      const fallback = await mockProvider.send(messages, ctx);
      const notice =
        ctx.lang === 'ar'
          ? '\n\n(تعذّر الوصول إلى النموذج الخاص — هذا رد غير متصل.)'
          : "\n\n(Couldn't reach the private model — this is an offline reply.)";
      return { ...fallback, text: fallback.text + notice };
    }
  },
};
