-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'front_desk')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  monthly_price DECIMAL(10,2),
  yearly_price_first DECIMAL(10,2),
  yearly_price_second DECIMAL(10,2),
  reward_value DECIMAL(10,2) NOT NULL,
  reward_frequency VARCHAR(20) NOT NULL CHECK (reward_frequency IN ('Monthly', 'Yearly')),
  cashback_enabled BOOLEAN DEFAULT false,
  cashback_rate DECIMAL(5,2),
  cashback_limit_transaction DECIMAL(10,2),
  cashback_limit_monthly DECIMAL(10,2),
  cashback_limit_annual DECIMAL(10,2),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Benefits table
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Monthly', 'Quarterly', 'Yearly')),
  expires_in_months INTEGER NOT NULL CHECK (expires_in_months > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  join_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  membership_tier UUID REFERENCES memberships(id) NOT NULL,
  rewards_balance DECIMAL(10,2) DEFAULT 0 CHECK (rewards_balance >= 0),
  last_activity TIMESTAMPTZ,
  total_spent DECIMAL(10,2) DEFAULT 0 CHECK (total_spent >= 0),
  auto_renew BOOLEAN DEFAULT true,
  next_renewal_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Member Benefits table
CREATE TABLE member_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  benefit_id UUID REFERENCES benefits(id),
  expiry_date TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit_card', 'bank_account')),
  last4 VARCHAR(4) NOT NULL,
  expiry_date VARCHAR(7),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  quantity_limit INTEGER CHECK (quantity_limit > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'paused')),
  redemption_count INTEGER DEFAULT 0,
  terms_conditions TEXT,
  redemption_instructions TEXT,
  marketing_copy TEXT,
  highlight_features TEXT[],
  social_share_text TEXT,
  display_priority VARCHAR(20) DEFAULT 'normal' CHECK (display_priority IN ('low', 'normal', 'high', 'featured')),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offer Membership Tiers junction table
CREATE TABLE offer_membership_tiers (
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, membership_id)
);

-- Purchased Offers table
CREATE TABLE purchased_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id),
  purchase_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'redeemed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('welcome', 'rewards', 'expiration', 'offer', 'custom')),
  enabled BOOLEAN DEFAULT true,
  variables JSONB,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding JSONB NOT NULL DEFAULT '{
    "logoUrl": null,
    "businessName": null,
    "primaryColor": null,
    "customButtonColors": false
  }',
  payment JSONB NOT NULL DEFAULT '{
    "provider": "stripe",
    "environment": "test",
    "apiKey": null,
    "secretKey": null
  }',
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Storefront Config table
CREATE TABLE storefront_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  header_text VARCHAR(255) DEFAULT 'Choose the perfect membership for you',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  card_style JSONB NOT NULL DEFAULT '{
    "borderRadius": "rounded",
    "fontFamily": "tahoma"
  }',
  cards JSONB[] DEFAULT ARRAY[]::JSONB[],
  show_yearly_toggle BOOLEAN DEFAULT true,
  is_yearly_selected BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storefront_config_updated_at
    BEFORE UPDATE ON storefront_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();