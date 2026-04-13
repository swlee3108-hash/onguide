"use client";

import { STAFF } from "@/lib/constants";

export default function StaffSection({ onBack }: { onBack: () => void }) {
  return (
    <section className="px-10 py-12 max-w-[960px] mx-auto">
      <button onClick={onBack} className="text-xs text-a-caramel hover:text-a-copper font-medium mb-6">
        ← 처음으로
      </button>
      <div className="text-center mb-8">
        <h2 className="text-[22px] font-bold tracking-tight text-t-primary">의료진 소개</h2>
        <p className="text-sm text-t-muted mt-1">어떤 원장님께 받아도 동일한 만족도를 약속합니다</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {STAFF.map((s) => (
          <div key={s.name} className="bg-surface border border-subtle rounded-lg p-6 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center text-xl font-bold text-a-caramel">{s.initial}</div>
            <p className="text-base font-semibold text-t-primary">{s.name}</p>
            <p className="text-[11px] font-semibold tracking-wide text-a-copper mt-0.5">{s.role}</p>
            <p className="text-[13px] text-t-secondary mt-2 leading-snug">{s.philosophy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
