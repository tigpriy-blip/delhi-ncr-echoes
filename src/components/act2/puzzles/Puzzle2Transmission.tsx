import { useEffect, useRef, useState } from "react";
import { ls } from "@/lib/storage";
import { FRAGMENTS, LS } from "@/lib/constants";
import { playMorse, type MorseHandle } from "@/lib/audio";
import { PuzzleShell } from "./PuzzleShell";
import { PuzzleReview } from "./PuzzleReview";

type Props = { onComplete: () => void; onBack: () => void };

const ANSWER = "MNEME";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
};

const HINTS = [
  "The frequency log in DOC-05 lists 13.7 kHz as Voss's private channel. He kept using it after 1961.",
  "International morse code. Five letters. The pattern repeats ' — — ' twice — the same letter sits at positions 1 and 4.",
  "Greek. Daughter of Zeus. The muse Voss named him after in the private logs.",
];

function renderSignal(word: string) {
  return word
    .split("")
    .map((c) => MORSE[c] ?? "?")
    .join(" / ")
    .replace(/\./g, "·")
    .replace(/-/g, "—");
}

export function Puzzle2Transmission({ onComplete, onBack }: Props) {
  if (ls.getBool(LS.puzzleComplete(2))) {
    return (
      <PuzzleReview
        id="p2"
        title="INTERCEPTED TRANSMISSION"
        step={2}
        fragmentLabel="FRAGMENT 02"
        fragmentValue={FRAGMENTS[1]}
        storyTitle="STORY FRAGMENT 02 — MEMORY"
        storyLines={[
          "The boy they couldn't kill grew up without the mercy of forgetting.",
          "Every face. Every name. Every door that closed on him.",
          "Voss called him Mneme in the private logs — the muse of memory. A joke. It stopped being a joke around 1974.",
          "He doesn't hunt. He waits. The archive is a list, and lists end.",
        ]}
        onBack={onBack}
      />
    );
  }

  const [cells, setCells] = useState<string[]>(["", "", "", "", ""]);
  const [wrong, setWrong] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  const handleRef = useRef<MorseHandle | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const guess = cells.join("").toUpperCase();
  const done = guess === ANSWER;
  const filled = cells.every((c) => c.length === 1);

  useEffect(() => {
    return () => {
      handleRef.current?.stop();
    };
  }, []);

  const stop = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    setPlaying(false);
    setActiveLetter(null);
  };

  const playLoop = () => {
    stop();
    setPlaying(true);
    handleRef.current = playMorse(ANSWER, {
      loop: true,
      onLetter: (i: number) => setActiveLetter(i),
      onEnd: () => setActiveLetter(null),
    });
  };

  const playLetter = (i: number) => {
    stop();
    setPlaying(true);
    handleRef.current = playMorse(ANSWER[i], {
      loop: false,
      onLetter: () => setActiveLetter(i),
      onEnd: () => {
        setActiveLetter(null);
        setPlaying(false);
      },
    });
  };

  const setCell = (i: number, v: string) => {
    const ch = v.replace(/[^A-Za-z]/g, "").slice(-1).toUpperCase();
    setCells((prev) => prev.map((c, idx) => (idx === i ? ch : c)));
    if (ch && i < 4) inputsRef.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cells[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const submit = () => {
    if (!done) {
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setCells(["", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }, 500);
      return;
    }
    stop();
    ls.set(LS.fragment(2), ANSWER);
    ls.setBool(LS.puzzleComplete(2), true);
    onComplete();
  };

  return (
    <PuzzleShell
      id="p2"
      title="INTERCEPTED TRANSMISSION"
      step={2}
      hints={HINTS}
      solved={done}
      onBack={onBack}
    >
      <p className="opacity-70 text-sm mb-4">
        An unmarked carrier wave on Voss&apos;s old private channel. The same five letters,
        repeating since 1974. Decode the word.
      </p>

      <div className="border border-[color:var(--crt-green)]/40 p-4 mb-4 font-mono">
        <div className="flex items-center justify-between mb-3 text-xs opacity-70">
          <span>▣ FREQ 13.7 kHz · CARRIER LIVE</span>
          <span>{playing ? "● TRANSMITTING" : "○ IDLE"}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={playing ? stop : playLoop}
            className="border border-[color:var(--crt-green)] px-3 py-1 crt-glow hover:bg-[color:var(--crt-green)]/10"
          >
            {playing ? "[ ⏸ STOP ]" : "[ ▶ PLAY LOOP ]"}
          </button>
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => playLetter(i)}
              className="border border-[color:var(--crt-green)]/60 px-2 py-1 text-xs hover:bg-[color:var(--crt-green)]/10"
            >
              ↻ LETTER {i + 1}
            </button>
          ))}
        </div>

        <div className="text-xl tracking-widest mb-1">
          {ANSWER.split("").map((c, i) => {
            const code = (MORSE[c] || "").replace(/\./g, "·").replace(/-/g, "—");
            return (
              <span
                key={i}
                className={`inline-block mr-4 transition-all ${
                  activeLetter === i ? "crt-glow text-[color:var(--crt-green)]" : "opacity-50"
                }`}
              >
                {code}
              </span>
            );
          })}
        </div>
        <div className="text-xs opacity-50">
          signal: {renderSignal(ANSWER)}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs opacity-60 mb-2">DECODE</div>
        <div className={`flex gap-2 ${wrong ? "animate-pulse" : ""}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={cells[i]}
              onChange={(e) => setCell(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              maxLength={1}
              className={`w-12 h-12 text-center text-xl font-mono bg-transparent border outline-none ${
                wrong
                  ? "border-red-500 text-red-400"
                  : "border-[color:var(--crt-green)] crt-glow"
              }`}
            />
          ))}
        </div>
        {wrong && <p className="mt-2 text-red-400 text-sm">SIGNAL MISMATCH</p>}
      </div>

      <button
        onClick={submit}
        disabled={!filled}
        className="border border-[color:var(--crt-green)] px-3 py-1 crt-glow hover:bg-[color:var(--crt-green)]/10 disabled:opacity-30 disabled:cursor-not-allowed mb-4"
      >
        [ DECODE TRANSMISSION ]
      </button>

      <div className="border-t border-[color:var(--crt-green)]/20 pt-3">
        <button
          onClick={() => setChartOpen((o) => !o)}
          className="text-xs opacity-60 hover:opacity-100 underline"
        >
          {chartOpen ? "[hide]" : "[show]"} MORSE REFERENCE
        </button>
        {chartOpen && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-1 text-xs font-mono opacity-80">
            {Object.entries(MORSE).map(([letter, code]) => (
              <div key={letter}>
                <span className="crt-glow mr-2">{letter}</span>
                <span>{code.replace(/\./g, "·").replace(/-/g, "—")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {done && (
        <div className="mt-6 space-y-3">
          <p className="crt-glow">TRANSMISSION DECODED: MNEME</p>
          <div className="border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed">
            <div className="text-xs opacity-60 mb-2">// STORY FRAGMENT 02 — MEMORY</div>
            <p>The boy they couldn&apos;t kill grew up without the mercy of forgetting.</p>
            <p className="mt-2">Every face. Every name. Every door that closed on him.</p>
            <p className="mt-2">Voss called him <em>Mneme</em> in the private logs — the muse of memory. A joke. It stopped being a joke around 1974.</p>
            <p className="mt-2 opacity-70">He doesn&apos;t hunt. He waits. The archive is a list, and lists end.</p>
          </div>
          <p className="text-sm opacity-80">FRAGMENT CANDIDATE: <span className="crt-glow">MNEME</span></p>
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
