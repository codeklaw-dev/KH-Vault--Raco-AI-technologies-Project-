import type { Role } from '../types';
import { deals, shipments, suppliers } from '../data/seed';

/** Deals visible to the current role. Suppliers see only their own. */
export function dealsForRole(role: Role, supplierId?: string) {
  if (role === 'supplier' && supplierId) {
    return deals.filter((d) => d.supplierId === supplierId);
  }
  return deals;
}

export function shipmentsForRole(role: Role, supplierId?: string) {
  if (role === 'supplier' && supplierId) {
    const ownDealIds = deals
      .filter((d) => d.supplierId === supplierId)
      .map((d) => d.id);
    return shipments.filter((s) => ownDealIds.includes(s.dealId));
  }
  return shipments;
}

export function getDeal(id: string) {
  return deals.find((d) => d.id === id);
}

export function getShipment(id: string) {
  return shipments.find((s) => s.id === id);
}

export function getShipmentByDeal(dealId: string) {
  return shipments.find((s) => s.dealId === dealId);
}

export function getSupplier(id: string) {
  return suppliers.find((s) => s.id === id);
}

export function dealsForSupplier(supplierId: string) {
  return deals.filter((d) => d.supplierId === supplierId);
}

export function pendingApprovals() {
  return deals.filter((d) => d.needsApproval);
}
