import { Member, MemberActivity, MemberFilter } from '../types/member';

// Mock database - replace with actual database implementation
let members: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    joinDate: '2024-01-15',
    status: 'active',
    membershipTier: 'Gold',
    rewardsBalance: 250,
    lastActivity: '2024-03-15',
    totalSpent: 1250,
    autoRenew: true,
    nextRenewalDate: '2025-01-15',
    benefits: [
      {
        name: 'Free Grooming',
        expiryDate: '2024-04-15',
        used: false
      },
      {
        name: 'Priority Booking',
        expiryDate: '2024-12-31',
        used: true
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(555) 987-6543',
    joinDate: '2024-02-01',
    status: 'active',
    membershipTier: 'Silver',
    rewardsBalance: 100,
    lastActivity: '2024-03-14',
    totalSpent: 750,
    autoRenew: false,
    nextRenewalDate: '2025-02-01',
    benefits: [
      {
        name: 'Quarterly Nail Trim',
        expiryDate: '2024-05-01',
        used: false
      }
    ]
  }
];

// Mock activity log
let activities: MemberActivity[] = [
  {
    id: '1',
    memberId: '1',
    type: 'reward_redemption',
    description: 'Redeemed $50 in rewards',
    timestamp: '2024-03-15T10:30:00Z',
    metadata: {
      amount: 50
    }
  },
  {
    id: '2',
    memberId: '1',
    type: 'benefit_usage',
    description: 'Used Priority Booking benefit',
    timestamp: '2024-03-10T15:45:00Z',
    metadata: {
      benefitName: 'Priority Booking'
    }
  }
];

export async function listMembers(filters?: MemberFilter) {
  let filteredMembers = [...members];

  if (filters) {
    filteredMembers = filteredMembers.filter(member => {
      const matchesSearch = !filters.search || 
        member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(member.status);

      const matchesTier = filters.membershipTier.length === 0 ||
        filters.membershipTier.includes(member.membershipTier);

      const matchesDate = !filters.dateRange ||
        (new Date(member.joinDate) >= new Date(filters.dateRange.start) &&
         new Date(member.joinDate) <= new Date(filters.dateRange.end));

      return matchesSearch && matchesStatus && matchesTier && matchesDate;
    });
  }

  return filteredMembers;
}

export async function getMember(id: string): Promise<Member | undefined> {
  return members.find(member => member.id === id);
}

export async function getMemberActivities(memberId: string): Promise<MemberActivity[]> {
  return activities.filter(activity => activity.memberId === memberId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined> {
  const index = members.findIndex(member => member.id === id);
  if (index === -1) return undefined;

  // If membership tier is changing, add an activity log entry
  if (updates.membershipTier && updates.membershipTier !== members[index].membershipTier) {
    activities.push({
      id: (activities.length + 1).toString(),
      memberId: id,
      type: 'membership_change',
      description: `Membership upgraded from ${members[index].membershipTier} to ${updates.membershipTier}`,
      timestamp: new Date().toISOString(),
      metadata: {
        oldTier: members[index].membershipTier,
        newTier: updates.membershipTier
      }
    });
  }

  members[index] = { ...members[index], ...updates };
  return members[index];
}

export async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
  const newMember: Member = {
    ...member,
    id: (members.length + 1).toString(),
  };
  members.push(newMember);
  return newMember;
}

export async function deleteMember(id: string): Promise<boolean> {
  const index = members.findIndex(member => member.id === id);
  if (index === -1) return false;

  members.splice(index, 1);
  return true;
}