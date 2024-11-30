import { BusinessSettings, BrandingSettings, PaymentSettings } from '../types/settings';
import { getStoredSettings, storeSettings } from '../lib/storage';

// Default settings
const defaultSettings: BusinessSettings = {
  branding: {
    logoUrl: 'https://rethinkveterinarysolutions.com/hs-fs/hubfs/Rethink_Veterinary_Solutions_No_RVS-1-1.png?width=175&height=50&name=Rethink_Veterinary_Solutions_No_RVS-1-1.png'
  },
  payment: {
    provider: 'fortis',
    environment: 'test',
    apiKey: '',
    secretKey: ''
  }
};

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const storedSettings = getStoredSettings();
  return storedSettings || defaultSettings;
}

export async function updateBrandingSettings(settings: BrandingSettings): Promise<BusinessSettings> {
  const currentSettings = await getBusinessSettings();
  const updatedSettings = {
    ...currentSettings,
    branding: settings
  };
  storeSettings(updatedSettings);
  return updatedSettings;
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<BusinessSettings> {
  const currentSettings = await getBusinessSettings();
  const updatedSettings = {
    ...currentSettings,
    payment: settings
  };
  storeSettings(updatedSettings);
  return updatedSettings;
}