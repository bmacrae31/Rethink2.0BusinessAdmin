import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StorefrontConfig {
  headerText: string;
  backgroundColor: string;
  cardStyle: {
    borderRadius: 'rounded' | 'sharp';
    fontFamily: 'tahoma' | 'sans' | 'serif';
  };
  cards: Record<string, {
    backgroundColor: string;
    buttonColor: string;
    isFeatured: boolean;
    displayOrder: number;
    visibilityType: 'public' | 'private' | 'hidden';
    salesCopy?: {
      title: string;
      description: string;
      callToAction: string;
      benefits: string[];
    };
  }>;
  showYearlyToggle: boolean;
  isYearlySelected: boolean;
}

interface StorefrontState {
  config: StorefrontConfig | null;
  saveConfig: (config: StorefrontConfig) => void;
  getConfig: () => StorefrontConfig | null;
}

const defaultConfig: StorefrontConfig = {
  headerText: 'Choose the perfect membership for you',
  backgroundColor: '#ffffff',
  cardStyle: {
    borderRadius: 'rounded',
    fontFamily: 'tahoma',
  },
  cards: {},
  showYearlyToggle: true,
  isYearlySelected: false
};

export const useStorefrontStore = create<StorefrontState>()(
  persist(
    (set, get) => ({
      config: null,

      saveConfig: (config) => {
        set({ config });
      },

      getConfig: () => {
        return get().config || defaultConfig;
      }
    }),
    {
      name: 'storefront-storage',
      version: 1
    }
  )
);