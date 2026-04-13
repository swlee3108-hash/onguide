"use client";

import { useRef } from "react";
import Philosophy from "@/components/customer/Philosophy";
import Chat from "@/components/customer/Chat";
import StaffSection from "@/components/customer/StaffSection";

export default function Home() {
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollToChat = () => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <main className="min-h-screen overflow-y-auto">
      <Philosophy onStartChat={scrollToChat} />
      <div ref={chatRef}>
        <Chat />
      </div>
      <StaffSection />
    </main>
  );
}
