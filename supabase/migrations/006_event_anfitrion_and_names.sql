-- Add custom name fields for asador and anfitrion
-- Allows selecting a member OR typing a custom name for both roles

-- Custom asador name (when not selecting a member)
ALTER TABLE events ADD COLUMN asador_name text;

-- Anfitrion can now be someone other than the creator
ALTER TABLE events ADD COLUMN anfitrion_id uuid REFERENCES profiles(id);
ALTER TABLE events ADD COLUMN anfitrion_name text;

-- Add nickname field to profiles
ALTER TABLE profiles ADD COLUMN nickname text;
