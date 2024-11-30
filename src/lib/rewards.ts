import { Member, MemberActivity } from '../types/member';
import { MembershipTier } from '../types/membership';
import { addActivity, updateMember } from './storage';

interface RewardCalculation {
  amount: number;
  nextRewardDate: string;
}

export function calculateNextReward(member: Member, tier: MembershipTier): RewardCalculation {
  const amount = tier.rewardValue;
  const today = new Date();
  let nextRewardDate = new Date(today);

  if (tier.rewardFrequency === 'Monthly') {
    nextRewardDate.setMonth(today.getMonth() + 1);
  } else if (tier.rewardFrequency === 'Yearly') {
    nextRewardDate.setFullYear(today.getFullYear() + 1);
  }

  return {
    amount,
    nextRewardDate: nextRewardDate.toISOString(),
  };
}

export function processRewardRedemption(
  member: Member,
  amount: number,
  note?: string
): { success: boolean; error?: string; updatedMember?: Member } {
  if (amount <= 0) {
    return { success: false, error: 'Invalid redemption amount' };
  }

  if (amount > member.rewardsBalance) {
    return { success: false, error: 'Insufficient rewards balance' };
  }

  const updatedMember = updateMember(member.id, {
    rewardsBalance: member.rewardsBalance - amount,
    lastActivity: new Date().toISOString(),
  });

  if (!updatedMember) {
    return { success: false, error: 'Failed to update member' };
  }

  // Log the activity
  const activity: Omit<MemberActivity, 'id'> = {
    memberId: member.id,
    type: 'reward_redemption',
    description: `Redeemed $${amount.toFixed(2)} in rewards${note ? ` - ${note}` : ''}`,
    timestamp: new Date().toISOString(),
    metadata: {
      amount,
      note,
    },
  };

  addActivity(activity);

  return {
    success: true,
    updatedMember,
  };
}

export function processBenefitRedemption(
  member: Member,
  benefitName: string
): { success: boolean; error?: string; updatedMember?: Member } {
  const benefit = member.benefits.find(b => b.name === benefitName);

  if (!benefit) {
    return { success: false, error: 'Benefit not found' };
  }

  if (benefit.used) {
    return { success: false, error: 'Benefit has already been used' };
  }

  const updatedBenefits = member.benefits.map(b =>
    b.name === benefitName ? { ...b, used: true } : b
  );

  const updatedMember = updateMember(member.id, {
    benefits: updatedBenefits,
    lastActivity: new Date().toISOString(),
  });

  if (!updatedMember) {
    return { success: false, error: 'Failed to update member' };
  }

  // Log the activity
  const activity: Omit<MemberActivity, 'id'> = {
    memberId: member.id,
    type: 'benefit_usage',
    description: `Used benefit: ${benefitName}`,
    timestamp: new Date().toISOString(),
    metadata: {
      benefitName,
    },
  };

  addActivity(activity);

  return {
    success: true,
    updatedMember,
  };
}