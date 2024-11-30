-- Function to handle member signup
CREATE OR REPLACE FUNCTION handle_member_signup(
  member_data JSONB,
  membership_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_member_id UUID;
  membership_reward DECIMAL;
BEGIN
  -- Get membership reward value
  SELECT reward_value INTO membership_reward
  FROM memberships
  WHERE id = membership_id;

  -- Create member
  INSERT INTO members (
    name,
    email,
    phone,
    membership_tier,
    rewards_balance,
    join_date,
    next_renewal_date
  )
  VALUES (
    member_data->>'name',
    member_data->>'email',
    member_data->>'phone',
    membership_id,
    membership_reward,
    NOW(),
    NOW() + INTERVAL '1 month'
  )
  RETURNING id INTO new_member_id;

  -- Update membership count
  UPDATE memberships
  SET member_count = member_count + 1
  WHERE id = membership_id;

  RETURN new_member_id;
END;
$$;

-- Function to handle offer redemption
CREATE OR REPLACE FUNCTION redeem_offer(
  member_id UUID,
  offer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offer_record RECORD;
  member_record RECORD;
BEGIN
  -- Get offer details
  SELECT * INTO offer_record
  FROM offers
  WHERE id = offer_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found or not active';
  END IF;

  -- Check quantity limit
  IF offer_record.quantity_limit IS NOT NULL AND 
     offer_record.redemption_count >= offer_record.quantity_limit THEN
    RAISE EXCEPTION 'Offer redemption limit reached';
  END IF;

  -- Get member details
  SELECT * INTO member_record
  FROM members
  WHERE id = member_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found or not active';
  END IF;

  -- Create purchased offer record
  INSERT INTO purchased_offers (
    member_id,
    offer_id,
    purchase_date,
    expiration_date
  )
  VALUES (
    member_id,
    offer_id,
    NOW(),
    NOW() + INTERVAL '30 days'
  );

  -- Update offer redemption count
  UPDATE offers
  SET redemption_count = redemption_count + 1
  WHERE id = offer_id;

  RETURN true;
END;
$$;

-- Function to calculate cashback
CREATE OR REPLACE FUNCTION calculate_cashback(
  member_id UUID,
  transaction_amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_record RECORD;
  monthly_total DECIMAL;
  annual_total DECIMAL;
  cashback_amount DECIMAL;
BEGIN
  -- Get membership details
  SELECT m.*
  INTO membership_record
  FROM memberships m
  JOIN members mb ON mb.membership_tier = m.id
  WHERE mb.id = member_id;

  IF NOT FOUND OR NOT membership_record.cashback_enabled THEN
    RETURN 0;
  END IF;

  -- Calculate initial cashback
  cashback_amount := transaction_amount * (membership_record.cashback_rate / 100);

  -- Apply transaction limit
  IF membership_record.cashback_limit_transaction IS NOT NULL THEN
    cashback_amount := LEAST(cashback_amount, membership_record.cashback_limit_transaction);
  END IF;

  -- Check monthly limit
  IF membership_record.cashback_limit_monthly IS NOT NULL THEN
    SELECT COALESCE(SUM(cashback_amount), 0)
    INTO monthly_total
    FROM member_cashback
    WHERE member_id = member_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    IF monthly_total + cashback_amount > membership_record.cashback_limit_monthly THEN
      cashback_amount := GREATEST(0, membership_record.cashback_limit_monthly - monthly_total);
    END IF;
  END IF;

  -- Check annual limit
  IF membership_record.cashback_limit_annual IS NOT NULL THEN
    SELECT COALESCE(SUM(cashback_amount), 0)
    INTO annual_total
    FROM member_cashback
    WHERE member_id = member_id
    AND created_at >= date_trunc('year', CURRENT_DATE);

    IF annual_total + cashback_amount > membership_record.cashback_limit_annual THEN
      cashback_amount := GREATEST(0, membership_record.cashback_limit_annual - annual_total);
    END IF;
  END IF;

  RETURN cashback_amount;
END;
$$;