import { useMemo, useRef, useState } from "react";
import { ls } from "@/lib/storage";
import { FRAGMENTS, LS } from "@/lib/constants";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PuzzleShell } from "./PuzzleShell";
import { PuzzleReview } from "./PuzzleReview";

type Props = { onComplete: () => void; onBack: () => void };

type Card = {
  id: string;
  title: string;
  sub: string;
  x: number;
  y: number;
};

const CARDS: Card[] = [
  { id: "ROHINI",   title: "ROHINI FIR",        sub: "Mar 2011 · DOC-05", x: 12, y: 18 },
  { id: "MEDICAL",  title: "MEDICAL REPORT",    sub: "Kapoor · DOC-06",   x: 38, y: 12 },
  { id: "CLUSTER",  title: "10-CASE CLUSTER",   sub: "Mathur · DOC-07",   x: 70, y: 20 },
  { id: "WITNESS",  title: "WITNESS PROFILE",   sub: "Ferretti · DOC-09", x: 86, y: 50 },
  { id: "NEURO",    title: "NEUROCHEMICAL",     sub: "Nair · DOC-10",     x: 50, y: 62 },
  { id: "CENTRAL",  title: "CENTRAL ASIA",      sub: "Tanaka · DOC-11",   x: 14, y: 50 },
  { id: "INSTITUTE",title: "INSTITUTE 7",       sub: "Sorokin · DOC-02",  x: 28, y: 84 },
  { id: "DISPOSAL", title: "DISPOSAL ORDER",    sub: "DOC-03",            x: 70, y: 84 },
  { id: "MATHUR12", title: "INTERNAL NOTE",     sub: "Mathur · DOC-12",   x: 50, y: 36 },
];

const VALID = new Set(
  [
    ["ROHINI", "MEDICAL"],
    ["MEDICAL", "NEURO"],
    ["CLUSTER", "CENTRAL"],
    ["WITNESS", "NEURO"],
    ["INSTITUTE", "NEURO"],
    ["INSTITUTE", "DISPOSAL"],
    ["MATHUR12", "NEURO"],
    ["MATHUR12", "WITNESS"],
  ].map(([a, b]) => [a, b].sort().join("|"))
);
const REQUIRED = 5;


const HINTS = [
  "Look for cards that describe the same case, the same person, or the same effect.",
  "The neurochemical signature in DOC-10 ties Delhi, Central Asia, and the 1961 Institute together.",
  "Try: ROHINI↔MEDICAL, MEDICAL↔NEURO, WITNESS↔NEURO, INSTITUTE↔NEURO, MATHUR12↔NEURO, MATHUR12↔WITNESS.",
];


const edgeKey = (a: string, b: string) => [a, b].sort().join("|");

type Edge = { a: string; b: string; ok: boolean };

