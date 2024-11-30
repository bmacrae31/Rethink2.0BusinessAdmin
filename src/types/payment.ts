import { Member } from './member';

export interface PaymentDetails {
  amount: number;
  description: string;
  paymentMethod: {
    id: string;
    last4: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  amount: number;
  cashbackAmount?: number;
  timestamp: string;
}

export interface CashbackConfig {
  enabled: boolean;
  rate: number;
  limits?: {
    perTransaction?: number;
    monthly?: number;
    annual?: number;
  };
}

export interface BillPayment {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  paymentMethodId: string;
  cashbackEarned: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  metadata?: Record<string, any>;
}