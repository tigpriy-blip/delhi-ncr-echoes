import { useState } from "react";
import { memories, type Memory } from "@/data/memories";
import { sfx } from "@/lib/audio";

type Props = { onFirstSearch?: () => void };

export function MemorySearch({ onFirstSearch }: Props) {
  const [q, setQ] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const term = q.trim().toLowerCase();
  const results: Memory[] = term
    ? memories.filter((m) =>
        m.keywords.some((k) => k.toLowerCase().includes(term)) ||
        m.caption.toLowerCase().includes(term) ||
        m.text.toLowerCase().includes(term)
      )
    : [];

  return (
    <div className="bg-white/70 rounded-2xl p-5 shadow-md h-full">
      <h2 className="scrap-head text-3xl mb-3">
        <span className="party-banner">snapshots</span> 📸
      </h2>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (!hasSearched && e.target.value.trim().length > 0) {
            setHasSearched(true);
            sfx.shutter();
            onFirstSearch?.();
          }
        }}
        placeholder="search a date or a vibe..."
        className="w-full border-b-2 border-dashed border-black/30 bg-transparent py-2 outline-none scrap-head text-xl"
      />

      <div className="mt-4 space-y-4">
        {term && results.length === 0 && (
          <p className="opacity-60 italic">hmm, nothing for that...</p>
        )}
        {results.map((m, i) => (
          <article
            key={m.id}
            className={`polaroid ${["tilt-1", "tilt-2", "tilt-3"][i % 3]} relative animate-[scale-in_0.3s_ease-out]`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="washi absolute -top-2 left-6 right-6" />
            <div className="bg-[oklch(0.85_0_0)] aspect-[4/3] grid place-items-center text-3xl">
              📷
            </div>
            <p className="scrap-head text-2xl mt-2">{m.caption}</p>
            <p className="text-sm mt-1 opacity-80">{m.text}</p>
          </article>
        ))}
        {!term && memories.length === 0 && (
          <p className="opacity-50 italic text-sm">
            [memories will appear here once they're added]
          </p>
        )}
      </div>
    </div>
  );
}
