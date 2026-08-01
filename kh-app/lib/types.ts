export type Role = 'owner' | 'staff' | 'supplier';

export type Lang = 'en' | 'ar';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  role: Role;
  title: string;
  titleAr: string;
  avatar: string;
  supplierId?: string; // set when role === 'supplier'
}

export type SupplierStatus = 'invited' | 'onboarding' | 'active' | 'paused';

export interface Supplier {
  id: string;
  company: string;
  country: string;
  countryCode: string; // emoji flag
  contact: string;
  email: string;
  status: SupplierStatus;
  rating: number; // 0-5
  categories: string[];
  onboarded: string; // ISO date
  activeDeals: number;
  logoColor: string;
}

export type DealStatus =
  | 'negotiation'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'closed';

export interface TimelineEvent {
  label: string;
  labelAr: string;
  date: string; // ISO
  done: boolean;
}

export interface Deal {
  id: string;
  ref: string;
  title: string;
  titleAr: string;
  supplierId: string;
  woodType: string;
  woodTypeAr: string;
  volume: number;
  unit: string; // m³
  value: number;
  currency: string; // USD
  status: DealStatus;
  origin: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
  shipmentId?: string;
  timeline: TimelineEvent[];
  needsApproval?: boolean;
}

export type ShipmentStatus =
  | 'preparing'
  | 'at_port'
  | 'in_transit'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered';

export interface Milestone {
  label: string;
  labelAr: string;
  location: string;
  locationAr: string;
  timestamp: string; // ISO or '' if pending
  done: boolean;
}

export interface ShipmentDoc {
  name: string;
  type: 'invoice' | 'bol' | 'certificate' | 'photo';
  size: string;
}

export interface Shipment {
  id: string;
  ref: string;
  dealId: string;
  status: ShipmentStatus;
  progressPct: number; // 0-100
  transport: 'sea' | 'road' | 'air';
  origin: string;
  originAr: string;
  destination: string;
  destinationAr: string;
  eta: string; // ISO
  vessel: string;
  milestones: Milestone[];
  documents: ShipmentDoc[];
  heroImage: number; // require() asset
}
