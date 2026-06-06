import { useState } from "react";
import { ls } from "@/lib/storage";
import { FRAGMENTS, LS } from "@/lib/constants";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PuzzleShell } from "./PuzzleShell";
import { PuzzleReview } from "./PuzzleReview";

type Props = { onComplete: () => void; onBack: () => void };

type Event = {
  id: string;
  label: string;
  year: number;
  source: "stillwater" | "unknown";
};

const EVENTS: Event[] = [
  { id: "GRU",      label: "GRU Project I authorized",         year: 1957, source: "unknown" },
  { id: "F13",      label: "F-13 final assessment notes",      year: 1961, source: "unknown" },
  { id: "ARCH07",   label: "ARCH-07 Gennady entry uploaded",   year: 2016, source: "unknown" },
  { id: "VOSS_OBIT",label: "Voss obituary (Vienna press)",     year: 1991, source: "unknown" },
  { id: "CA04",     label: "MSF/Roux Dushanbe field report",   year: 1996, source: "unknown" },
  { id: "MATHUR07", label: "Mathur cross-reference memo",      year: 2021, source: "unknown" },
  { id: "SW",       label: "Stillwater constituted",           year: 2022, source: "stillwater" },
  { id: "FERR",     label: "Ferretti witness analysis",        year: 2022, source: "stillwater" },
  { id: "NAIR",     label: "Nair neurochemical consult",       year: 2022, source: "stillwater" },
  { id: "MATHUR12", label: "Mathur internal note (unsent)",    year: 2022, source: "stillwater" },
  { id: "FIELD19",  label: "FIELD-19 personnel update",        year: 2022, source: "stillwater" },
];

const HINTS = [
  "Stillwater was constituted in January 2022. Anything dated before that came from somewhere else.",
  "Six entries are pre-Jan 2022. One of them — ARCH-07 — was uploaded by the operator themselves, into their own archive.",
  "All five 2022 entries belong to Stillwater. The other six are UNKNOWN.",
];


function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

type PersistedState = {
  poolIds: string[];
  stillwaterIds: string[];
  unknownIds: string[];
};

const byId = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

