"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SystemBubble, UserBubble, LoadingBubble } from "./ChatBubble";
import { SingleSelect, MultiSelect } from "./ChatButtons";
import ProfileCard from "./ProfileCard";
import AutoReset from "./AutoReset";
import { CONCERNS, SUB_CONCERNS, PRIORITIES } from "@/lib/constants";
import type { Profile, ChatResponse } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Stage flow:
// 0    : visit type (처음/재방문)
// 0.5  : revisit purpose (유지관리/새고민/둘다)
// 0.6  : revisit - previous treatment free input
// 0.7  : revisit - satisfaction buttons
// 1    : concern selection (6 categories, multi)
// 2    : sub-concern selection (multi)
// 3    : treatment experience yes/no
// 3.5  : (yes) what treatment? free input
// 3.7  : (yes) satisfaction buttons
// 4    : priority selection (multi, max 2)
// 5    : additional notes (button + free input)
// 6    : done, profile displayed
type Stage = number;

interface Msg {
  role: "assistant" | "user";
  content: string;
}

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

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, loading, stage]);

  const reset = useCallback(() => {
    const id = crypto.randomUUID();
    setMessages([]);
    setStage(0);
    setStageHistory([]);
    setProfile(null);
    setSessionId(id);
    setSelectedConcerns([]);
    setInputValue("");
    supabase.from("tones_sessions").insert({ id, mode: "browse" }).then();
  }, []);

  const goToPrevStage = () => {
    if (stageHistory.length === 0) {
      onBack();
      return;
    }
    const prev = stageHistory[stageHistory.length - 1];
    setStageHistory((h) => h.slice(0, -1));
    // Remove messages: find last user msg, remove it and everything after + the AI reply before it
    setMessages((msgs) => {
      if (msgs.length === 0) return msgs;
      // Find last user message index
      let lastUserIdx = -1;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "user") { lastUserIdx = i; break; }
      }
      if (lastUserIdx < 0) return msgs;
      // Also remove the AI reply that came right before (the question that led to this answer)
      const cutFrom = lastUserIdx > 0 && msgs[lastUserIdx - 1].role === "assistant" ? lastUserIdx - 1 : lastUserIdx;
      return msgs.slice(0, cutFrom);
    });
    setStage(prev);
  };

  useEffect(() => { reset(); }, [reset]);

  const addSys = (text: string) => setMessages((prev) => [...prev, { role: "assistant", content: text }]);
  const addUsr = (text: string) => setMessages((prev) => [...prev, { role: "user", content: text }]);

  const callAI = async (allMsgs: Msg[]): Promise<ChatResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMsgs, session_id: sessionId }),
      });
      const data: ChatResponse = await res.json();
      setLoading(false);
      if (data.reply) addSys(data.reply);
      if (data.profile) setProfile(data.profile);
      supabase.from("tones_messages").insert([
        { session_id: sessionId, role: "user", content: allMsgs[allMsgs.length - 1]?.content || "" },
        { session_id: sessionId, role: "system", content: data.reply || "" },
      ]).then();
      return data;
    } catch {
      setLoading(false);
      addSys("죄송합니다. 잠시 연결이 원활하지 않습니다.");
      return null;
    }
  };

  const advanceTo = (nextStage: Stage) => {
    setStageHistory((h) => [...h, stage]);
    setStage(nextStage);
  };

  const onSelect = async (value: string) => {
    addUsr(value);
    const newMsgs: Msg[] = [...messages, { role: "user", content: value }];

    if (stage === 0) {
      // Visit type
      if (value.includes("다녀본")) {
        advanceTo(0.5);
        await callAI(newMsgs);
      } else {
        advanceTo(1);
        await callAI(newMsgs);
      }
    } else if (stage === 0.5) {
      // Revisit purpose
      if (value.includes("유지") && !value.includes("새로운") && !value.includes("둘")) {
        advanceTo(0.6);
        await callAI(newMsgs);
      } else {
        advanceTo(1);
        await callAI(newMsgs);
      }
    } else if (stage === 0.6) {
      // Revisit - previous treatment entered -> ask satisfaction
      advanceTo(0.7);
      await callAI(newMsgs);
    } else if (stage === 0.7) {
      // Revisit - satisfaction answered -> additional notes
      advanceTo(5);
      await callAI(newMsgs);
    } else if (stage === 1) {
      // Concerns selected -> sub-concerns
      setSelectedConcerns(value.split(", "));
      advanceTo(2);
      await callAI(newMsgs);
    } else if (stage === 2) {
      // Sub-concerns selected -> treatment experience
      advanceTo(3);
      await callAI(newMsgs);
    } else if (stage === 3) {
      // Treatment experience yes/no
      if (value.includes("네") || value.includes("받아본")) {
        // YES -> ask what treatment (free input)
        advanceTo(3.5);
        await callAI(newMsgs);
      } else {
        // NO -> skip to priorities
        advanceTo(4);
        await callAI(newMsgs);
      }
    } else if (stage === 3.5) {
      // What treatment? (free input) -> satisfaction
      advanceTo(3.7);
      await callAI(newMsgs);
    } else if (stage === 3.7) {
      // Satisfaction answered -> priorities
      advanceTo(4);
      await callAI(newMsgs);
    } else if (stage === 4) {
      // Priorities selected -> additional notes
      advanceTo(5);
      await callAI(newMsgs);
    } else if (stage === 5) {
      // Additional notes -> done
      advanceTo(6);
      await callAI(newMsgs);
      supabase.from("tones_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId).then();
    }
  };

  const handleFreeInput = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    onSelect(text);
  };

  // Stages that show a free text input bar
  const freeInputStages = [0.6, 3.5, 5];
  const showFreeInput = freeInputStages.includes(stage) && !loading;

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
        // Free input only (이전 시술 입력)
        return null;
      case 0.7:
        return (
          <SingleSelect
            options={[
              { label: "만족스러웠어요", value: "만족스러웠어요" },
              { label: "보통이었어요", value: "보통이었어요" },
              { label: "기대에 못 미쳤어요", value: "기대보다 효과가 부족했어요" },
              { label: "불편한 점이 있었어요", value: "불편한 점이 있었어요" },
            ]}
            onSelect={onSelect}
          />
        );
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
      case 3.5:
        // Free input only (어떤 시술 받았는지)
        return null;
      case 3.7:
        return (
          <SingleSelect
            options={[
              { label: "만족스러웠어요", value: "만족스러웠어요" },
              { label: "보통이었어요", value: "보통이었어요" },
              { label: "기대에 못 미쳤어요", value: "기대보다 효과가 부족했어요" },
              { label: "불편한 점이 있었어요", value: "불편한 점이 있었어요" },
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
    <section className="px-10 py-10 max-w-[720px] mx-auto">
      {stage !== 6 && (
        <button onClick={goToPrevStage} className="text-xs text-a-caramel hover:text-a-copper font-medium mb-4">
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
          <SystemBubble text="안녕하세요, 톤즈의원입니다. 상담 전에 몇 가지 여쭤보고, 고객님께 맞는 상담을 준비해드릴게요." />
        )}
        {messages.map((m, i) =>
          m.role === "assistant" ? <SystemBubble key={i} text={m.content} /> : <UserBubble key={i} text={m.content} />
        )}
        {loading && <LoadingBubble />}
        {profile && <ProfileCard profile={profile} />}
        {profile && <AutoReset onReset={reset} />}
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
          >
            &#8593;
          </button>
        </div>
      )}
    </section>
  );
}
