import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askClaude } from '../services/search';

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setAnswer('');
    try {
      const { answer: ans, filters } = await askClaude(prompt);
      if (ans) setAnswer(ans);

      const params = new URLSearchParams();
      if (filters.deities.length) params.set('deity', filters.deities.join(','));
      if (filters.cities.length) params.set('city', filters.cities.join(','));
      if (filters.regions.length) params.set('region', filters.regions.join(','));
      if (filters.festival) params.set('festival', filters.festival);
      if (filters.keywords) params.set('q', filters.keywords);
      params.set('sort', filters.sort);
      params.set('prompt', prompt.trim());
      navigate(`/temples?${params.toString()}`, { state: { answer: ans } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={large ? 'max-w-2xl mx-auto' : 'max-w-xl'}>
      <form onSubmit={onSubmit} className="flex gap-2" role="search">
        <input
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setAnswer(''); }}
          placeholder='Try "Shiva temples near Milpitas with Navratri poojas"'
          aria-label="Ask about Bay Area temples"
          className={`flex-1 rounded-full border border-[#e8d5b5] bg-white text-ink placeholder:text-[#a3947d] px-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-saffron ${
            large ? 'py-4 text-lg' : 'py-2.5'
          }`}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-maroon text-white px-6 font-semibold hover:bg-[#5f1616] disabled:opacity-60 min-h-[44px]"
        >
          {busy ? '…' : 'Ask'}
        </button>
      </form>

      {answer && (
        <div className="mt-3 bg-white/90 border border-[#e8d5b5] rounded-2xl px-5 py-4 text-left shadow-sm">
          <p className="text-[13px] font-semibold text-maroon mb-1 flex items-center gap-1.5">
            🪔 Temple guide
          </p>
          <p className="text-[15px] text-ink leading-relaxed">{answer}</p>
          <p className="text-[12px] text-muted mt-2">Showing matching temples below ↓</p>
        </div>
      )}
    </div>
  );
}