export function Puzzle4Timeline({ onComplete, onBack }: Props) {
  if (ls.getBool(LS.puzzleComplete(4))) {
    return (
      <PuzzleReview
        id="p4"
        title="TIMELINE"
        step={4}
        fragmentLabel="FRAGMENT 04"
        fragmentValue={FRAGMENTS[3]}
        storyTitle="STORY FRAGMENT 04 — IDENTITY"
        storyLines={[
          "Stillwater was set up to find him. Six entries existed before Stillwater did.",
          "Someone has been uploading them. Someone inside the archive.",
          "FIELD-19 was filed at 23:47. The archive was accessed at 23:49 — two minutes later — while Anand was still in transit and Mathur was on the phone realizing what the metadata meant.",
          "The archivist is the subject. F-13 has been reading along the whole time. He wanted to be found.",
        ]}
        onBack={onBack}
      />
    );
  }
  const [initialPool] = useState<Event[]>(() => shuffle(EVENTS));
  const [state, setState] = usePersistedState<PersistedState>(
    LS.puzzleState("p4"),
    {
      poolIds: initialPool.map((e) => e.id),
      stillwaterIds: [],
      unknownIds: [],
    }
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const pool = state.poolIds.map((id) => byId[id]).filter(Boolean);
  const stillwater = state.stillwaterIds.map((id) => byId[id]).filter(Boolean);
  const unknown = state.unknownIds.map((id) => byId[id]).filter(Boolean);

  const drop = (target: "stillwater" | "unknown") => {
    if (!dragging) return;
    const ev = byId[dragging];
    if (!ev || !state.poolIds.includes(dragging)) {
      setDragging(null);
      return;
    }
    if (ev.source === target) {
      setState({
        poolIds: state.poolIds.filter((id) => id !== ev.id),
        stillwaterIds: target === "stillwater" ? [...state.stillwaterIds, ev.id] : state.stillwaterIds,
        unknownIds: target === "unknown" ? [...state.unknownIds, ev.id] : state.unknownIds,
      });
    } else {
      setWrong(ev.id);
      setTimeout(() => setWrong(null), 500);
    }
    setDragging(null);
  };

  const done = pool.length === 0;

  const submit = () => {
    ls.set(LS.fragment(4), FRAGMENTS[3]);
    ls.setBool(LS.puzzleComplete(4), true);
    onComplete();
  };

  return (
    <PuzzleShell
      id="p4"
      title="TIMELINE"
      step={4}
      hints={HINTS}
      solved={done}
      onBack={onBack}
    >
      <p className="opacity-70 text-sm mb-4">
        Stillwater began Jan 2022. Sort each archive entry by what could have produced it:
        the team itself, or a source that predates them. Drag (or tap then choose column).
      </p>

      <div className="border border-[color:var(--crt-green)]/40 p-3 mb-4 min-h-[80px]">
        <div className="text-xs opacity-60 mb-2">UNSORTED — {pool.length}</div>
        <div className="flex flex-wrap gap-2">
          {pool.map((e) => (
            <button
              key={e.id}
              draggable
              onDragStart={() => setDragging(e.id)}
              onDragEnd={() => setDragging(null)}
              onClick={() => setDragging(dragging === e.id ? null : e.id)}
              className={`px-2 py-1 text-xs border border-[color:var(--crt-green)] hover:bg-[color:var(--crt-green)]/10 cursor-grab ${
                wrong === e.id ? "border-red-500 text-red-400 animate-pulse" : ""
              } ${dragging === e.id ? "bg-[color:var(--crt-green)]/20 crt-glow" : ""}`}
            >
              {e.label} <span className="opacity-50">· {e.year}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop("unknown")}
          onClick={() => dragging && drop("unknown")}
          className="border border-[color:var(--crt-green)]/40 p-3 min-h-[160px]"
        >
          <div className="text-xs opacity-60 mb-2">SOURCE: UNKNOWN — pre-Jan 2022</div>
          <ul className="space-y-1 text-sm">
            {unknown.map((e) => (
              <li key={e.id} className="crt-glow">&gt; {e.label} <span className="opacity-50">· {e.year}</span></li>
            ))}
          </ul>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop("stillwater")}
          onClick={() => dragging && drop("stillwater")}
          className="border border-[color:var(--crt-green)]/40 p-3 min-h-[160px]"
        >
          <div className="text-xs opacity-60 mb-2">SOURCE: STILLWATER — Jan 2022+</div>
          <ul className="space-y-1 text-sm">
            {stillwater.map((e) => (
              <li key={e.id}>&gt; {e.label} <span className="opacity-50">· {e.year}</span></li>
            ))}
          </ul>
        </div>
      </div>

      {done && (
        <div className="mt-6 space-y-3">
          <p className="crt-glow">FIELD-19 FILING TIMESTAMP RECOVERED: 23:47</p>
          <div className="border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed">
            <div className="text-xs opacity-60 mb-2">// STORY FRAGMENT 04 — IDENTITY</div>
            <p>Stillwater was set up to find him. Six of these entries existed before Stillwater did.</p>
            <p className="mt-2">Someone has been uploading them. Someone inside the archive.</p>
            <p className="mt-2">FIELD-19 was filed at 23:47. The archive was accessed at 23:49 — two minutes later — while Anand was still in transit and Mathur was on the phone realizing what the metadata meant.</p>
            <p className="mt-2 opacity-70">The archivist is the subject. F-13 has been reading along the whole time. He wanted to be found.</p>
          </div>
          <p className="text-sm opacity-80">
            FRAGMENT CANDIDATE: <span className="crt-glow">2347</span>
          </p>
          <button
            onClick={submit}
            className="border border-[color:var(--crt-green)] px-3 py-1 crt-glow hover:bg-[color:var(--crt-green)]/10"
          >
            [ COMMIT FRAGMENT → ARCHIVE ]
          </button>
        </div>
      )}
    </PuzzleShell>
  );
}
