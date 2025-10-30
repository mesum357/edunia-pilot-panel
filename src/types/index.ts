export type RequestType = 'shop' | 'hospital' | 'education' | 'marketplace';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Owner {
  id: string;
  name: string;
  avatar: string;
}

export interface AdminAction {
  adminId: string;
  action: 'accepted' | 'rejected';
  reason?: string;
  at: string;
}

export interface PaymentRequest {
  id: string;
  type: RequestType;
  resourceId: string;
  resourceName: string;
  ownerName: string;
  ownerId: string;
  owner: Owner;
  amount: number;
  currency: string;
  status: RequestStatus;
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  adminAction?: AdminAction;
}

export interface SummaryData {
  totalShops: number;
  totalHospitals: number;
  totalInstitutes: number;
  totalMarketplaceProducts: number;
  pendingRequests: number;
}
