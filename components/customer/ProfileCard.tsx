import type { Profile } from "@/lib/types";

export default function ProfileCard({ profile }: { profile: Profile }) {
  const rows = [
    { label: "방문 유형", value: profile.visit_type },
    profile.primary_concern && {
      label: "주요 고민",
      value: `${profile.primary_concern.area} - ${profile.primary_concern.detail}`,
    },
    profile.secondary_concerns?.length > 0 && {
      label: "추가 고민",
      value: profile.secondary_concerns.map((s) => s.area).join(", "),
    },
    profile.priorities?.length > 0 && {
      label: "우선순위",
      value: profile.priorities.join(", "),
    },
    profile.conversation_tone_memo && {
      label: "메모",
      value: profile.conversation_tone_memo,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-[85%] bg-surface border-2 border-a-caramel rounded-lg p-5 mt-4 shadow-md animate-fade-in">
      <p className="text-sm font-bold text-a-copper mb-3 pb-2 border-b border-muted">상담 준비 완료</p>
      {rows.map((r) => (
        <div key={r.label} className="flex gap-2 mb-2 text-[13px] leading-snug">
          <span className="shrink-0 w-20 font-semibold text-t-muted">{r.label}</span>
          <span className="text-t-primary">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
