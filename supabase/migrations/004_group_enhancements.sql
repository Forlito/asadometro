-- Group photo (may already exist, use IF NOT EXISTS)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS photo_url text;

-- Group approval mode
ALTER TABLE groups ADD COLUMN require_approval boolean DEFAULT false;

-- Join requests table
CREATE TABLE join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Admins can see join requests for their groups
CREATE POLICY "Admins can view join requests" ON join_requests FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can see their own requests
CREATE POLICY "Users can see own requests" ON join_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can create join requests
CREATE POLICY "Users can request to join" ON join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update join request status
CREATE POLICY "Admins can manage requests" ON join_requests FOR UPDATE
  USING (group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'
  ));
