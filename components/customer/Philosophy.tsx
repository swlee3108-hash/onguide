"use client";

export default function Philosophy({ onStartChat, onShowStaff }: { onStartChat: () => void; onShowStaff: () => void }) {
  const cards = [
    {
      num: "FIRST ON", title: "아름다움", accent: "피부의 ON",
      body: "여러 에너지를 동시에 켜서 시너지를 만듭니다. 레이저의 열, 고주파의 에너지, 초음파의 진동을 고객에게 맞는 조합으로 큐레이션합니다.",
      tags: ["시너지", "큐레이션", "복합 설계"],
    },
    {
      num: "SECOND ON", title: "성장", accent: "이해의 ON",
      body: "시술 과정을 설명하며 고객이 자기 피부를 이해하기 시작합니다. 왜 이 조합인지, 어떤 원리인지. 이해하는 순간 만족도가 달라집니다.",
      tags: ["원리 설명", "맞춤 설계", "고객 이해"],
    },
    {
      num: "THIRD ON", title: "지속가능성", accent: "관계의 ON",
      body: "한번 켜진 ON은 꺼지지 않습니다. 피부 사진이 축적되고, 다음 조합이 큐레이션되고, 재방문할 때마다 관계가 깊어집니다.",
      tags: ["피부 기록", "지속 관리", "관계의 큐레이션"],
    },
  ];

  return (
    <section className="px-10 py-12 max-w-[960px] mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-t-primary leading-tight">당신의 피부를 이해하는 곳</h1>
        <p className="text-sm text-t-muted mt-2">톤즈의원 광교점</p>
      </div>
      <div className="grid grid-cols-3 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.num} className="bg-surface border border-subtle rounded-lg p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <p className="text-[11px] font-bold tracking-widest text-a-copper mb-2">{c.num}</p>
            <h2 className="text-xl font-bold tracking-tight text-t-primary mb-1">{c.title}</h2>
            <p className="text-sm font-medium text-a-caramel mb-2">{c.accent}</p>
            <p className="text-[13px] text-t-body leading-relaxed">{c.body}</p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {c.tags.map((t) => (
                <span key={t} className="text-[10px] font-medium text-t-muted bg-muted px-2 py-0.5 rounded-xs">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <button onClick={onStartChat} className="inline-flex items-center h-12 px-8 bg-cta text-white rounded-md text-[15px] font-semibold shadow-md hover:bg-cta-hover hover:-translate-y-px hover:shadow-lg transition-all duration-200">
          고민 상담 시작하기
        </button>
        <button onClick={onShowStaff} className="inline-flex items-center h-12 px-6 bg-surface border border-subtle text-t-secondary rounded-md text-[14px] font-medium hover:border-a-caramel hover:text-a-copper transition-all duration-200">
          의료진 소개
        </button>
      </div>
    </section>
  );
}
