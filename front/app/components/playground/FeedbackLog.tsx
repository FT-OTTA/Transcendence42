"use client";

import { useEffect, useRef } from 'react';

export type FeedbackEntry = {
  id: number;
  message: string;
  type: 'card' | 'effect' | 'combat';
};

const borderByType: Record<string, string> = {
  card: 'border-purple-400/70',
  effect: 'border-green-400/60',
  combat: 'border-red-400/60',
};

export default function FeedbackLog({ feedbacks }: { feedbacks: FeedbackEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedbacks.length]);

  return (
    <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto text-xs pr-0.5">
      {feedbacks.length === 0 ? (
        <div className="text-blue-300/30 italic text-center py-2">—</div>
      ) : (
        feedbacks.map((f, i) => (
          <div
            key={f.id}
            className={`px-2 py-0.5 rounded bg-slate-800/60 border-l-2 truncate text-blue-100/80 ${borderByType[f.type] ?? 'border-blue-400/40'}`}
            style={{ opacity: Math.max(0.35, 1 - (feedbacks.length - 1 - i) * 0.07) }}
          >
            {f.message}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
