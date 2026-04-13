export interface Session {
  id: string;
  created_at: string;
  ended_at: string | null;
  mode: "browse" | "consult";
  device_id: string | null;
  chart_number: string | null;
}

export interface Message {
  id: string;
  session_id: string;
  role: "system" | "user";
  content: string;
  created_at: string;
}

export interface Profile {
  visit_type: string;
  primary_concern: { area: string; detail: string };
  secondary_concerns: { area: string; detail: string }[];
  previous_treatments: { has_experience: boolean; details: string; at_tonz: boolean };
  priorities: string[];
  additional_notes: string;
  conversation_tone_memo: string;
}

export interface ChatResponse {
  reply: string;
  program_cards: { name: string; tier: string; desc: string }[];
  profile: Profile | null;
  session_id: string;
  provider: string;
}
