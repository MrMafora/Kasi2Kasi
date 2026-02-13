-- ============================================
-- Kasi2Kasi Goal Fund Extension
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add group type and goal fields to existing groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'stokvel' CHECK (type IN ('stokvel', 'goal'));
ALTER TABLE groups ADD COLUMN IF NOT EXISTS goal_target NUMERIC(12,2);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS goal_description TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS goal_recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS goal_monthly_target NUMERIC(12,2);

-- ============ EXPENSES TABLE ============
-- Track what the pooled money was actually spent on
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(group_id, date);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expenses viewable by group members" ON expenses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = expenses.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Chairperson or treasurer can record expenses" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    recorded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = expenses.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('chairperson', 'treasurer')
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Chairperson or treasurer can update expenses" ON expenses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = expenses.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('chairperson', 'treasurer')
      AND group_members.status = 'active'
    )
  );

-- ============ GOAL FUND FUNCTIONS ============

-- Record a flexible contribution (any amount)
CREATE OR REPLACE FUNCTION record_goal_contribution(
  p_group_id UUID,
  p_member_id UUID,
  p_amount NUMERIC(12,2),
  p_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_member group_members%ROWTYPE;
  v_group groups%ROWTYPE;
  v_tx_id UUID;
BEGIN
  IF p_member_id != auth.uid() THEN
    RETURN json_build_object('error', 'You can only record your own contributions');
  END IF;

  SELECT * INTO v_group FROM groups WHERE id = p_group_id AND type = 'goal';
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Group not found or not a goal fund');
  END IF;

  SELECT * INTO v_member FROM group_members
    WHERE group_id = p_group_id AND user_id = p_member_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'You are not an active member of this group');
  END IF;

  INSERT INTO transactions (group_id, member_id, amount, type, status, round, note)
  VALUES (p_group_id, p_member_id, p_amount, 'contribution', 'completed', v_group.current_round, p_note)
  RETURNING id INTO v_tx_id;

  UPDATE group_members SET
    lifetime_contributed = lifetime_contributed + p_amount,
    total_payments = total_payments + 1,
    total_on_time = total_on_time + 1,
    commitment_score = ROUND(((total_on_time + 1)::NUMERIC / (total_payments + 1)::NUMERIC) * 100)
  WHERE group_id = p_group_id AND user_id = p_member_id;

  UPDATE groups SET total_pool = total_pool + p_amount WHERE id = p_group_id;

  RETURN json_build_object('id', v_tx_id, 'success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record an expense against the goal fund
CREATE OR REPLACE FUNCTION record_goal_expense(
  p_group_id UUID,
  p_description TEXT,
  p_amount NUMERIC(12,2),
  p_date DATE DEFAULT CURRENT_DATE,
  p_receipt_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_caller_role TEXT;
  v_expense_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM group_members
    WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'active';
  IF v_caller_role NOT IN ('chairperson', 'treasurer') THEN
    RETURN json_build_object('error', 'Only chairperson or treasurer can record expenses');
  END IF;

  INSERT INTO expenses (group_id, description, amount, date, receipt_url, recorded_by)
  VALUES (p_group_id, p_description, p_amount, p_date, p_receipt_url, auth.uid())
  RETURNING id INTO v_expense_id;

  -- Reduce pool by expense amount
  UPDATE groups SET total_pool = total_pool - p_amount WHERE id = p_group_id;

  RETURN json_build_object('id', v_expense_id, 'success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
