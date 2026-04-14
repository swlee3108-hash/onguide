"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ChartNumberInput from "./ChartNumberInput";
import type { Session } from "@/lib/types";

function buildConcernSummary(s: Session): string {
  const concerns = s.concerns ?? [];
  const subs = s.sub_concerns ?? [];
  if (concerns.length === 0 && subs.length === 0) return "-";
  const main = concerns.join(", ");
  const sub = subs.length > 0 ? ` · ${subs.join(", ")}` : "";
  return `${main}${sub}`;
}

function buildVisitLabel(s: Session): string {
  const visitType = s.profile?.visit_type;
  if (visitType) return visitType;
  return s.mode === "consult" ? "상담" : "탐색";
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const load = async () => {
      const start = `${date}T00:00:00+09:00`;
      const end = `${date}T23:59:59+09:00`;
      const { data, error } = await supabase
        .from("tones_sessions")
        .select("*")
        .gte("created_at", start)
        .lte("created_at", end)
        .or("concerns.not.is.null,profile.not.is.null")
        .order("created_at", { ascending: false });

      if (error) { console.error("session list fetch", error); return; }
      // Filter out empty sessions (no concerns, no profile)
      const meaningful = (data || []).filter((s: Session) => (s.concerns?.length ?? 0) > 0 || s.profile);
      setSessions(meaningful);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [date]);

  const total = sessions.length;
  const unlinked = sessions.filter((s) => !s.chart_number).length;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-t-primary tracking-tight">ONGUIDE Staff</h1>
          <p className="text-xs text-t-muted mt-1">톤즈의원 수원광교점 상담 세션 관리</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 border border-subtle rounded-sm text-xs outline-none focus:border-a-caramel"
          />
          <span className="text-t-muted text-xs">총 {total}건 | 미연결 {unlinked}건</span>
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle bg-muted">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-t-muted tracking-wide">시간</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-t-muted tracking-wide">방문 유형</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-t-muted tracking-wide">고민 요약</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-t-muted tracking-wide">차트번호</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-t-muted tracking-wide"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-muted hover:bg-a-caramel/[0.03] transition-colors">
                <td className="px-4 py-3 text-xs text-t-secondary">
                  {new Date(s.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-xs text-t-body">{buildVisitLabel(s)}</td>
                <td className="px-4 py-3 text-xs text-t-body max-w-[350px] truncate" title={buildConcernSummary(s)}>
                  {buildConcernSummary(s)}
                </td>
                <td className="px-4 py-3">
                  {s.chart_number ? (
                    <span className="text-xs font-semibold text-a-copper">{s.chart_number}</span>
                  ) : (
                    <ChartNumberInput sessionId={s.id} initial={null} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/staff/session/${s.id}`}
                    className="inline-flex items-center justify-center min-h-[36px] px-3 text-xs text-a-caramel hover:text-a-copper font-medium"
                  >
                    상세
                  </Link>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-t-muted text-xs">해당 날짜의 세션이 없습니다</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
