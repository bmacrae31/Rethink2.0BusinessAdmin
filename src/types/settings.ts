export interface BusinessSettings {
  branding: BrandingSettings;
  payment: PaymentSettings;
}

export interface BrandingSettings {
  logoUrl: string;
}

export interface PaymentSettings {
  provider: 'fortis' | 'stripe';
  environment: 'test' | 'live';
  apiKey: string;
  secretKey: string;
}