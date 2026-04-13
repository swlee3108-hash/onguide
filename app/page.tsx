"use client";

import { useState } from "react";
import Philosophy from "@/components/customer/Philosophy";
import Chat from "@/components/customer/Chat";
import StaffSection from "@/components/customer/StaffSection";

type Section = "philosophy" | "chat" | "staff";

export default function Home() {
  const [section, setSection] = useState<Section>("philosophy");

  return (
    <main className="h-screen overflow-hidden">
      {section === "philosophy" && (
        <div className="h-full overflow-y-auto">
          <Philosophy onStartChat={() => setSection("chat")} onShowStaff={() => setSection("staff")} />
        </div>
      )}
      {section === "chat" && (
        <div className="h-full overflow-y-auto">
          <Chat onBack={() => setSection("philosophy")} />
        </div>
      )}
      {section === "staff" && (
        <div className="h-full overflow-y-auto">
          <StaffSection onBack={() => setSection("philosophy")} />
        </div>
      )}
    </main>
  );
}
