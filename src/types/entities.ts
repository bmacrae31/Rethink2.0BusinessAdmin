import { v4 as uuidv4 } from 'uuid';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member extends BaseEntity {
  membershipId: string;
  accountId: string;
  balanceId: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  autoRenew: boolean;
  nextRenewalDate: string;
}

export interface MembershipTier extends BaseEntity {
  name: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: {
    firstYear: number;
    secondYear: number;
  };
  benefitIds: string[];
  rewardRules: RewardRule[];
  status: 'active' | 'inactive' | 'draft';
}

export interface RewardsBalance extends BaseEntity {
  memberId: string;
  currentBalance: number;
  pendingBalance: number;
  transactionIds: string[];
}

export interface Transaction extends BaseEntity {
  memberId: string;
  balanceId: string;
  type: 'reward_redemption' | 'benefit_usage' | 'auto_reward';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface Benefit extends BaseEntity {
  name: string;
  description?: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  validityMonths: number;
}

export interface MemberBenefit extends BaseEntity {
  memberId: string;
  benefitId: string;
  expiryDate: string;
  used: boolean;
  usedAt?: string;
}

export interface RewardRule {
  type: 'signup' | 'renewal' | 'referral';
  amount: number;
  frequency: 'one_time' | 'monthly' | 'yearly';
}

export interface Activity extends BaseEntity {
  memberId: string;
  type: 'member_created' | 'member_updated' | 'reward_redeemed' | 'benefit_used';
  description: string;
  metadata?: Record<string, any>;
}

export const createEntity = <T extends BaseEntity>(data: Omit<T, keyof BaseEntity>): T => {
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  } as T;
};

export const updateEntity = <T extends BaseEntity>(entity: T, updates: Partial<Omit<T, keyof BaseEntity>>): T => {
  return {
    ...entity,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};