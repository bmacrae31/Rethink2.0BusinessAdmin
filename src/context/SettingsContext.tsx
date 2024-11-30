import { createContext, useContext, useState, useEffect } from 'react';
import { BusinessSettings } from '../types/settings';
import { getBusinessSettings } from '../api/settings';
import { getStoredSettings, storeSettings } from '../lib/storage';

interface SettingsContextType {
  settings: BusinessSettings | null;
  updateSettings: (settings: BusinessSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const storedSettings = getStoredSettings();
      if (storedSettings) {
        setSettings(storedSettings);
        applyButtonColors(storedSettings.branding);
      } else {
        const defaultSettings = await getBusinessSettings();
        setSettings(defaultSettings);
        storeSettings(defaultSettings);
      }
    };
    loadSettings();
  }, []);

  const applyButtonColors = (branding: BusinessSettings['branding']) => {
    const root = document.documentElement;
    if (branding.customButtonColors) {
      root.style.setProperty('--brand-button-color', branding.primaryColor);
      // Calculate a slightly darker color for hover state
      const darkerColor = adjustColorBrightness(branding.primaryColor, -10);
      root.style.setProperty('--brand-button-hover', darkerColor);
    } else {
      root.style.setProperty('--brand-button-color', '#000000');
      root.style.setProperty('--brand-button-hover', '#1a1a1a');
    }
  };

  const adjustColorBrightness = (hex: string, percent: number) => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + (r * percent / 100)));
    g = Math.max(0, Math.min(255, g + (g * percent / 100)));
    b = Math.max(0, Math.min(255, b + (b * percent / 100)));

    // Convert back to hex
    const rr = Math.round(r).toString(16).padStart(2, '0');
    const gg = Math.round(g).toString(16).padStart(2, '0');
    const bb = Math.round(b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  };

  const updateSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    storeSettings(newSettings);
    applyButtonColors(newSettings.branding);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}