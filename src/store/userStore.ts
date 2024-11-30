import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, DEFAULT_PERMISSIONS } from '../types/user';
import toast from 'react-hot-toast';

interface UserState {
  users: Record<string, User>;
  currentUser: User | null;
  createUser: (data: { email: string; name: string; role: UserRole; password: string }) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasPermission: (permission: keyof typeof DEFAULT_PERMISSIONS.admin) => boolean;
}

// Initial admin user
const ADMIN_USER: User = {
  id: 'admin',
  email: 'admin@example.com', // Change this in production
  name: 'Admin',
  role: 'admin',
  createdAt: new Date().toISOString(),
  status: 'active'
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: { [ADMIN_USER.id]: ADMIN_USER },
      currentUser: null,

      createUser: async (data) => {
        const { users } = get();
        
        // Check if email already exists
        if (Object.values(users).some(user => user.email === data.email)) {
          throw new Error('Email already exists');
        }

        const newUser: User = {
          id: uuidv4(),
          email: data.email,
          name: data.name,
          role: data.role,
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        set(state => ({
          users: { ...state.users, [newUser.id]: newUser }
        }));

        // In production, you'd hash the password and store it securely
        localStorage.setItem(`user_${newUser.id}_password`, data.password);

        return newUser;
      },

      updateUser: async (id, updates) => {
        const { users, currentUser } = get();
        const user = users[id];
        
        if (!user) return null;

        const updatedUser = { ...user, ...updates };
        set(state => ({
          users: { ...state.users, [id]: updatedUser },
          // Update currentUser if it's the same user
          currentUser: currentUser?.id === id ? updatedUser : currentUser
        }));

        return updatedUser;
      },

      deleteUser: async (id) => {
        const { users, currentUser } = get();
        
        if (id === 'admin') {
          throw new Error('Cannot delete admin user');
        }

        if (currentUser?.id === id) {
          throw new Error('Cannot delete your own account');
        }

        if (!users[id]) return false;

        set(state => {
          const { [id]: _, ...rest } = state.users;
          return { users: rest };
        });

        localStorage.removeItem(`user_${id}_password`);
        return true;
      },

      login: async (email, password) => {
        const { users } = get();
        const user = Object.values(users).find(u => u.email === email);

        if (!user) {
          throw new Error('User not found');
        }

        // In production, you'd hash and compare passwords securely
        const storedPassword = localStorage.getItem(`user_${user.id}_password`);
        if (password !== storedPassword && !(user.id === 'admin' && password === 'admin')) {
          throw new Error('Invalid password');
        }

        if (user.status !== 'active') {
          throw new Error('User account is inactive');
        }

        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString()
        };

        set(state => ({
          users: { ...state.users, [user.id]: updatedUser },
          currentUser: updatedUser
        }));

        return updatedUser;
      },

      logout: () => {
        set({ currentUser: null });
      },

      hasPermission: (permission) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return DEFAULT_PERMISSIONS[currentUser.role][permission];
      }
    }),
    {
      name: 'user-storage',
      version: 1
    }
  )
);