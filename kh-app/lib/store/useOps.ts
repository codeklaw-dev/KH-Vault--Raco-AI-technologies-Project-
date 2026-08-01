import { create } from 'zustand';
import type { ShipmentStatus } from '../types';

/**
 * Shared mutable ops state so confirmed actions (from the AI assistant or a
 * screen) reflect everywhere. The seed data stays immutable; these overrides
 * layer on top of it as the single source of truth for demo mutations.
 */
interface OpsState {
  approvedDealIds: Set<string>;
  shipmentStatusOverride: Record<string, ShipmentStatus>;
  approveDeal: (dealId: string) => void;
  setShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
}

export const useOps = create<OpsState>((set) => ({
  approvedDealIds: new Set<string>(),
  shipmentStatusOverride: {},
  approveDeal: (dealId) =>
    set((s) => {
      const next = new Set(s.approvedDealIds);
      next.add(dealId);
      return { approvedDealIds: next };
    }),
  setShipmentStatus: (shipmentId, status) =>
    set((s) => ({
      shipmentStatusOverride: { ...s.shipmentStatusOverride, [shipmentId]: status },
    })),
}));
