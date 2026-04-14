"use client";

import { useEffect, useState, type RefObject } from "react";

interface AutoResetProps {
  onReset: () => void;
  seconds?: number;
  scopeRef?: RefObject<HTMLElement>;
}

export default function AutoReset({ onReset, seconds = 60, scopeRef }: AutoResetProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { onReset(); return seconds; }
        return r - 1;
      });
    }, 1000);

    const resetOnTouch = () => setRemaining(seconds);
    const target: HTMLElement | Window = scopeRef?.current ?? window;
    target.addEventListener("touchstart", resetOnTouch);
    target.addEventListener("click", resetOnTouch);

    return () => {
      clearInterval(timer);
      target.removeEventListener("touchstart", resetOnTouch);
      target.removeEventListener("click", resetOnTouch);
    };
  }, [onReset, seconds, scopeRef]);

  return (
    <div className="text-center text-[12px] text-t-hint mt-6 animate-fade-in">
      {remaining}초 후 화면이 초기화됩니다
    </div>
  );
}
