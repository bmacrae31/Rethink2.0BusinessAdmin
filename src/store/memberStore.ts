import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Member, MemberActivity } from '../types/member';
import { useMembershipStore } from './membershipStore';
import toast from 'react-hot-toast';

interface MemberState {
  members: Record<string, Member>;
  activities: Record<string, MemberActivity>;
  createMember: (data: Omit<Member, 'id'>) => Member;
  updateMember: (id: string, updates: Partial<Member>) => Member | null;
  deleteMember: (id: string) => boolean;
  getMember: (id: string) => Member | null;
  addActivity: (activity: Omit<MemberActivity, 'id'>) => MemberActivity;
  getMemberActivities: (memberId: string) => MemberActivity[];
  purchaseMembership: (memberData: {
    name: string;
    email: string;
    phone?: string;
  }, membershipId: string, paymentMethod: { type: 'card' | 'cash' } & Record<string, any>) => Promise<{
    member: Member;
    initialBalance: number;
  }>;
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: {},
      activities: {},

      createMember: (data) => {
        const id = uuidv4();
        const member = {
          ...data,
          id,
          lastActivity: new Date().toISOString()
        };

        set(state => ({
          members: { ...state.members, [id]: member }
        }));

        return member;
      },

      updateMember: (id, updates) => {
        const member = get().members[id];
        if (!member) return null;

        const updatedMember = { ...member, ...updates };
        set(state => ({
          members: { ...state.members, [id]: updatedMember }
        }));

        return updatedMember;
      },

      deleteMember: (id) => {
        const member = get().members[id];
        if (!member) return false;

        set(state => {
          const { [id]: _, ...rest } = state.members;
          return { members: rest };
        });

        return true;
      },

      getMember: (id) => {
        return get().members[id] || null;
      },

      addActivity: (activity) => {
        const id = uuidv4();
        const newActivity = { ...activity, id };

        set(state => ({
          activities: { ...state.activities, [id]: newActivity }
        }));

        return newActivity;
      },

      getMemberActivities: (memberId) => {
        return Object.values(get().activities)
          .filter(activity => activity.memberId === memberId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      purchaseMembership: async (memberData, membershipId, paymentMethod) => {
        const membershipStore = useMembershipStore.getState();
        const membership = membershipStore.getMembership(membershipId);

        if (!membership) {
          throw new Error('Membership tier not found');
        }

        // Create the base member
        const member = get().createMember({
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone,
          membershipTier: membershipId,
          status: 'active',
          joinDate: new Date().toISOString(),
          rewardsBalance: membership.rewardValue || 0,
          autoRenew: paymentMethod.type === 'card',
          nextRenewalDate: new Date(
            Date.now() + (paymentMethod.type === 'cash' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          benefits: membership.benefits.map(benefit => ({
            id: uuidv4(),
            name: benefit.name,
            expiryDate: new Date(Date.now() + benefit.expiresInMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
          })),
          paymentMethods: paymentMethod.type === 'card' ? [{
            id: uuidv4(),
            type: 'credit_card',
            last4: paymentMethod.cardNumber.slice(-4),
            expiryDate: paymentMethod.expiryDate,
            isDefault: true
          }] : []
        });

        // Add membership purchase activity
        get().addActivity({
          memberId: member.id,
          type: 'membership_purchase',
          description: `${membership.name} membership purchased with ${paymentMethod.type} payment`,
          timestamp: new Date().toISOString(),
          metadata: {
            membershipId,
            membershipName: membership.name,
            paymentMethod: paymentMethod.type,
            amount: paymentMethod.type === 'cash' 
              ? membership.yearlyPrice?.firstYear
              : membership.monthlyPrice
          }
        });

        return {
          member,
          initialBalance: membership.rewardValue || 0
        };
      }
    }),
    {
      name: 'member-storage',
      version: 1
    }
  )
);