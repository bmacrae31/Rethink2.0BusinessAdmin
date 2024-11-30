export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  membershipTier: string;
  rewardsBalance: number;
  lastActivity?: string;
  totalSpent?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  autoRenew: boolean;
  nextRenewalDate: string;
  benefits: Benefit[];
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod?: string;
  purchasedOffers: {
    offerId: string;
    purchaseDate: string;
    expirationDate: string;
    status: 'available' | 'redeemed' | 'expired';
  }[];
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Benefit {
  id: string;
  name: string;
  expiryDate: string;
  used: boolean;
}

export interface MemberActivity {
  id: string;
  memberId: string;
  type: 'member_created' | 'member_updated' | 'member_deleted' | 'reward_redemption' | 
        'benefit_usage' | 'membership_change' | 'membership_stopped' | 'membership_restarted' |
        'cashback_earned' | 'bill_payment' | 'offer_purchased' | 'offer_redeemed';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MemberFilter {
  search?: string;
  status: string[];
  membershipTier: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}