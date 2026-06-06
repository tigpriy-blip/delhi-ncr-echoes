import { useMemo, useState } from "react";
import { funfacts } from "@/data/funfacts";

type Props = { onShuffle?: () => void };

export function FunFacts({ onShuffle }: Props) {
  const pool = useMemo(
    () =>
      funfacts.length > 0
        ? funfacts
        : [
            { id: -1, category: "about you" as const, text: "[fun facts will appear here once they're added]" },
          ],
    []
  );
  const [idx, setIdx] = useState(0);
  const fact = pool[idx % pool.length];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md min-h-[260px] flex flex-col">
      <h2 className="scrap-head text-3xl mb-3">
        <span className="party-banner">did you know?</span> 🧠
      </h2>

      <div className="flex-1 grid place-items-center text-center px-2">
        <div>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${
              fact.category === "about you"
                ? "bg-black text-white"
                : "bg-black/10 text-black/70"
            }`}
          >
            {fact.category}
          </span>
          <p className="text-lg leading-snug">{fact.text}</p>
        </div>
      </div>

      <button
        onClick={() => {
          setIdx((i) => i + 1 + Math.floor(Math.random() * Math.max(1, pool.length - 1)));
          onShuffle?.();
        }}
        className="mt-4 self-center scrap-head text-2xl px-4 py-1 rounded-xl border-2 border-dashed border-black/40 hover:bg-black/5"
      >
        🎲 shuffle
      </button>
    </div>
  );
}
