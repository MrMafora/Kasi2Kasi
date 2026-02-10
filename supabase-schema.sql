-- ============================================
-- Kasi2Kasi Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ PROFILES ============
-- Extends Supabase auth.users with app-specific data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatar_initials TEXT NOT NULL DEFAULT '',
  beneficiary_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ STOKVEL GROUPS ============
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  contribution_amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly')),
  max_members INT NOT NULL DEFAULT 10,
  current_round INT NOT NULL DEFAULT 1,
  total_rounds INT NOT NULL DEFAULT 10,
  total_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  next_payout_date DATE,
  next_payout_member_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ GROUP MEMBERS ============
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('chairperson', 'treasurer', 'secretary', 'member')),
  payout_position INT NOT NULL DEFAULT 1,
  commitment_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  total_on_time INT NOT NULL DEFAULT 0,
  total_payments INT NOT NULL DEFAULT 0,
  cycles_completed INT NOT NULL DEFAULT 0,
  lifetime_contributed NUMERIC(12,2) NOT NULL DEFAULT 0,
  lifetime_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exited', 'suspended')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============ TRANSACTIONS ============
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('contribution', 'payout', 'penalty', 'settlement')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'late', 'missed')),
  round INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CONSTITUTION RULES ============
CREATE TABLE constitution_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rule_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ RULE ACCEPTANCES ============
CREATE TABLE rule_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES constitution_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rule_id, user_id)
);

-- ============ VOTES ============
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  proposed_by UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('role_change', 'rule_change', 'member_exit', 'general')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ VOTE CASTS ============
CREATE TABLE vote_casts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_value TEXT NOT NULL CHECK (vote_value IN ('for', 'against')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vote_id, user_id)
);

-- ============ NOTIFICATIONS ============
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('payment', 'payout', 'vote', 'reminder', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ INDEXES ============
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_transactions_group ON transactions(group_id);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_transactions_round ON transactions(group_id, round);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read);
CREATE INDEX idx_votes_group ON votes(group_id);
CREATE INDEX idx_vote_casts_vote ON vote_casts(vote_id);
CREATE INDEX idx_constitution_rules_group ON constitution_rules(group_id);
CREATE INDEX idx_rule_acceptances_rule ON rule_acceptances(rule_id);

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE constitution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_casts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile but only update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Groups: visible to members
CREATE POLICY "Groups viewable by members" ON groups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );
CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Chairperson can update group" ON groups
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid() 
      AND group_members.role = 'chairperson'
    )
  );

-- Group members: visible to fellow group members
CREATE POLICY "Members viewable by group members" ON group_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );
CREATE POLICY "Can join groups" ON group_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Can update own membership" ON group_members
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Transactions: visible to group members
CREATE POLICY "Transactions viewable by group members" ON transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = transactions.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );
CREATE POLICY "Members can create transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = transactions.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Constitution rules: visible to group members
CREATE POLICY "Rules viewable by group members" ON constitution_rules
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = constitution_rules.group_id 
      AND group_members.user_id = auth.uid()
    )
  );
CREATE POLICY "Chairperson can manage rules" ON constitution_rules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = constitution_rules.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'chairperson'
    )
  );

-- Rule acceptances: visible to group members
CREATE POLICY "Acceptances viewable by group members" ON rule_acceptances
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can accept rules" ON rule_acceptances
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Votes: visible to group members
CREATE POLICY "Votes viewable by group members" ON votes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = votes.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );
CREATE POLICY "Members can create votes" ON votes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = votes.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Vote casts
CREATE POLICY "Vote casts viewable by group members" ON vote_casts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can cast votes" ON vote_casts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ FUNCTIONS ============

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, phone, email, avatar_initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    NEW.email,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', 'NU'), 1) || 
          COALESCE(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', 'New User') FROM POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'name', 'New User')) + 1 FOR 1), ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
