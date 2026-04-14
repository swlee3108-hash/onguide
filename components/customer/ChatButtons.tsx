"use client";

import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

const BUTTON_BASE = "min-h-[44px] px-4 py-2.5 border rounded-full text-[13px] font-medium transition-all duration-200";

export function SingleSelect({ options, onSelect }: { options: Option[]; onSelect: (value: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2 animate-fade-in">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`${BUTTON_BASE} bg-surface border-subtle text-t-body hover:border-a-caramel hover:text-a-copper hover:bg-a-caramel/5 active:bg-a-caramel/10`}
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
  const reachedLimit = !!maxSelect && selected.length >= maxSelect;

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (maxSelect && prev.length >= maxSelect) return prev;
      return [...prev, value];
    });
  };

  return (
    <div className="mt-2 animate-fade-in">
      {maxSelect && (
        <p className="text-[11px] text-t-muted mb-2">
          최대 {maxSelect}개까지 선택할 수 있어요 ({selected.length}/{maxSelect})
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const isSelected = selected.includes(o.value);
          const dim = !isSelected && reachedLimit;
          return (
            <button
              key={o.value}
              onClick={() => toggle(o.value)}
              className={`${BUTTON_BASE} ${
                isSelected
                  ? "bg-a-caramel/10 border-a-caramel text-a-copper"
                  : dim
                  ? "bg-surface border-subtle text-t-hint cursor-default"
                  : "bg-surface border-subtle text-t-body hover:border-a-caramel hover:text-a-copper"
              }`}
            >
              {o.label}
            </button>
          );
        })}
        <button
          onClick={() => { if (selected.length > 0) onSubmit(selected); }}
          className={`${BUTTON_BASE} font-semibold ${
            selected.length > 0
              ? "bg-cta text-white border-cta"
              : "bg-subtle text-t-hint border-subtle cursor-default"
          }`}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
}
