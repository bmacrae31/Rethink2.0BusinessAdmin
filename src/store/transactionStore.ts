import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useMemberStore } from './memberStore';
import { useMembershipStore } from './membershipStore';

interface Transaction {
  id: string;
  type: 'bill_payment' | 'reward_redemption' | 'benefit_usage' | 'membership_purchase' | 'offer_purchase';
  memberId: string;
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: {
    type: 'card' | 'cash';
    id?: string;
    last4?: string;
  };
  metadata?: {
    benefitId?: string;
    benefitName?: string;
    membershipId?: string;
    membershipName?: string;
    [key: string]: any;
  };
}

interface TransactionState {
  transactions: Record<string, Transaction>;
  processTransaction: (data: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => Promise<Transaction | null>;
  getTransactions: (limit?: number) => Transaction[];
  getMemberTransactions: (memberId: string, limit?: number) => Transaction[];
  getRecentActivity: () => Transaction[];
  recordBenefitRedemption: (memberId: string, benefitId: string, benefitName: string) => Promise<Transaction>;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: {},

      processTransaction: async (data) => {
        const transaction: Transaction = {
          ...data,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        set((state) => ({
          transactions: { ...state.transactions, [transaction.id]: transaction }
        }));

        // Update member's last activity and total spent
        const memberStore = useMemberStore.getState();
        const member = memberStore.getMember(data.memberId);
        if (member) {
          memberStore.updateMember(member.id, {
            lastActivity: new Date().toISOString(),
            totalSpent: (member.totalSpent || 0) + (data.amount || 0)
          });

          // Add activity log for the transaction
          memberStore.addActivity({
            memberId: member.id,
            type: data.type,
            description: data.description,
            timestamp: new Date().toISOString(),
            metadata: {
              transactionId: transaction.id,
              amount: data.amount,
              ...data.metadata
            }
          });
        }

        return transaction;
      },

      recordBenefitRedemption: async (memberId: string, benefitId: string, benefitName: string) => {
        const transaction: Transaction = {
          id: uuidv4(),
          type: 'benefit_usage',
          memberId,
          amount: 0,
          description: `Redeemed benefit: ${benefitName}`,
          timestamp: new Date().toISOString(),
          status: 'completed',
          metadata: {
            benefitId,
            benefitName
          }
        };

        set((state) => ({
          transactions: { ...state.transactions, [transaction.id]: transaction }
        }));

        // Add activity log for benefit redemption
        const memberStore = useMemberStore.getState();
        memberStore.addActivity({
          memberId,
          type: 'benefit_usage',
          description: `Redeemed benefit: ${benefitName}`,
          timestamp: new Date().toISOString(),
          metadata: {
            transactionId: transaction.id,
            benefitId,
            benefitName
          }
        });

        return transaction;
      },

      getTransactions: (limit = 20) => {
        return Object.values(get().transactions)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },

      getMemberTransactions: (memberId: string, limit = 20) => {
        return Object.values(get().transactions)
          .filter(tx => tx.memberId === memberId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },

      getRecentActivity: () => {
        return Object.values(get().transactions)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);
      }
    }),
    {
      name: 'transaction-storage',
      version: 1
    }
  )
);