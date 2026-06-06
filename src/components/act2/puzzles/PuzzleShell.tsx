import { useEffect, useState, type ReactNode } from "react";
import { ls } from "@/lib/storage";
import { LS } from "@/lib/constants";
import { sfx } from "@/lib/audio";

type Props = {
  id: string;
  title: string;
  step: number; // 1..4
  total?: number;
  hints: string[];
  solved: boolean;
  onBack: () => void;
  children: ReactNode;
};

export function PuzzleShell({
  id,
  title,
  step,
  total = 4,
  hints,
  solved,
  onBack,
  children,
}: Props) {
  const [revealed, setRevealed] = useState(0);
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    setRevealed(ls.getNum(LS.puzzleHints(id), 0));
  }, [id]);

  useEffect(() => {
    if (solved) {
      sfx.stamp();
      setShowStamp(true);
    }
  }, [solved]);

  const reveal = () => {
    if (revealed >= hints.length) return;
    const next = revealed + 1;
    setRevealed(next);
    ls.set(LS.puzzleHints(id), String(next));
    sfx.tick();
  };

  return (
    <div className="max-w-4xl relative">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <div className="text-xs opacity-60">PUZZLE {step} / {total}</div>
          <h2 className="crt-glow text-lg">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reveal}
            disabled={revealed >= hints.length || solved}
            className="text-xs border border-[color:var(--crt-green)]/60 px-2 py-1 hover:bg-[color:var(--crt-green)]/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            [ STUCK? ] {revealed > 0 && `(${revealed}/${hints.length})`}
          </button>
          <button onClick={onBack} className="text-xs underline opacity-80">[BACK]</button>
        </div>
      </div>

      {revealed > 0 && !solved && (
        <div className="mb-4 border border-[color:var(--crt-green)]/30 bg-[color:var(--crt-green)]/5 p-3 text-sm space-y-1">
          {hints.slice(0, revealed).map((h, i) => (
            <p key={i} className="opacity-90">
              <span className="opacity-60">HINT {i + 1}:</span> {h}
            </p>
          ))}
        </div>
      )}

      {children}

      {showStamp && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center z-30">
          <div className="solved-stamp">SOLVED</div>
        </div>
      )}
    </div>
  );
}
