export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  quantityLimit?: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'expired' | 'paused';
  redemptionCount: number;
  membershipTiers: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: {
    termsAndConditions?: string;
    redemptionInstructions?: string;
    [key: string]: any;
  };
}

export interface OfferFilter {
  status?: ('draft' | 'active' | 'expired' | 'paused')[];
  membershipTier?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface OfferRedemption {
  id: string;
  offerId: string;
  memberId: string;
  redeemedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}