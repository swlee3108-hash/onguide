"use client";

import { useState } from "react";
import Philosophy from "@/components/customer/Philosophy";
import Chat from "@/components/customer/Chat";
import StaffSection from "@/components/customer/StaffSection";

type Section = "philosophy" | "chat" | "staff";

export default function Home() {
  const [section, setSection] = useState<Section>("philosophy");

  return (
    <main className="h-screen flex flex-col">
      {section === "philosophy" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Philosophy onStartChat={() => setSection("chat")} onShowStaff={() => setSection("staff")} />
        </div>
      )}
      {section === "chat" && (
        <Chat onBack={() => setSection("philosophy")} />
      )}
      {section === "staff" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StaffSection onBack={() => setSection("philosophy")} />
        </div>
      )}
    </main>
  );
}
