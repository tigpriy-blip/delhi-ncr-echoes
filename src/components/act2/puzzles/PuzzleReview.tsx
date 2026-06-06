import { PuzzleShell } from "./PuzzleShell";

type Props = {
  id: string;
  title: string;
  step: number;
  fragmentLabel: string;
  fragmentValue: string;
  storyTitle: string;
  storyLines: string[];
  onBack: () => void;
};

/**
 * Read-only payoff view shown when re-opening a puzzle the player has already solved.
 * Lets them re-read the story fragment without re-doing the mechanic.
 */
export function PuzzleReview({
  id,
  title,
  step,
  fragmentLabel,
  fragmentValue,
  storyTitle,
  storyLines,
  onBack,
}: Props) {
  return (
    <PuzzleShell
      id={id}
      title={`${title} — REVIEW`}
      step={step}
      hints={[]}
      solved={false}
      onBack={onBack}
    >
      <div className="space-y-4">
        <div className="text-xs opacity-60 border border-[color:var(--crt-green)]/30 px-2 py-1 inline-block">
          PUZZLE SOLVED · REVIEW MODE
        </div>

        <div className="border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed">
          <div className="text-xs opacity-60 mb-2">// {storyTitle}</div>
          {storyLines.map((l, i) => (
            <p key={i} className={i === 0 ? "" : "mt-2"}>
              {l}
            </p>
          ))}
        </div>

        <p className="text-sm opacity-80">
          {fragmentLabel}: <span className="crt-glow">{fragmentValue}</span>
        </p>

        <div className="pt-2 border-t border-[color:var(--crt-green)]/20">
          <button
            onClick={onBack}
            className="text-xs border border-[color:var(--crt-green)]/60 px-3 py-1 hover:bg-[color:var(--crt-green)]/10 crt-glow"
          >
            [ BACK TO ARCHIVE ]
          </button>
        </div>
      </div>
    </PuzzleShell>
  );
}
