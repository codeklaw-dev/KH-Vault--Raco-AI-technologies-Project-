import type { AiProvider, AiMessage, AiContext, AiResponse, AiAction } from './types';
import type { Lang, Deal, Supplier } from '../types';
import {
  dealsForRole,
  shipmentsForRole,
  getSupplier,
  pendingApprovals,
} from '../store/selectors';
import { suppliers as allSuppliers } from '../data/seed';
import { useOps } from '../store/useOps';
import { fmtMoney, fmtNumber, fmtDate } from '../format';

/* ---------------- localization helpers ---------------- */

const L = (lang: Lang, en: string, ar: string) => (lang === 'ar' ? ar : en);

/** localized object field (title / titleAr, etc.) */
function lf(obj: Record<string, any>, field: string, lang: Lang): string {
  if (lang === 'ar') return obj[field + 'Ar'] ?? obj[field] ?? '';
  return obj[field] ?? '';
}

const statusLabel: Record<string, { en: string; ar: string }> = {
  negotiation: { en: 'Negotiation', ar: 'تفاوض' },
  confirmed: { en: 'Confirmed', ar: 'مؤكدة' },
  in_production: { en: 'In Production', ar: 'قيد الإنتاج' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التسليم' },
  closed: { en: 'Closed', ar: 'مغلقة' },
  preparing: { en: 'Preparing', ar: 'قيد التجهيز' },
  at_port: { en: 'At Port', ar: 'في الميناء' },
  in_transit: { en: 'In Transit', ar: 'قيد النقل' },
  customs: { en: 'Customs', ar: 'الجمارك' },
  out_for_delivery: { en: 'Out for Delivery', ar: 'خارج للتسليم' },
};

const st = (status: string, lang: Lang) =>
  lang === 'ar' ? statusLabel[status]?.ar ?? status : statusLabel[status]?.en ?? status;

/* ---------------- action builders ---------------- */

const approveAction = (d: Deal): AiAction => ({
  kind: 'approve_deal',
  label: `Approve ${d.ref}`,
  labelAr: `الموافقة على ${d.ref}`,
  payload: d.id,
});

const openDealAction = (d: Deal): AiAction => ({
  kind: 'open_deal',
  label: `Open ${d.ref}`,
  labelAr: `فتح ${d.ref}`,
  payload: d.id,
});

const openShipmentAction = (ref: string, id: string): AiAction => ({
  kind: 'open_shipment',
  label: `Track ${ref}`,
  labelAr: `تتبّع ${ref}`,
  payload: id,
});

const openSupplierAction = (s: Supplier): AiAction => ({
  kind: 'open_supplier',
  label: `Open ${s.company}`,
  labelAr: `فتح ${s.company}`,
  payload: s.id,
});

const draftAction = (body: string): AiAction => ({
  kind: 'draft',
  label: 'Copy draft',
  labelAr: 'نسخ المسودة',
  payload: body,
});

/* ---------------- matchers ---------------- */

function findDealRef(q: string): string | null {
  const m = q.match(/\b(?:kh[-\s]?)?(\d{4})\b/i);
  return m ? m[1] : null;
}
function findShipmentRef(q: string): string | null {
  const m = q.match(/\bshp[-\s]?(\d{4})\b/i);
  return m ? m[1] : null;
}

function matchSupplierByName(q: string): Supplier | undefined {
  const lower = q.toLowerCase();
  return allSuppliers.find((s) => {
    const words = s.company.toLowerCase().split(/\s+/);
    return words.some((w) => w.length > 3 && lower.includes(w));
  });
}

function matchCategory(q: string): { supplier: Supplier; category: string }[] {
  const lower = q.toLowerCase();
  const out: { supplier: Supplier; category: string }[] = [];
  for (const s of allSuppliers) {
    for (const c of s.categories) {
      if (lower.includes(c.toLowerCase())) out.push({ supplier: s, category: c });
    }
  }
  return out;
}

const isApproved = (id: string) => useOps.getState().approvedDealIds.has(id);

/* ---------------- intent handlers ---------------- */

function handleApprovalForRef(ref: string, ctx: AiContext): AiResponse | null {
  const visible = dealsForRole(ctx.role, ctx.supplierId);
  const deal = visible.find((d) => d.ref.includes(ref));
  if (!deal) return null;
  const { lang } = ctx;
  const title = lf(deal, 'title', lang);
  const supplier = getSupplier(deal.supplierId);
  const supName = supplier?.company ?? '';
  const value = fmtMoney(deal.value, lang, deal.currency);
  const vol = `${fmtNumber(deal.volume, lang)} ${deal.unit}`;

  if (ctx.role === 'supplier') {
    return {
      text: L(lang, `Approvals are handled by the KH Timber team — that's outside your portal.`, `الموافقات تتم من قِبل فريق KH للأخشاب — وهي خارج نطاق بوابتك.`),
    };
  }
  if (!deal.needsApproval) {
    return {
      text: L(lang,
        `${deal.ref} doesn't need approval — it's currently ${st(deal.status, lang)}.`,
        `${deal.ref} لا تحتاج إلى موافقة — حالتها حالياً ${st(deal.status, lang)}.`),
      actions: [openDealAction(deal)],
    };
  }
  if (isApproved(deal.id)) {
    return {
      text: L(lang, `${deal.ref} is already approved — no action needed.`, `${deal.ref} تمت الموافقة عليها بالفعل — لا حاجة لإجراء.`),
      actions: [openDealAction(deal)],
    };
  }
  const rating = supplier ? supplier.rating.toFixed(1) : '—';
  return {
    text: L(lang,
      `${deal.ref} — ${title}\n${supName} · ${value} · ${vol}\nSupplier rating ${rating}/5. The numbers and supplier history look solid, so this is a reasonable approval. Review the terms, then confirm below.`,
      `${deal.ref} — ${title}\n${supName} · ${value} · ${vol}\nتقييم المورّد ${rating}/5. الأرقام وسجل المورّد جيدة، لذا فالموافقة معقولة. راجع الشروط ثم أكّد أدناه.`),
    actions: [approveAction(deal), openDealAction(deal)],
  };
}

function handleApprovalQueue(ctx: AiContext): AiResponse {
  const { lang } = ctx;
  if (ctx.role === 'supplier') {
    return {
      text: L(lang, `You don't have any approvals — those sit with the KH Timber team.`, `لا توجد لديك موافقات — فهي من اختصاص فريق KH للأخشاب.`),
    };
  }
  const pending = pendingApprovals().filter((d) => !isApproved(d.id));
  if (pending.length === 0) {
    return {
      text: L(lang, `You're all caught up — nothing is waiting for approval.`, `كل شيء على ما يرام — لا توجد موافقات معلّقة.`),
    };
  }
  const lines = pending.map((d) => {
    const supplier = getSupplier(d.supplierId);
    const value = fmtMoney(d.value, lang, d.currency);
    return L(lang,
      `• ${d.ref} — ${lf(d, 'title', lang)} (${supplier?.company ?? ''}, ${value})`,
      `• ${d.ref} — ${lf(d, 'title', lang)} (${supplier?.company ?? ''}، ${value})`);
  });
  const head = L(lang,
    `${pending.length} ${pending.length === 1 ? 'deal needs' : 'deals need'} your approval:`,
    `${fmtNumber(pending.length, lang)} ${pending.length === 1 ? 'صفقة تحتاج' : 'صفقات تحتاج'} إلى موافقتك:`);
  return {
    text: `${head}\n${lines.join('\n')}`,
    actions: pending.map(approveAction),
  };
}

function handleBriefing(ctx: AiContext): AiResponse {
  const { lang } = ctx;
  const deals = dealsForRole(ctx.role, ctx.supplierId);
  const shipments = shipmentsForRole(ctx.role, ctx.supplierId);

  if (ctx.role === 'supplier') {
    const active = deals.filter((d) => d.status !== 'delivered' && d.status !== 'closed');
    const inTransit = shipments.filter((s) => s.status !== 'delivered');
    const lines = [
      L(lang, `Here's your briefing:`, `إليك ملخّصك:`),
      L(lang, `• ${active.length} active deal(s)`, `• ${fmtNumber(active.length, lang)} صفقة نشطة`),
      ...shipments.map((s) =>
        L(lang, `• ${s.ref}: ${st(s.status, lang)} (${s.progressPct}%)`, `• ${s.ref}: ${st(s.status, lang)} (${fmtNumber(s.progressPct, lang)}٪)`)),
    ];
    const acts = inTransit.map((s) => openShipmentAction(s.ref, s.id));
    return { text: lines.join('\n'), actions: acts.length ? acts : undefined };
  }

  const pending = pendingApprovals().filter((d) => !isApproved(d.id));
  const negotiating = deals.filter((d) => d.status === 'negotiation');
  const inTransit = shipments.filter((s) => s.status === 'in_transit' || s.status === 'preparing');
  const pipeline = deals
    .filter((d) => d.status !== 'delivered' && d.status !== 'closed')
    .reduce((sum, d) => sum + d.value, 0);
  const lines = [
    L(lang, `Good to see you. Here's where things stand today:`, `سعيد برؤيتك. إليك ملخّص اليوم:`),
    L(lang, `• ${pending.length} deal(s) awaiting your approval`, `• ${fmtNumber(pending.length, lang)} صفقة بانتظار موافقتك`),
    L(lang, `• ${negotiating.length} deal(s) in negotiation`, `• ${fmtNumber(negotiating.length, lang)} صفقة قيد التفاوض`),
    L(lang, `• ${inTransit.length} shipment(s) in motion`, `• ${fmtNumber(inTransit.length, lang)} شحنة قيد الحركة`),
    L(lang, `• Open pipeline value ${fmtMoney(pipeline, lang)}`, `• قيمة الصفقات المفتوحة ${fmtMoney(pipeline, lang)}`),
  ];
  return {
    text: lines.join('\n'),
    actions: pending.length ? pending.map(approveAction) : undefined,
  };
}

function handleDraft(q: string, ctx: AiContext): AiResponse {
  const { lang } = ctx;
  const deals = dealsForRole(ctx.role, ctx.supplierId);
  const ref = findDealRef(q);
  const supplier = matchSupplierByName(q);
  const deal =
    (ref && deals.find((d) => d.ref.includes(ref))) ||
    (supplier && deals.find((d) => d.supplierId === supplier.id)) ||
    deals[0];

  const isDelay = /delay|late|push|postpone|تأخير|تأجيل/i.test(q);

  if (ctx.role === 'supplier') {
    const refTxt = deal ? deal.ref : '';
    const body = L(lang,
      `Hi KH Timber team,\n\nQuick update on ${refTxt}: production is on track and we expect to meet the agreed timeline. I'll upload documents as each milestone completes.\n\nBest regards,\nAmazon Timber Exports`,
      `مرحباً فريق KH للأخشاب،\n\nتحديث سريع بخصوص ${refTxt}: الإنتاج يسير وفق الخطة ونتوقّع الالتزام بالجدول المتفق عليه. سأرفع المستندات مع اكتمال كل مرحلة.\n\nمع التحية،\nأمازون لتصدير الأخشاب`);
    return {
      text: L(lang, `Here's a draft update to KH Timber:`, `إليك مسودة تحديث إلى KH للأخشاب:`) + `\n\n${body}`,
      actions: [draftAction(body)],
    };
  }

  const sup = supplier ?? (deal ? getSupplier(deal.supplierId) : undefined);
  const contact = sup?.contact ?? 'there';
  const refTitle = deal ? `${deal.ref} (${lf(deal, 'title', lang)})` : '';
  const body = isDelay
    ? L(lang,
        `Hi ${contact},\n\nWe wanted to flag a possible delay on ${refTitle}. Could you confirm the revised production and shipping timeline at your earliest convenience? Please let us know if anything on our side can help keep things moving.\n\nBest regards,\nKH Timber & Co.`,
        `مرحباً ${contact}،\n\nنودّ الإشارة إلى احتمال تأخّر في ${refTitle}. هل يمكنك تأكيد الجدول الزمني المُحدَّث للإنتاج والشحن في أقرب وقت؟ أخبرنا إن كان بإمكاننا المساعدة في تسريع الأمور.\n\nمع التحية،\nKH للأخشاب وشركاه`)
    : L(lang,
        `Hi ${contact},\n\nFollowing up on ${refTitle}. Could you share the latest status and any documents ready on your side? Happy to jump on a call if helpful.\n\nBest regards,\nKH Timber & Co.`,
        `مرحباً ${contact}،\n\nمتابعةً بخصوص ${refTitle}. هل يمكنك مشاركة آخر المستجدات وأي مستندات جاهزة لديك؟ يسعدنا ترتيب مكالمة إن كان ذلك مفيداً.\n\nمع التحية،\nKH للأخشاب وشركاه`);
  return {
    text: L(lang, `Here's a draft you can send:`, `إليك مسودة يمكنك إرسالها:`) + `\n\n${body}`,
    actions: [draftAction(body), ...(deal ? [openDealAction(deal)] : [])],
  };
}

function handleSourcing(q: string, ctx: AiContext): AiResponse | null {
  const { lang } = ctx;
  if (ctx.role === 'supplier') {
    return {
      text: L(lang, `Supplier sourcing is available to the KH Timber team — that's outside your portal.`, `البحث عن الموردين متاح لفريق KH للأخشاب — وهو خارج نطاق بوابتك.`),
    };
  }
  const matches = matchCategory(q);
  if (matches.length === 0) return null;
  const seen = new Set<string>();
  const unique = matches.filter((m) => (seen.has(m.supplier.id) ? false : (seen.add(m.supplier.id), true)));
  const ranked = unique.sort((a, b) => b.supplier.rating - a.supplier.rating);
  const lines = ranked.map((m) =>
    L(lang,
      `• ${m.supplier.company} ${m.supplier.countryCode} — ${m.category}, rated ${m.supplier.rating.toFixed(1)}/5`,
      `• ${m.supplier.company} ${m.supplier.countryCode} — ${m.category}، التقييم ${m.supplier.rating.toFixed(1)}/5`));
  return {
    text: L(lang,
      `${ranked.length} supplier(s) match that:\n${lines.join('\n')}`,
      `${fmtNumber(ranked.length, lang)} مورّد مطابق:\n${lines.join('\n')}`),
    actions: ranked.slice(0, 4).map((m) => openSupplierAction(m.supplier)),
  };
}

function handleDealLookup(ref: string, ctx: AiContext): AiResponse {
  const { lang } = ctx;
  const visible = dealsForRole(ctx.role, ctx.supplierId);
  const deal = visible.find((d) => d.ref.includes(ref));
  if (!deal) {
    // exists globally but not visible to a supplier → decline
    const global = dealsForRole('owner').find((d) => d.ref.includes(ref));
    if (global && ctx.role === 'supplier') {
      return { text: L(lang, `That deal isn't part of your portal.`, `هذه الصفقة ليست ضمن بوابتك.`) };
    }
    return suggestClosest(ref, ctx, 'deal');
  }
  const supplier = getSupplier(deal.supplierId);
  const shipment = shipmentsForRole(ctx.role, ctx.supplierId).find((s) => s.dealId === deal.id);
  const lines = [
    `${deal.ref} — ${lf(deal, 'title', lang)}`,
    L(lang, `Status: ${st(deal.status, lang)}`, `الحالة: ${st(deal.status, lang)}`),
    L(lang, `Supplier: ${supplier?.company ?? '—'}`, `المورّد: ${supplier?.company ?? '—'}`),
    L(lang, `Value: ${fmtMoney(deal.value, lang, deal.currency)} · ${fmtNumber(deal.volume, lang)} ${deal.unit}`, `القيمة: ${fmtMoney(deal.value, lang, deal.currency)} · ${fmtNumber(deal.volume, lang)} ${deal.unit}`),
    L(lang, `Route: ${deal.origin} → ${deal.destination}`, `المسار: ${deal.origin} ← ${deal.destination}`),
  ];
  const actions: AiAction[] = [openDealAction(deal)];
  if (shipment) actions.push(openShipmentAction(shipment.ref, shipment.id));
  if (deal.needsApproval && !isApproved(deal.id) && ctx.role !== 'supplier') actions.unshift(approveAction(deal));
  return { text: lines.join('\n'), actions };
}

function handleShipmentLookup(ref: string, ctx: AiContext): AiResponse {
  const { lang } = ctx;
  const visible = shipmentsForRole(ctx.role, ctx.supplierId);
  const shipment = visible.find((s) => s.ref.includes(ref));
  if (!shipment) {
    const global = shipmentsForRole('owner').find((s) => s.ref.includes(ref));
    if (global && ctx.role === 'supplier') {
      return { text: L(lang, `That shipment isn't part of your portal.`, `هذه الشحنة ليست ضمن بوابتك.`) };
    }
    return suggestClosest(ref, ctx, 'shipment');
  }
  const lines = [
    `${shipment.ref}`,
    L(lang, `Status: ${st(shipment.status, lang)} (${shipment.progressPct}%)`, `الحالة: ${st(shipment.status, lang)} (${fmtNumber(shipment.progressPct, lang)}٪)`),
    L(lang, `Route: ${lf(shipment, 'origin', lang)} → ${lf(shipment, 'destination', lang)}`, `المسار: ${lf(shipment, 'origin', lang)} ← ${lf(shipment, 'destination', lang)}`),
    L(lang, `ETA: ${fmtDate(shipment.eta, lang)}`, `الوصول المتوقع: ${fmtDate(shipment.eta, lang)}`),
  ];
  return { text: lines.join('\n'), actions: [openShipmentAction(shipment.ref, shipment.id)] };
}

function handleSupplierLookup(supplier: Supplier, ctx: AiContext): AiResponse {
  const { lang } = ctx;
  if (ctx.role === 'supplier' && supplier.id !== ctx.supplierId) {
    return { text: L(lang, `That's outside your portal — you can only see your own profile.`, `هذا خارج نطاق بوابتك — يمكنك رؤية ملفك فقط.`) };
  }
  const lines = [
    `${supplier.company} ${supplier.countryCode}`,
    L(lang, `Status: ${st(supplier.status, lang) ?? supplier.status}`, `الحالة: ${supplier.status}`),
    L(lang, `Rating: ${supplier.rating.toFixed(1)}/5`, `التقييم: ${supplier.rating.toFixed(1)}/5`),
    L(lang, `Supplies: ${supplier.categories.join(', ')}`, `يورّد: ${supplier.categories.join('، ')}`),
    L(lang, `Active deals: ${fmtNumber(supplier.activeDeals, lang)}`, `صفقات نشطة: ${fmtNumber(supplier.activeDeals, lang)}`),
  ];
  return { text: lines.join('\n'), actions: [openSupplierAction(supplier)] };
}

function suggestClosest(ref: string, ctx: AiContext, kind: 'deal' | 'shipment'): AiResponse {
  const { lang } = ctx;
  if (kind === 'shipment') {
    const opts = shipmentsForRole(ctx.role, ctx.supplierId);
    return {
      text: L(lang, `I couldn't find SHP-${ref}. Did you mean one of these?`, `لم أعثر على SHP-${ref}. هل تقصد إحدى هذه؟`),
      refs: opts.map((s) => ({ kind: 'open_shipment', label: s.ref, payload: s.id })),
    };
  }
  const opts = dealsForRole(ctx.role, ctx.supplierId);
  return {
    text: L(lang, `I couldn't find KH-${ref}. Did you mean one of these?`, `لم أعثر على KH-${ref}. هل تقصد إحدى هذه؟`),
    refs: opts.map((d) => ({ kind: 'open_deal', label: d.ref, payload: d.id })),
  };
}

function handleFallback(ctx: AiContext): AiResponse {
  const { lang } = ctx;
  const examples =
    ctx.role === 'supplier'
      ? L(lang, `Try: "Where's my shipment?", "Brief me", or "Draft an update to KH Timber".`, `جرّب: «أين شحنتي؟»، «لخّص لي»، أو «اكتب تحديثاً إلى KH للأخشاب».`)
      : L(lang, `Try: "What needs my approval?", "Brief me on today", "Look up KH-1042", or "Find an oak supplier".`, `جرّب: «ما الذي يحتاج موافقتي؟»، «لخّص لي اليوم»، «ابحث عن KH-1042»، أو «أوجد مورّد بلوط».`);
  return {
    text: L(lang, `I'm grounded in your live deals, shipments and suppliers. ${examples}`, `أعتمد على صفقاتك وشحناتك ومورّديك الحاليين. ${examples}`),
  };
}

/* ---------------- provider ---------------- */

function reply(q: string, ctx: AiContext): AiResponse {
  const lower = q.toLowerCase();
  const dealRef = findDealRef(q);
  const shipRef = findShipmentRef(q);

  // 1. Specific approval question
  if (/approv|موافق/i.test(lower) && dealRef) {
    const r = handleApprovalForRef(dealRef, ctx);
    if (r) return r;
  }
  // 2. Approval queue
  if (/approv|pending|sign off|موافق|معلّق|بانتظار/i.test(lower)) {
    return handleApprovalQueue(ctx);
  }
  // 3. Briefing
  if (/brief|briefing|today|summary|overview|what'?s (going on|happening)|catch me up|لخّص|ملخّص|اليوم|نظرة عامة/i.test(lower)) {
    return handleBriefing(ctx);
  }
  // 4. Draft
  if (/draft|write|compose|message|email|note|reply|اكتب|مسودة|رسالة|رد/i.test(lower)) {
    return handleDraft(q, ctx);
  }
  // 5. Sourcing / supplier matching
  if (/find|source|who supplies|recommend|supplier for|أوجد|ابحث عن مورّد|من يورّد|اقترح/i.test(lower)) {
    const r = handleSourcing(q, ctx);
    if (r) return r;
  }
  // 6. Shipment ref / tracking
  if (shipRef) return handleShipmentLookup(shipRef, ctx);
  if (/where'?s my shipment|track|shipment status|أين شحنتي|تتبّع|حالة الشحنة/i.test(lower)) {
    const ships = shipmentsForRole(ctx.role, ctx.supplierId);
    const active = ships.find((s) => s.status !== 'delivered') ?? ships[0];
    if (active) return handleShipmentLookup(active.ref.replace(/\D/g, '').slice(-4), ctx);
  }
  // 7. Deal ref lookup
  if (dealRef) return handleDealLookup(dealRef, ctx);
  // 8. Supplier by name
  const sup = matchSupplierByName(q);
  if (sup && /supplier|profile|rating|company|مورّد|تقييم|شركة|ملف/i.test(lower)) {
    return handleSupplierLookup(sup, ctx);
  }
  // 9. Category sourcing without an explicit verb (e.g. "oak")
  const cat = handleSourcing(q, ctx);
  if (cat) return cat;
  // 10. Fallback
  return handleFallback(ctx);
}

export const mockProvider: AiProvider = {
  id: 'mock',
  async send(messages: AiMessage[], ctx: AiContext): Promise<AiResponse> {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    const q = last?.text ?? '';
    // small artificial "thinking" delay for a real feel
    await new Promise((res) => setTimeout(res, 480 + Math.random() * 420));
    return reply(q, ctx);
  },
};
