"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChartNumberInput({ sessionId, initial }: { sessionId: string; initial: string | null }) {
  const [value, setValue] = useState(initial || "");
  const [saved, setSaved] = useState(!!initial);

  const save = async () => {
    if (!value.trim()) return;
    await supabase.from("tones_sessions").update({ chart_number: value.trim() }).eq("id", sessionId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); }}
        placeholder="차트번호"
        className="h-8 w-28 px-2 border border-subtle rounded-xs text-xs outline-none focus:border-a-caramel"
      />
      <button onClick={save} className="h-8 px-3 bg-a-copper text-white rounded-xs text-xs font-semibold hover:bg-a-russet transition-colors">
        {saved ? "저장됨" : "저장"}
      </button>
    </div>
  );
}
