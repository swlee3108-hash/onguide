import type { Profile } from "@/lib/types";

export default function ProfileCard({ profile }: { profile: Profile }) {
  const primary = profile.primary_concern;
  const secondary = profile.secondary_concerns ?? [];
  const priorities = profile.priorities ?? [];
  const prevTx = profile.previous_treatments;

  const rows: { label: string; value: string }[] = [];
  if (profile.visit_type) rows.push({ label: "방문 유형", value: profile.visit_type });
  if (primary?.area) {
    rows.push({
      label: "주요 고민",
      value: primary.detail ? `${primary.area} - ${primary.detail}` : primary.area,
    });
  }
  if (secondary.length > 0) {
    rows.push({
      label: "추가 고민",
      value: secondary.map((s) => s.area).filter(Boolean).join(", "),
    });
  }
  if (prevTx?.has_experience && prevTx.details) {
    rows.push({ label: "이전 시술", value: prevTx.details });
  }
  if (priorities.length > 0) {
    rows.push({ label: "우선순위", value: priorities.join(", ") });
  }
  if (profile.additional_notes) {
    rows.push({ label: "전달사항", value: profile.additional_notes });
  }
  if (profile.conversation_tone_memo) {
    rows.push({ label: "메모", value: profile.conversation_tone_memo });
  }

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
