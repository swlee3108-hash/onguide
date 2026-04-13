export function SystemBubble({ text }: { text: string }) {
  return (
    <div className="max-w-[75%] self-start bg-muted text-t-body rounded-xl rounded-bl-xs px-[18px] py-3.5 text-sm leading-relaxed animate-fade-in">
      {text}
    </div>
  );
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="max-w-[75%] self-end ml-auto bg-cta text-white rounded-xl rounded-br-xs px-[18px] py-3.5 text-sm leading-relaxed animate-fade-in">
      {text}
    </div>
  );
}

export function LoadingBubble() {
  return (
    <div className="max-w-[75%] self-start bg-muted text-t-muted rounded-xl rounded-bl-xs px-6 py-3.5 text-sm animate-fade-in">
      ...
    </div>
  );
}
