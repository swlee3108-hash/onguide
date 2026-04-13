"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ChartNumberInput from "./ChartNumberInput";
import type { Session } from "@/lib/types";

interface SessionWithPreview extends Session {
  first_user_msg?: string;
}

export default function SessionList() {
  const [sessions, setSessions] = useState<SessionWithPreview[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const load = async () => {
      const start = `${date}T00:00:00+09:00`;
      const end = `${date}T23:59:59+09:00`;
      const { data } = await supabase
        .from("tones_sessions")
        .select("*")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });

      if (!data) return;

      const enriched = await Promise.all(
        data.map(async (s: Session) => {
          const { data: msgs } = await supabase
            .from("tones_messages")
            .select("content")
            .eq("session_id", s.id)
            .eq("role", "user")
            .order("created_at")
            .limit(3);
          const preview = msgs?.map((m: { content: string }) => m.content).join(" / ") || "";
          return { ...s, first_user_msg: preview };
        })
      );

      setSessions(enriched);
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
          <p className="text-xs text-t-muted mt-1">상담 세션 관리</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 px-3 border border-subtle rounded-sm text-xs outline-none focus:border-a-caramel"
          />
          <span className="text-t-muted text-xs">총 {total}건 | 미연결 {unlinked}건</span>
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle bg-muted">
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-t-muted tracking-wide">시간</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-t-muted tracking-wide">방문유형</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-t-muted tracking-wide">고민 요약</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-t-muted tracking-wide">차트번호</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-t-muted tracking-wide"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-muted hover:bg-a-caramel/[0.03] transition-colors">
                <td className="px-4 py-3 text-xs text-t-secondary">
                  {new Date(s.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-xs text-t-body">{s.mode === "consult" ? "상담" : "탐색"}</td>
                <td className="px-4 py-3 text-xs text-t-body max-w-[300px] truncate">{s.first_user_msg || "-"}</td>
                <td className="px-4 py-3">
                  {s.chart_number ? (
                    <span className="text-xs font-semibold text-a-copper">#{s.chart_number}</span>
                  ) : (
                    <ChartNumberInput sessionId={s.id} initial={null} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/staff/session/${s.id}`} className="text-xs text-a-caramel hover:text-a-copper font-medium">
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
