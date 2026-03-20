-- Anonymous asador ratings (1-10)
CREATE TABLE event_ratings (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone in the event's group can see aggregate ratings
CREATE POLICY "Members can view ratings" ON event_ratings FOR SELECT
  USING (event_id IN (
    SELECT e.id FROM events e
    JOIN group_members gm ON gm.group_id = e.group_id
    WHERE gm.user_id = auth.uid()
  ));

-- Attendees can insert their own rating
CREATE POLICY "Attendees can rate" ON event_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND event_id IN (
      SELECT event_id FROM attendance WHERE user_id = auth.uid()
    )
  );

-- Users can update their own rating
CREATE POLICY "Users can update own rating" ON event_ratings FOR UPDATE
  USING (auth.uid() = user_id);