export function Puzzle3CaseBoard({ onComplete, onBack }: Props) {
  if (ls.getBool(LS.puzzleComplete(3))) {
    return (
      <PuzzleReview
        id="p3"
        title="CASE BOARD"
        step={3}
        fragmentLabel="FRAGMENT 03"
        fragmentValue={FRAGMENTS[2]}
        storyTitle="STORY FRAGMENT 03 — PATTERN"
        storyLines={[
          "Rohini 2011 wasn't the first. It was the first one logged.",
          "Same neurochemical residue. Same witness who can't describe a face. Same hollowed-out body.",
          "Delhi. Kabul. Dushanbe. Vienna in 1978. A Sorokin lab assistant in 1962.",
          "A fearless child grows up needing something. He has been feeding for sixty years.",
        ]}
        onBack={onBack}
      />
    );
  }
  const [selected, setSelected] = useState<string | null>(null);
  const [edges, setEdges] = usePersistedState<Edge[]>(LS.puzzleState("p3"), []);
  const [wrongFlash, setWrongFlash] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const validCount = edges.filter((e) => e.ok).length;
  const reveal = validCount >= REQUIRED;

  const onCard = (id: string) => {
    if (!selected) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const k = edgeKey(selected, id);
    if (edges.some((e) => edgeKey(e.a, e.b) === k)) {
      setSelected(null);
      return;
    }
    const ok = VALID.has(k);
    const newEdge: Edge = { a: selected, b: id, ok };
    setEdges([...edges, newEdge]);
    setSelected(null);
    if (!ok) {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 400);
      setTimeout(() => {
        setEdges((prev) => prev.filter((e) => edgeKey(e.a, e.b) !== k));
      }, 900);
    }
  };

  const cardById = useMemo(
    () => Object.fromEntries(CARDS.map((c) => [c.id, c])),
    []
  );

  const submit = () => {
    ls.set(LS.fragment(3), FRAGMENTS[2]);
    ls.setBool(LS.puzzleComplete(3), true);
    onComplete();
  };

  return (
    <PuzzleShell
      id="p3"
      title="CASE BOARD"
      step={3}
      hints={HINTS}
      solved={reveal}
      onBack={onBack}
    >
      <p className="opacity-70 text-sm mb-3">
        Click two cards to string them together. Wrong connections snap. Build {REQUIRED} valid
        links to surface the original case file. — CONNECTIONS:{" "}
        <span className="crt-glow">{validCount} / {REQUIRED}</span>
      </p>

      <div
        ref={boardRef}
        className={`relative w-full aspect-[16/10] border border-[color:var(--crt-green)]/40 overflow-hidden transition-colors ${
          wrongFlash ? "border-red-500" : ""
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--crt-green) 6%, transparent), transparent 60%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--crt-green) 4%, transparent), transparent 60%)",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {edges.map((e, i) => {
            const a = cardById[e.a];
            const b = cardById[e.b];
            if (!a || !b) return null;
            const midY = (a.y + b.y) / 2 + 4;
            const midX = (a.x + b.x) / 2;
            return (
              <path
                key={i}
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                stroke={e.ok ? "var(--crt-green)" : "#ef4444"}
                strokeWidth={e.ok ? 0.5 : 0.3}
                fill="none"
                opacity={e.ok ? 1 : 0.6}
                style={e.ok ? { filter: "drop-shadow(0 0 2px var(--crt-green))" } : undefined}
              />
            );
          })}
        </svg>

        {CARDS.map((c) => {
          const isSel = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onCard(c.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-left text-xs border border-[color:var(--crt-green)] bg-black/60 hover:bg-[color:var(--crt-green)]/10 ${
                isSel ? "crt-glow ring-2 ring-[color:var(--crt-green)]" : ""
              }`}
              style={{ left: `${c.x}%`, top: `${c.y}%`, minWidth: 130 }}
            >
              <div className="font-bold">{c.title}</div>
              <div className="opacity-60 text-[10px]">{c.sub}</div>
            </button>
          );
        })}

        {reveal && (
          <button
            onClick={submit}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-3 text-center bg-black border-2 border-[color:var(--crt-green)] crt-glow animate-pulse"
          >
            <div className="text-[10px] opacity-70">CASE FILE — REASSEMBLED</div>
            <div className="text-2xl font-bold tracking-widest">ROH-000</div>
            <div className="text-[10px] opacity-70 mt-1">[ COMMIT FRAGMENT ]</div>
          </button>
        )}
      </div>

      {reveal && (
        <div className="mt-4 border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed">
          <div className="text-xs opacity-60 mb-2">// STORY FRAGMENT 03 — PATTERN</div>
          <p>Rohini 2011 wasn&apos;t the first. It was the first one logged.</p>
          <p className="mt-2">Same neurochemical residue. Same witness who can&apos;t describe a face. Same hollowed-out body.</p>
          <p className="mt-2">Delhi. Kabul. Dushanbe. Vienna in 1978. A Sorokin lab assistant in 1962.</p>
          <p className="mt-2 opacity-70">A fearless child grows up needing something. He has been feeding for sixty years.</p>
        </div>
      )}

      {selected && (
        <p className="mt-2 text-xs opacity-60">selected: {cardById[selected]?.title} — click another card to connect</p>
      )}
    </PuzzleShell>
  );
}
