"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SystemBubble, UserBubble, LoadingBubble } from "./ChatBubble";
import { SingleSelect, MultiSelect } from "./ChatButtons";
import ProfileCard from "./ProfileCard";
import AutoReset from "./AutoReset";
import { CONCERNS, SUB_CONCERNS, PRIORITIES } from "@/lib/constants";
import type { Profile, ChatResponse } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Stage flow (see design spec):
// 0    visit type (처음/재방문)
// 0.5  revisit purpose
// 0.6  revisit prev treatment (free input)
// 0.7  revisit satisfaction
// 1    concern categories (multi)
// 2    sub-concerns (multi)
// 3    treatment experience yes/no
// 3.5  (yes) what treatment? (free input)
// 3.7  (yes) satisfaction
// 4    priorities (multi, max 2)
// 5    additional notes
// 6    done + profile
type Stage = number;

type Role = "assistant" | "user";

interface Msg {
  role: Role;
  content: string;
}

const SATISFACTION_OPTIONS = [
  { label: "만족스러웠어요", value: "만족스러웠어요" },
  { label: "보통이었어요", value: "보통이었어요" },
  { label: "기대에 못 미쳤어요", value: "기대보다 효과가 부족했어요" },
  { label: "불편한 점이 있었어요", value: "불편한 점이 있었어요" },
];

const FREE_INPUT_STAGES = new Set([0.6, 3.5, 5]);

