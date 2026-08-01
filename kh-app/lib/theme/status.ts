import { colors } from './tokens';

export interface StatusStyle {
  fg: string;
  bg: string;
}

const map: Record<string, StatusStyle> = {
  // Deal
  negotiation: { fg: colors.warning, bg: colors.warningTint },
  confirmed: { fg: colors.info, bg: colors.infoTint },
  in_production: { fg: colors.crimson, bg: colors.crimsonTint },
  shipped: { fg: colors.info, bg: colors.infoTint },
  delivered: { fg: colors.success, bg: colors.successTint },
  closed: { fg: colors.ink50, bg: colors.surfaceAlt },
  // Shipment
  preparing: { fg: colors.warning, bg: colors.warningTint },
  at_port: { fg: colors.info, bg: colors.infoTint },
  in_transit: { fg: colors.crimson, bg: colors.crimsonTint },
  customs: { fg: colors.warning, bg: colors.warningTint },
  out_for_delivery: { fg: colors.info, bg: colors.infoTint },
  // Supplier
  invited: { fg: colors.ink50, bg: colors.surfaceAlt },
  onboarding: { fg: colors.warning, bg: colors.warningTint },
  active: { fg: colors.success, bg: colors.successTint },
  paused: { fg: colors.ink50, bg: colors.surfaceAlt },
};

export function statusStyle(status: string): StatusStyle {
  return map[status] ?? { fg: colors.ink50, bg: colors.surfaceAlt };
}
