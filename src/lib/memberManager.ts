import { v4 as uuidv4 } from 'uuid';
import { Member, MemberActivity } from '../types/member';

// Storage keys
const STORAGE_KEYS = {
  MEMBERS: 'rvs_members',
  ACTIVITIES: 'rvs_activities'
};

// Member management functions
export function getMembers(): Member[] {
  try {
    const members = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return members ? JSON.parse(members) : [];
  } catch (error) {
    console.error('Error getting members:', error);
    return [];
  }
}

export function getMember(id: string): Member | null {
  try {
    const members = getMembers();
    return members.find(member => member.id === id) || null;
  } catch (error) {
    console.error('Error getting member:', error);
    return null;
  }
}

export function createMember(memberData: Omit<Member, 'id'>): Member | null {
  try {
    const members = getMembers();
    
    // Create benefits with proper structure and IDs
    const benefits = memberData.benefits.map(benefit => ({
      id: uuidv4(),
      name: benefit.name,
      expiryDate: benefit.expiryDate,
      used: false
    }));

    // Create payment methods with IDs
    const paymentMethods = memberData.paymentMethods.map(pm => ({
      ...pm,
      id: uuidv4()
    }));

    const newMember: Member = {
      ...memberData,
      id: uuidv4(),
      lastActivity: new Date().toISOString(),
      benefits,
      paymentMethods,
      status: 'active',
      autoRenew: true,
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Log member creation
    addActivity({
      memberId: newMember.id,
      type: 'member_created',
      description: `New member created with ${memberData.membershipTier} membership`,
      timestamp: new Date().toISOString(),
      metadata: {
        membershipTier: memberData.membershipTier
      }
    });

    return newMember;
  } catch (error) {
    console.error('Error creating member:', error);
    return null;
  }
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  try {
    const members = getMembers();
    const index = members.findIndex(member => member.id === id);
    
    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    addActivity({
      memberId: id,
      type: 'member_updated',
      description: 'Member details updated',
      timestamp: new Date().toISOString(),
      metadata: updates
    });

    return members[index];
  } catch (error) {
    console.error('Error updating member:', error);
    return null;
  }
}

export function deleteMember(id: string): boolean {
  try {
    const members = getMembers();
    const filteredMembers = members.filter(member => member.id !== id);
    
    if (filteredMembers.length === members.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
    
    addActivity({
      memberId: id,
      type: 'member_deleted',
      description: 'Member account deleted',
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error deleting member:', error);
    return false;
  }
}

// Activity management functions
export function getActivities(): MemberActivity[] {
  try {
    const activities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
}

export function getMemberActivities(memberId: string): MemberActivity[] {
  try {
    const activities = getActivities();
    return activities.filter(activity => activity.memberId === memberId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error getting member activities:', error);
    return [];
  }
}

export function addActivity(activity: Omit<MemberActivity, 'id'>): MemberActivity | null {
  try {
    const activities = getActivities();
    const newActivity: MemberActivity = {
      ...activity,
      id: uuidv4()
    };
    
    activities.push(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    
    return newActivity;
  } catch (error) {
    console.error('Error adding activity:', error);
    return null;
  }
}

// Initialize storage
(() => {
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
  }
})();