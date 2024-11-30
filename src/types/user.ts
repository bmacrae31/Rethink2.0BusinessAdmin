export type UserRole = 'admin' | 'front_desk';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewMembers: boolean;
  canAddMembers: boolean;
  canEditMembers: boolean;
  canDeleteMembers: boolean;
  canViewMemberships: boolean;
  canManageMemberships: boolean;
  canViewReports: boolean;
  canViewMarketing: boolean;
  canManageMarketing: boolean;
  canViewOffers: boolean;
  canManageOffers: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageStorefront: boolean;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canViewMembers: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    canViewMemberships: true,
    canManageMemberships: true,
    canViewReports: true,
    canViewMarketing: true,
    canManageMarketing: true,
    canViewOffers: true,
    canManageOffers: true,
    canManageUsers: true,
    canManageSettings: true,
    canManageStorefront: true
  },
  front_desk: {
    canViewDashboard: false,
    canViewMembers: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: false,
    canViewMemberships: false,
    canManageMemberships: false,
    canViewReports: false,
    canViewMarketing: false,
    canManageMarketing: false,
    canViewOffers: false,
    canManageOffers: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageStorefront: false
  }
};