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
  agentId?: string | null;
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

export interface Shop {
  _id: string;
  shopName: string;
  country?: string;
  city: string;
  shopType: 'Product Seller' | 'Service Provider';
  shopDescription?: string;
  categories?: string[];
  shopLogo?: string;
  shopBanner?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFrozen?: boolean;
  owner?: {
    _id: string;
    username?: string;
    email?: string;
    fullName?: string;
  };
  createdAt: string;
  updatedAt: string;
}