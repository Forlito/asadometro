export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_cut: string | null;
  preferred_achura: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  color: string;
  photo_url: string | null;
  require_approval: boolean;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
};

export type AsadoEvent = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  event_date: string;
  secret_word: string;
  created_by: string;
  created_at: string;
  venue: string | null;
  asador_id: string | null;
  guest_count: number | null;
  cost_ars: number | null;
  usd_rate: number | null;
  notes: string | null;
};

export type Attendance = {
  event_id: string;
  user_id: string;
  checked_in_at: string;
  method: "qr" | "secret_word" | "manual";
};

export type EventPhoto = {
  id: string;
  event_id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
};

export type EventComment = {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type EventWithDetails = AsadoEvent & {
  creator: Profile;
  attendees: (Attendance & { profile: Profile })[];
};

export type GroupWithMembers = Group & {
  members: (GroupMember & { profile: Profile })[];
  event_count: number;
};

export type MemberStats = {
  profile: Profile;
  attended: number;
  missed: number;
  rate: number;
  hosted: number;
  grilled: number;
  average_rating?: number;
};

export type EventRating = {
  event_id: string;
  user_id: string;
  rating: number;
  created_at: string;
};

export type JoinRequest = {
  id: string;
  group_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
