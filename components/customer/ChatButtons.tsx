"use client";

import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

export function SingleSelect({ options, onSelect }: { options: Option[]; onSelect: (value: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2 animate-fade-in">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className="px-4 py-2 bg-surface border border-subtle rounded-full text-[13px] font-medium text-t-body hover:border-a-caramel hover:text-a-copper hover:bg-a-caramel/5 active:bg-a-caramel/10 transition-all duration-200"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function MultiSelect({
  options,
  onSubmit,
  maxSelect,
}: {
  options: Option[];
  onSubmit: (values: string[]) => void;
  maxSelect?: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (maxSelect && prev.length >= maxSelect) return prev;
      return [...prev, value];
    });
  };

  return (
    <div className="flex gap-2 flex-wrap mt-2 animate-fade-in">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => toggle(o.value)}
          className={`px-4 py-2 border rounded-full text-[13px] font-medium transition-all duration-200 ${
            selected.includes(o.value)
              ? "bg-a-caramel/10 border-a-caramel text-a-copper"
              : "bg-surface border-subtle text-t-body hover:border-a-caramel hover:text-a-copper"
          }`}
        >
          {o.label}
        </button>
      ))}
      <button
        onClick={() => { if (selected.length > 0) onSubmit(selected); }}
        className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
          selected.length > 0
            ? "bg-cta text-white border border-cta"
            : "bg-subtle text-t-hint border border-subtle cursor-default"
        }`}
      >
        선택 완료
      </button>
    </div>
  );
}
