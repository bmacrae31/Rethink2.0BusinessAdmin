import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Benefit {
  id: string;
  name: string;
  description?: string;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  expiresInMonths: number;
}

export interface MembershipTier {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: {
    firstYear: number;
    secondYear: number;
  };
  benefits: Benefit[];
  rewardValue: number;
  rewardFrequency: 'Monthly' | 'Yearly';
  status: 'active' | 'inactive' | 'draft';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MembershipState {
  memberships: Record<string, MembershipTier>;
  getMembershipDisplayName: (id: string) => string;
  createMembership: (data: Omit<MembershipTier, 'id' | 'memberCount' | 'createdAt' | 'updatedAt'>) => MembershipTier;
  updateMembership: (id: string, updates: Partial<Omit<MembershipTier, 'id' | 'createdAt'>>) => MembershipTier | null;
  deleteMembership: (id: string) => boolean;
  getMembership: (id: string) => MembershipTier | null;
}

export const useMembershipStore = create<MembershipState>()(
  persist(
    (set, get) => ({
      memberships: {},

      getMembershipDisplayName: (id: string) => {
        const membership = get().memberships[id];
        return membership?.name || 'Unknown Membership';
      },

      createMembership: (data) => {
        const now = new Date().toISOString();
        const membership: MembershipTier = {
          ...data,
          id: uuidv4(),
          displayName: data.name,
          memberCount: 0,
          benefits: data.benefits.map(benefit => ({
            ...benefit,
            id: uuidv4()
          })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          memberships: { ...state.memberships, [membership.id]: membership }
        }));

        return membership;
      },

      updateMembership: (id, updates) => {
        const membership = get().memberships[id];
        if (!membership) return null;

        const updated: MembershipTier = {
          ...membership,
          ...updates,
          displayName: updates.name || membership.name,
          benefits: updates.benefits?.map(benefit => ({
            ...benefit,
            id: benefit.id || uuidv4()
          })) || membership.benefits,
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          memberships: { ...state.memberships, [id]: updated }
        }));

        return updated;
      },

      deleteMembership: (id) => {
        const membership = get().memberships[id];
        if (!membership) return false;

        set((state) => {
          const { [id]: _, ...rest } = state.memberships;
          return { memberships: rest };
        });

        return true;
      },

      getMembership: (id) => {
        return get().memberships[id] || null;
      }
    }),
    {
      name: 'membership-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            memberships: Object.entries(persistedState.memberships || {}).reduce((acc, [id, membership]) => ({
              ...acc,
              [id]: {
                ...membership,
                displayName: (membership as any).name
              }
            }), {})
          };
        }
        return persistedState;
      }
    }
  )
);