export default function Chat({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [stage, setStage] = useState<Stage>(0);
  const [stageHistory, setStageHistory] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Track messages in a ref so async callbacks always see the latest
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  const sessionIdRef = useRef<string>("");
  sessionIdRef.current = sessionId;

  // Track whether the session row has been created in the DB
  const sessionCreatedRef = useRef(false);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, loading, stage]);

  const reset = useCallback(() => {
    const id = crypto.randomUUID();
    setMessages([]);
    messagesRef.current = [];
    setStage(0);
    setStageHistory([]);
    setProfile(null);
    setSessionId(id);
    sessionIdRef.current = id;
    setSelectedConcerns([]);
    setInputValue("");
    sessionCreatedRef.current = false;
  }, []);

  // Ensure a tones_sessions row exists. Returns when the insert resolves.
  // Subsequent calls are no-ops.
  const ensureSession = useCallback(async () => {
    if (sessionCreatedRef.current) return;
    sessionCreatedRef.current = true;
    const { error } = await supabase.from("tones_sessions").insert({ id: sessionIdRef.current, mode: "browse" });
    if (error) {
      console.error("tones_sessions insert failed", error);
      sessionCreatedRef.current = false; // allow retry
      throw error;
    }
  }, []);

  useEffect(() => { reset(); }, [reset]);

  const addSys = (text: string) => {
    const next = [...messagesRef.current, { role: "assistant" as const, content: text }];
    messagesRef.current = next;
    setMessages(next);
  };
  const addUsr = (text: string) => {
    const next = [...messagesRef.current, { role: "user" as const, content: text }];
    messagesRef.current = next;
    setMessages(next);
  };

  const logMessages = async (userText: string, systemText: string) => {
    const { error } = await supabase.from("tones_messages").insert([
      { session_id: sessionIdRef.current, role: "user", content: userText },
      { session_id: sessionIdRef.current, role: "system", content: systemText },
    ]);
    if (error) console.error("tones_messages insert failed", error);
  };

  const callAI = async (allMsgs: Msg[], userText: string): Promise<ChatResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMsgs, session_id: sessionIdRef.current }),
      });
      if (!res.ok) throw new Error(`chat api ${res.status}`);
      const data: ChatResponse = await res.json();
      setLoading(false);
      if (data.reply) addSys(data.reply);
      if (data.profile) setProfile(data.profile);
      // Fire-and-forget logging, but await ensureSession first via the caller
      logMessages(userText, data.reply || "");
      return data;
    } catch (err) {
      console.error("callAI error", err);
      setLoading(false);
      addSys("죄송합니다. 잠시 연결이 원활하지 않습니다.");
      return null;
    }
  };

  const advanceTo = (nextStage: Stage) => {
    setStageHistory((h) => [...h, stage]);
    setStage(nextStage);
  };

  const goToPrevStage = () => {
    if (stageHistory.length === 0) { onBack(); return; }
    const prev = stageHistory[stageHistory.length - 1];
    setStageHistory((h) => h.slice(0, -1));
    // Remove the last user message + the AI reply that preceded it (the question)
    const msgs = messagesRef.current;
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) { if (msgs[i].role === "user") { lastUserIdx = i; break; } }
    if (lastUserIdx >= 0) {
      const cutFrom = lastUserIdx > 0 && msgs[lastUserIdx - 1].role === "assistant" ? lastUserIdx - 1 : lastUserIdx;
      const trimmed = msgs.slice(0, cutFrom);
      messagesRef.current = trimmed;
      setMessages(trimmed);
    }
    setStage(prev);
  };

  const persistTags = async (field: "concerns" | "sub_concerns", values: string[]) => {
    const { error } = await supabase.from("tones_sessions").update({ [field]: values }).eq("id", sessionIdRef.current);
    if (error) console.error(`update ${field} failed`, error);
  };

  const persistProfile = async (p: Profile) => {
    const { error } = await supabase.from("tones_sessions").update({
      profile: p,
      ended_at: new Date().toISOString(),
    }).eq("id", sessionIdRef.current);
    if (error) console.error("profile save failed", error);
  };

  const onSelect = async (value: string) => {
    // Ensure session row exists before any message insert
    try { await ensureSession(); } catch { /* logged */ }
    addUsr(value);
    const newMsgs: Msg[] = [...messagesRef.current];

    if (stage === 0) {
      advanceTo(value.includes("다녀본") ? 0.5 : 1);
      await callAI(newMsgs, value);
    } else if (stage === 0.5) {
      if (value.includes("유지") && !value.includes("새로운") && !value.includes("둘")) {
        advanceTo(0.6);
      } else {
        advanceTo(1);
      }
      await callAI(newMsgs, value);
    } else if (stage === 0.6) {
      advanceTo(0.7);
      await callAI(newMsgs, value);
    } else if (stage === 0.7) {
      advanceTo(5);
      await callAI(newMsgs, value);
    } else if (stage === 1) {
      const concerns = value.split(", ");
      setSelectedConcerns(concerns);
      persistTags("concerns", concerns);
      advanceTo(2);
      await callAI(newMsgs, value);
    } else if (stage === 2) {
      const subs = value.split(", ");
      persistTags("sub_concerns", subs);
      advanceTo(3);
      await callAI(newMsgs, value);
    } else if (stage === 3) {
      if (value.includes("네") || value.includes("받아본")) {
        advanceTo(3.5);
      } else {
        advanceTo(4);
      }
      await callAI(newMsgs, value);
    } else if (stage === 3.5) {
      advanceTo(3.7);
      await callAI(newMsgs, value);
    } else if (stage === 3.7) {
      advanceTo(4);
      await callAI(newMsgs, value);
    } else if (stage === 4) {
      advanceTo(5);
      await callAI(newMsgs, value);
    } else if (stage === 5) {
      advanceTo(6);
      const data = await callAI(newMsgs, value);
      if (data?.profile) persistProfile(data.profile);
    }
  };

  const handleFreeInput = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    onSelect(text);
  };

  const showFreeInput = FREE_INPUT_STAGES.has(stage) && !loading;

  const renderStageUI = () => {
    if (loading) return null;
    switch (stage) {
      case 0:
        return (
          <SingleSelect
            options={[
              { label: "처음 방문이에요", value: "처음이에요" },
              { label: "다녀본 적 있어요", value: "네, 다녀본 적 있어요" },
            ]}
            onSelect={onSelect}
          />
        );
      case 0.5:
        return (
          <SingleSelect
            options={[
              { label: "기존 시술 유지/관리", value: "기존 시술 유지 및 관리 목적으로 방문했어요" },
              { label: "새로운 고민 상담", value: "새로운 고민이 있어서 상담받고 싶어요" },
              { label: "둘 다", value: "기존 시술 관리도 하고 새로운 고민도 상담받고 싶어요" },
            ]}
            onSelect={onSelect}
          />
        );
      case 0.6:
      case 3.5:
        return null; // free input only
      case 0.7:
      case 3.7:
        return <SingleSelect options={SATISFACTION_OPTIONS} onSelect={onSelect} />;
      case 1:
        return (
          <MultiSelect
            options={CONCERNS.map((c) => ({ label: c.label, value: c.value }))}
            onSubmit={(vals) => onSelect(vals.join(", "))}
          />
        );
      case 2: {
        const primary = selectedConcerns[0];
        const subs = SUB_CONCERNS[primary] || [];
        return (
          <MultiSelect
            options={subs.map((s) => ({ label: s, value: s }))}
            onSubmit={(vals) => onSelect(vals.join(", "))}
          />
        );
      }
      case 3:
        return (
          <SingleSelect
            options={[
              { label: "네, 받아봤어요", value: "네, 다른 곳에서 시술을 받아본 적 있어요" },
              { label: "아니요, 이 고민에 대해서는 처음이에요", value: "아니요, 이 고민에 대해서는 처음이에요" },
            ]}
            onSelect={onSelect}
          />
        );
      case 4:
        return (
          <MultiSelect
            options={PRIORITIES.map((p) => ({ label: p, value: p }))}
            onSubmit={(vals) => onSelect(vals.join(", "))}
            maxSelect={2}
          />
        );
      case 5:
        return (
          <SingleSelect
            options={[{ label: "아니요, 괜찮아요", value: "특별히 없어요" }]}
            onSelect={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section ref={sectionRef} className="px-10 py-10 max-w-[720px] mx-auto">
      {stage !== 6 && (
        <button
          onClick={goToPrevStage}
          className="inline-flex items-center justify-center min-h-[44px] px-4 text-sm text-a-caramel hover:text-a-copper font-medium mb-4"
        >
          ← 이전으로
        </button>
      )}
      <div className="text-center mb-6">
        <p className="text-[10px] font-bold tracking-widest text-a-caramel">AI CONCIERGE</p>
        <h2 className="text-[22px] font-bold tracking-tight text-t-primary mt-1">상담 전 간단한 안내를 도와드릴게요</h2>
        <p className="text-xs text-t-muted mt-1">고객님께 맞는 상담을 준비해드립니다</p>
      </div>
      <div className="flex flex-col gap-3 mb-6">
        {messages.length === 0 && (
          <SystemBubble text="안녕하세요, 톤즈의원 수원광교점입니다. 상담 전에 몇 가지 여쭤보고, 고객님께 맞는 상담을 준비해드릴게요." />
        )}
        {messages.map((m, i) =>
          m.role === "assistant" ? <SystemBubble key={i} text={m.content} /> : <UserBubble key={i} text={m.content} />
        )}
        {loading && <LoadingBubble />}
        {profile && <ProfileCard profile={profile} />}
        {profile && <AutoReset onReset={reset} scopeRef={sectionRef} />}
        {renderStageUI()}
        <div ref={bottomRef} />
      </div>
      {showFreeInput && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-page flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleFreeInput(); }}
            placeholder="편하게 입력해주세요..."
            className="flex-1 h-12 px-5 bg-surface border border-subtle rounded-md text-sm text-t-primary outline-none focus:border-a-caramel focus:ring-2 focus:ring-a-caramel/15 placeholder:text-t-hint transition-colors"
          />
          <button
            onClick={handleFreeInput}
            className="h-12 w-12 bg-cta text-white rounded-md text-lg flex items-center justify-center hover:bg-cta-hover disabled:bg-subtle disabled:text-t-hint transition-colors"
            aria-label="보내기"
          >
            &#8593;
          </button>
        </div>
      )}
    </section>
  );
}
