"use client";

import { useEffect, useState } from "react";

export default function AutoReset({ onReset, seconds = 60 }: { onReset: () => void; seconds?: number }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { onReset(); return seconds; }
        return r - 1;
      });
    }, 1000);

    const resetOnTouch = () => setRemaining(seconds);
    window.addEventListener("touchstart", resetOnTouch);
    window.addEventListener("click", resetOnTouch);

    return () => {
      clearInterval(timer);
      window.removeEventListener("touchstart", resetOnTouch);
      window.removeEventListener("click", resetOnTouch);
    };
  }, [onReset, seconds]);

  return (
    <div className="text-center text-[12px] text-t-hint mt-6 animate-fade-in">
      {remaining}초 후 화면이 초기화됩니다
    </div>
  );
}
