"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ChartNumberInput from "@/components/staff/ChartNumberInput";
import type { Session, Message } from "@/lib/types";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase.from("tones_sessions").select("*").eq("id", id).single().then(({ data }) => setSession(data));
    supabase.from("tones_messages").select("*").eq("session_id", id).order("created_at").then(({ data }) => setMessages(data || []));
  }, [id]);

  if (!session) return <div className="p-8 text-t-muted">로딩 중...</div>;

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
