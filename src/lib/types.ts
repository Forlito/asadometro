export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  color: string;
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
};

export type Attendance = {
  event_id: string;
  user_id: string;
  checked_in_at: string;
  method: "qr" | "secret_word" | "manual";
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
};
