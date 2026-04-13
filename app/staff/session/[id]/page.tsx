"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ChartNumberInput from "@/components/staff/ChartNumberInput";
import { CONCERNS } from "@/lib/constants";
import type { Session, Message } from "@/lib/types";

function extractConcerns(msgs: Message[]): string[] {
  const userTexts = msgs.filter((m) => m.role === "user").map((m) => m.content).join(" ");
  return CONCERNS.map((c) => c.value).filter((concern) => {
    const keywords = concern.split("/");
    return keywords.some((kw) => userTexts.includes(kw));
  });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase.from("tones_sessions").select("*").eq("id", id).single().then(({ data }) => setSession(data));
    supabase.from("tones_messages").select("*").eq("session_id", id).order("created_at").then(({ data }) => setMessages(data || []));
  }, [id]);

  const detectedConcerns = useMemo(() => extractConcerns(messages), [messages]);

  const openGuide = (concern: string) => {
    window.open(`/mindmap.html?view=guide&concern=${encodeURIComponent(concern)}`, "_blank");
  };

  const openMindmap = (concern: string) => {
    window.open(`/mindmap.html?view=mindmap&concern=${encodeURIComponent(concern)}`, "_blank");
  };

  if (!session) return <div className="p-8 text-t-muted">...</div>;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <Link href="/staff" className="text-xs text-a-caramel hover:text-a-copper font-medium">
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

      {/* Guide / Mindmap buttons */}
      {detectedConcerns.length > 0 && (
        <div className="mb-6 p-4 bg-surface border border-subtle rounded-lg shadow-sm">
          <p className="text-[11px] font-semibold text-t-muted tracking-wide mb-3">고민 기반 상담 도구</p>
          <div className="flex flex-wrap gap-2">
            {detectedConcerns.map((concern) => (
              <div key={concern} className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-t-body px-2 py-1 bg-muted rounded-xs">{concern}</span>
                <button
                  onClick={() => openGuide(concern)}
                  className="text-[11px] font-medium text-a-caramel hover:text-a-copper px-2 py-1 border border-subtle rounded-xs hover:border-a-caramel transition-colors"
                >
                  상담가이드
                </button>
                <button
                  onClick={() => openMindmap(concern)}
                  className="text-[11px] font-medium text-a-caramel hover:text-a-copper px-2 py-1 border border-subtle rounded-xs hover:border-a-caramel transition-colors"
                >
                  마인드맵
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="bg-surface border border-subtle rounded-lg p-6 shadow-sm">
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
        </div>
      </div>
    </div>
  );
}
