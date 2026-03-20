-- Profile preferences: preferred cut and achura
ALTER TABLE profiles ADD COLUMN preferred_cut text;
ALTER TABLE profiles ADD COLUMN preferred_achura text;
ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
