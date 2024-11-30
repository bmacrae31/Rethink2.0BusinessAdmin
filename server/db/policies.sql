-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_config ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Memberships policies
CREATE POLICY "Anyone can view active memberships" ON memberships
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage memberships" ON memberships
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Members policies
CREATE POLICY "Staff can view all members" ON members
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Staff can create members" ON members
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage members" ON members
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Offers policies
CREATE POLICY "Anyone can view active offers" ON offers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage offers" ON offers
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Settings policies
CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Storefront policies
CREATE POLICY "Anyone can view published storefront" ON storefront_config
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage storefront" ON storefront_config
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));