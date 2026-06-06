import { useMemo, useState } from "react";
import { ls } from "@/lib/storage";
import { FRAGMENTS, LS } from "@/lib/constants";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PuzzleShell } from "./PuzzleShell";
import { PuzzleReview } from "./PuzzleReview";

type Props = { onComplete: () => void; onBack: () => void };

type Q = { q: string; a: boolean; ref: string };

const POOL: Q[] = [
  { q: "Was Project I formally authorized in 1957?", a: true, ref: "DOC-01" },
  { q: "Was F-13 the fourteenth subject of Project I?", a: true, ref: "DOC-02" },
  { q: "Did Dr. Sorokin personally perform F-13's disposal?", a: false, ref: "DOC-03 (assigned to Baryshev & Volkov)" },
  { q: "Was Form BD-7/CONF filed on time?", a: false, ref: "DOC-03 admin note" },
  { q: "Did Dr. Voss die of cardiac arrest in March 1963?", a: true, ref: "DOC-04 header" },
  { q: "Did F-13 recognize staff member 7 (Marchetti) after 2 months absent?", a: true, ref: "DOC-02, 10 Jan entry" },
  { q: "Did Sorokin describe F-13's memory as 'retrieval'?", a: false, ref: "DOC-02 (he called it 'playback')" },
  { q: "Was the incineration scheduled for 23:00 on 11 January 1961?", a: true, ref: "DOC-03" },
  { q: "Was Dr. Voss the Program Lead of Project I?", a: false, ref: "DOC-01 (Sorokin was Lead; Voss was Institute Director)" },
  { q: "Did F-13 touch the back of Voss's hand in their final session?", a: true, ref: "DOC-04" },
];

const HINTS = [
  "Every answer can be checked against BATCH 01 documents — open them in another tab.",
  "Pay close attention to who signed, who performed, and what was filed late.",
  "Match dates exactly. 23:00 vs 23:30 matters.",
];

const TARGET = "11.01.1961";
const REDACTED_LINES = [
  "AUTHORIZATION ████████ ████████████",
  "PROJECT  ████  ██████  ████████████",
  "SUBJECT  ████████  ████  ████████",
  "DISPOSAL ████████████ ██████████",
  "STAMPED  ████████████",
  "                              ████████",
];
const CLEAR_LINES = [
  "AUTHORIZATION GRU/DSR/57-114-F",
  "PROJECT  I  [INSTINCT SUPPRESSION]",
  "SUBJECT  F-13  [SUBJECT FOURTEEN]",
  "DISPOSAL ORDER  I7/DISP/61-014-F",
  "STAMPED  SOVERSHENNO SEKRETNO",
  `                              ${TARGET}`,
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Puzzle1Redaction({ onComplete, onBack }: Props) {
  if (ls.getBool(LS.puzzleComplete(1))) {
    return (
      <PuzzleReview
        id="p1"
        title="REDACTION LIFT"
        step={1}
        fragmentLabel="FRAGMENT 01"
        fragmentValue={FRAGMENTS[0]}
        storyTitle="STORY FRAGMENT 01 — ORIGIN"
        storyLines={[
          "In 1957 the GRU authorized Project I: engineer children incapable of fear.",
          "Sorokin built fourteen of them. Thirteen failed. The fourteenth — F-13 — did not.",
          "On 11 January 1961 the disposal order was signed. F-13 was supposed to die that night.",
          "\n",
        ]}
        onBack={onBack}
      />
    );
  }
  
  const [queue, setQueue] = useState<Q[]>(() => shuffle(POOL).slice(0, 6));
  const [idx, setIdx] = useState(0);
  const [cleared, setCleared] = usePersistedState<number>(LS.puzzleState("p1_cleared"), 0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [revealStamp, setRevealStamp] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ ok: boolean; ref: string } | null>(null);

  const current = queue[idx];
  const done = cleared >= 6;

  const lines = useMemo(
    () => REDACTED_LINES.map((r, i) => (i < cleared ? CLEAR_LINES[i] : r)),
    [cleared]
  );

  const answer = (val: boolean) => {
    if (!current || done) return;
    const ok = val === current.a;
    setLastFeedback({ ok, ref: current.ref });
    if (ok) {
      const next = cleared + 1;
      setCleared(next);
      if (next >= 6) {
        setTimeout(() => setRevealStamp(true), 400);
      } else {
        setIdx((i) => i + 1);
      }
    } else {
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        setCleared(0);
        setIdx(0);
        setQueue(shuffle(POOL).slice(0, 6));
        setLastFeedback(null);
      }, 900);
    }
  };

  const submit = () => {
    ls.set(LS.fragment(1), FRAGMENTS[0]);
    ls.setBool(LS.puzzleComplete(1), true);
    onComplete();
  };

  return (
    <PuzzleShell
      id="p1"
      title="REDACTION LIFT"
      step={1}
      hints={HINTS}
      solved={done && revealStamp}
      onBack={onBack}
    >
      <p className="opacity-70 text-sm mb-3">
        Cross-reference BATCH 01 documents. Each correct response lifts a redaction.
        A single wrong response re-redacts the document.
      </p>

      <pre
        className={`text-sm md:text-base leading-relaxed border border-[color:var(--crt-green)]/40 p-4 mb-6 transition-colors ${
          wrongFlash ? "border-red-500 text-red-400" : ""
        } ${revealStamp ? "crt-glow" : ""}`}
      >
        {lines.join("\n")}
      </pre>

      {!done && current && (
        <div className="space-y-3">
          <div className="text-sm opacity-70">
            QUERY {idx + 1} / 6 — cleared {cleared} / 6
          </div>
          <div className="border border-[color:var(--crt-green)]/40 p-3">
            <p className="mb-3">&gt; {current.q}</p>
            <div className="flex gap-3">
              <button
                onClick={() => answer(true)}
                className="border border-[color:var(--crt-green)] px-4 py-1 hover:bg-[color:var(--crt-green)]/10"
              >
                [ Y ]
              </button>
              <button
                onClick={() => answer(false)}
                className="border border-[color:var(--crt-green)] px-4 py-1 hover:bg-[color:var(--crt-green)]/10"
              >
                [ N ]
              </button>
            </div>
          </div>
          {lastFeedback && !lastFeedback.ok && (
            <p className="text-red-400 text-sm">REDACTION REINSTATED — cross-reference failed.</p>
          )}
          {lastFeedback && lastFeedback.ok && (
            <p className="text-xs opacity-60">ref: {lastFeedback.ref}</p>
          )}
        </div>
      )}

      {done && (
        <div className="space-y-3">
          <p className="crt-glow">DATE STAMP RECOVERED: {TARGET}</p>
          <div className="border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed">
            <div className="text-xs opacity-60 mb-2">// STORY FRAGMENT 01 — ORIGIN</div>
            <p>In 1957 the GRU authorized Project I: engineer children incapable of fear.</p>
            <p className="mt-2">Sorokin built fourteen of them. Thirteen failed. The fourteenth — F-13 — did not.</p>
            <p className="mt-2">On 11 January 1961 the disposal order was signed. F-13 was supposed to die that night.</p>
            <p className="mt-2 opacity-70">{"\n"}</p>
          </div>
          <p className="text-sm opacity-80">FRAGMENT CANDIDATE: <span className="crt-glow">1101</span></p>
          <button
            onClick={submit}
            className="mt-2 border border-[color:var(--crt-green)] px-3 py-1 crt-glow hover:bg-[color:var(--crt-green)]/10"
          >
            [ COMMIT FRAGMENT → ARCHIVE ]
          </button>
        </div>
      )}
    </PuzzleShell>
  );
}
