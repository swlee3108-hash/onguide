"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setAuthed(true);
  };

  if (loading) return <div className="min-h-screen bg-page flex items-center justify-center text-t-muted">로딩 중...</div>;

  if (!authed) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="bg-surface border border-subtle rounded-lg p-8 w-80 shadow-lg">
          <h2 className="text-lg font-bold text-t-primary mb-4">ONGUIDE Staff</h2>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full h-10 px-3 mb-2 border border-subtle rounded-sm text-sm outline-none focus:border-a-caramel"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="비밀번호"
            onKeyDown={(e) => { if (e.key === "Enter") login(); }}
            className="w-full h-10 px-3 mb-4 border border-subtle rounded-sm text-sm outline-none focus:border-a-caramel"
          />
          <button onClick={login} className="w-full h-10 bg-cta text-white rounded-sm text-sm font-semibold hover:bg-cta-hover transition-colors">
            로그인
          </button>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-page">{children}</div>;
}
