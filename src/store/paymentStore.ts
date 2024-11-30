import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';
import { BillPayment, PaymentDetails, PaymentResult } from '../types/payment';
import { useMemberStore } from './memberStore';
import { useMembershipStore } from './membershipStore';

interface PaymentState {
  payments: Record<string, BillPayment>;
  monthlyTotals: Record<string, { [key: string]: number }>;  // memberId -> { YYYY-MM: total }
  annualTotals: Record<string, { [key: string]: number }>;   // memberId -> { YYYY: total }
  processBillPayment: (memberId: string, details: PaymentDetails) => Promise<PaymentResult>;
  getPaymentHistory: (memberId: string) => BillPayment[];
  calculateCashback: (amount: number, memberId: string) => number;
  getMonthlyTotal: (memberId: string, date?: Date) => number;
  getAnnualTotal: (memberId: string, date?: Date) => number;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      payments: {},
      monthlyTotals: {},
      annualTotals: {},

      processBillPayment: async (memberId: string, details: PaymentDetails) => {
        const memberStore = useMemberStore.getState();
        const membershipStore = useMembershipStore.getState();
        const member = memberStore.getMember(memberId);

        if (!member) {
          return {
            success: false,
            error: 'Member not found',
            amount: details.amount,
            timestamp: new Date().toISOString()
          };
        }

        if (member.status !== 'active') {
          return {
            success: false,
            error: 'Membership is not active',
            amount: details.amount,
            timestamp: new Date().toISOString()
          };
        }

        const membership = membershipStore.getMembership(member.membershipTier);
        let cashbackAmount = 0;

        if (membership?.cashback?.enabled) {
          cashbackAmount = get().calculateCashback(details.amount, memberId);
        }

        const payment: BillPayment = {
          id: uuidv4(),
          memberId,
          amount: details.amount,
          description: details.description,
          paymentMethodId: details.paymentMethod.id,
          cashbackEarned: cashbackAmount,
          status: 'completed',
          timestamp: new Date().toISOString(),
          metadata: details.metadata
        };

        // Update totals
        const date = new Date(payment.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const yearKey = `${date.getFullYear()}`;

        set((state) => {
          const newMonthlyTotals = {
            ...state.monthlyTotals,
            [memberId]: {
              ...state.monthlyTotals[memberId],
              [monthKey]: (state.monthlyTotals[memberId]?.[monthKey] || 0) + cashbackAmount
            }
          };

          const newAnnualTotals = {
            ...state.annualTotals,
            [memberId]: {
              ...state.annualTotals[memberId],
              [yearKey]: (state.annualTotals[memberId]?.[yearKey] || 0) + cashbackAmount
            }
          };

          return {
            payments: { ...state.payments, [payment.id]: payment },
            monthlyTotals: newMonthlyTotals,
            annualTotals: newAnnualTotals
          };
        });

        if (cashbackAmount > 0) {
          // Update member's rewards balance
          memberStore.updateMember(memberId, {
            rewardsBalance: new Decimal(member.rewardsBalance)
              .plus(cashbackAmount)
              .toNumber(),
            lastActivity: new Date().toISOString()
          });

          // Add activity log
          memberStore.addActivity({
            memberId,
            type: 'cashback_earned',
            description: `Earned $${cashbackAmount.toFixed(2)} cashback from $${details.amount.toFixed(2)} payment`,
            timestamp: new Date().toISOString(),
            metadata: {
              paymentId: payment.id,
              amount: details.amount,
              cashbackAmount
            }
          });
        }

        return {
          success: true,
          transactionId: payment.id,
          amount: details.amount,
          cashbackAmount,
          timestamp: payment.timestamp
        };
      },

      getPaymentHistory: (memberId: string) => {
        return Object.values(get().payments)
          .filter((payment) => payment.memberId === memberId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      calculateCashback: (amount: number, memberId: string) => {
        const memberStore = useMemberStore.getState();
        const membershipStore = useMembershipStore.getState();
        const member = memberStore.getMember(memberId);
        
        if (!member) return 0;
        
        const membership = membershipStore.getMembership(member.membershipTier);
        if (!membership?.cashback?.enabled) return 0;

        const { rate, limits } = membership.cashback;
        let cashback = new Decimal(amount).times(rate).dividedBy(100);

        // Apply per-transaction limit
        if (limits?.perTransaction) {
          cashback = Decimal.min(cashback, limits.perTransaction);
        }

        // Apply monthly limit
        if (limits?.monthly) {
          const monthlyTotal = get().getMonthlyTotal(memberId);
          const remainingMonthly = new Decimal(limits.monthly).minus(monthlyTotal);
          if (remainingMonthly.lessThanOrEqualTo(0)) return 0;
          cashback = Decimal.min(cashback, remainingMonthly);
        }

        // Apply annual limit
        if (limits?.annual) {
          const annualTotal = get().getAnnualTotal(memberId);
          const remainingAnnual = new Decimal(limits.annual).minus(annualTotal);
          if (remainingAnnual.lessThanOrEqualTo(0)) return 0;
          cashback = Decimal.min(cashback, remainingAnnual);
        }

        return cashback.toDecimalPlaces(2).toNumber();
      },

      getMonthlyTotal: (memberId: string, date = new Date()) => {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return get().monthlyTotals[memberId]?.[monthKey] || 0;
      },

      getAnnualTotal: (memberId: string, date = new Date()) => {
        const yearKey = `${date.getFullYear()}`;
        return get().annualTotals[memberId]?.[yearKey] || 0;
      }
    }),
    {
      name: 'payment-storage'
    }
  )
);