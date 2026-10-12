import { useState } from 'react';

interface Props {
  answer: string;
  webSnippet: string;
}

export default function AnswerPanels({ answer, webSnippet }: Props) {
  // Auto-expand web panel when temple guide has no answer
  const [webOpen, setWebOpen] = useState(!answer);

  if (!answer && !webSnippet) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Temple guide — always visible when present */}
      {answer && (
        <div className="bg-[#fdf6ee] border border-[#e8d5b5] rounded-2xl px-5 py-4">
          <p className="text-[11px] font-semibold text-maroon mb-1.5 uppercase tracking-wider">
            🪔 Temple guide
          </p>
          <p className="text-[14px] text-ink leading-relaxed">{answer}</p>
        </div>
      )}

      {/* Web knowledge — collapsible */}
      {webSnippet && (
        <div className="border border-[#c7d2fe] rounded-2xl overflow-hidden">
          <button
            onClick={() => setWebOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 bg-[#f0f4ff] hover:bg-[#e8edff] transition-colors text-left"
            aria-expanded={webOpen}
          >
            <span className="text-[11px] font-semibold text-[#4338ca] uppercase tracking-wider">
              🌐 From the web
            </span>
            <span className="text-[#4338ca] text-sm">{webOpen ? '▲' : '▼'}</span>
          </button>
          {webOpen && (
            <div className="px-5 py-4 bg-white">
              <p className="text-[14px] text-[#374151] leading-relaxed">{webSnippet}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
