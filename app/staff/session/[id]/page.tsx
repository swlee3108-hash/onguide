"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ChartNumberInput from "@/components/staff/ChartNumberInput";
import ProfileCard from "@/components/customer/ProfileCard";
import { SUB_CONCERNS } from "@/lib/constants";
import type { Session, Message } from "@/lib/types";

interface ConcernPath {
  concern: string;
  sub: string;
}

// Prefer structured tags persisted during the flow.
// Fall back to message-based inference only when tags are absent (legacy sessions).
function buildConcernPaths(session: Session): ConcernPath[] {
  const concerns = session.concerns ?? [];
  const subs = session.sub_concerns ?? [];
  if (concerns.length === 0) return [];

  return concerns.map((concern) => {
    const pool = SUB_CONCERNS[concern] ?? [];
    const matchedSub = subs.find((s) => pool.includes(s)) ?? "";
    return { concern, sub: matchedSub };
  });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase.from("tones_sessions").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) console.error("session fetch", error);
      setSession(data);
    });
    supabase.from("tones_messages").select("*").eq("session_id", id).order("created_at").then(({ data, error }) => {
      if (error) console.error("messages fetch", error);
      setMessages(data || []);
    });
  }, [id]);

  const concernPaths = useMemo(() => (session ? buildConcernPaths(session) : []), [session]);

  const openGuide = (path: ConcernPath) => {
    let url = `/mindmap.html?view=guide&concern=${encodeURIComponent(path.concern)}`;
    if (path.sub) url += `&sub=${encodeURIComponent(path.sub)}`;
    window.open(url, "_blank");
  };

  const openMindmap = (path: ConcernPath) => {
    window.open(`/mindmap.html?view=mindmap&concern=${encodeURIComponent(path.concern)}`, "_blank");
  };

  if (!session) return <div className="p-8 text-t-muted">...</div>;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <Link
        href="/staff"
        className="inline-flex items-center min-h-[44px] text-xs text-a-caramel hover:text-a-copper font-medium"
      >
        ← 목록으로
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-t-primary">세션 상세</h1>
          <p className="text-xs text-t-muted mt-0.5">
            {new Date(session.created_at).toLocaleString("ko-KR")}
            {session.ended_at && ` ~ ${new Date(session.ended_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <ChartNumberInput sessionId={session.id} initial={session.chart_number} />
      </div>

      {/* AI-generated profile summary */}
      {session.profile && (
        <div className="mb-6">
          <ProfileCard profile={session.profile} />
        </div>
      )}

      {/* Concern-based tools */}
      {concernPaths.length > 0 && (
        <div className="mb-6 p-4 bg-surface border border-subtle rounded-lg shadow-sm">
          <p className="text-[11px] font-semibold text-t-muted tracking-wide mb-3">고민 기반 상담 도구</p>
          <div className="flex flex-col gap-2">
            {concernPaths.map((path) => (
              <div key={path.concern} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-t-primary px-2 py-1 bg-muted rounded-xs">{path.concern}</span>
                {path.sub && (
                  <span className="text-xs text-t-secondary px-2 py-1 bg-muted rounded-xs">{path.sub}</span>
                )}
                <button
                  onClick={() => openGuide(path)}
                  className="inline-flex items-center min-h-[36px] text-[11px] font-medium text-a-caramel hover:text-a-copper px-3 py-1.5 border border-subtle rounded-xs hover:border-a-caramel transition-colors"
                >
                  상담가이드
                </button>
                <button
                  onClick={() => openMindmap(path)}
                  className="inline-flex items-center min-h-[36px] text-[11px] font-medium text-a-caramel hover:text-a-copper px-3 py-1.5 border border-subtle rounded-xs hover:border-a-caramel transition-colors"
                >
                  마인드맵
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw conversation */}
      <div className="bg-surface border border-subtle rounded-lg p-6 shadow-sm">
        <p className="text-[11px] font-semibold text-t-muted tracking-wide mb-3">대화 전문</p>
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "self-end ml-auto bg-cta text-white rounded-br-xs"
                  : "self-start bg-muted text-t-body rounded-bl-xs"
              }`}
            >
              {m.content}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-xs text-t-muted text-center py-4">대화 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
