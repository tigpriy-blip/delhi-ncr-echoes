import { useState } from "react";
import { FRAGMENTS, LS } from "@/lib/constants";
import { ls } from "@/lib/storage";

type Props = { onComplete: () => void; onBack: () => void };

export function MasterPuzzle({ onComplete, onBack }: Props) {
  const alreadySolved = ls.getBool(LS.ongoingUnlocked);
  const [vals, setVals] = useState<string[]>(
    alreadySolved ? [...FRAGMENTS] : ["", "", "", ""]
  );
  const [shake, setShake] = useState(false);
  const [accepted, setAccepted] = useState<boolean[]>(
    alreadySolved ? [true, true, true, true] : [false, false, false, false]
  );
  const [phase, setPhase] = useState<"input" | "accepted" | "confirming">(
    alreadySolved ? "confirming" : "input"
  );

  const normalize = (s: string) => s.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const submit = () => {
    const correct = vals.every(
      (v, i) => normalize(v) === normalize(FRAGMENTS[i])
    );
    if (!correct) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setVals(["", "", "", ""]);
      }, 400);
      return;
    }
    setPhase("accepted");
    // green flash one by one
    [0, 1, 2, 3].forEach((i) => {
      setTimeout(() => {
        setAccepted((prev) => prev.map((p, idx) => (idx === i ? true : p)));
      }, 200 * (i + 1));
    });
    setTimeout(() => setPhase("confirming"), 1400);
    setTimeout(() => onComplete(), 9000);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="crt-glow">VERIFY_COMPOSITE.exe</h2>
        <button onClick={onBack} className="text-xs underline opacity-80">[BACK]</button>
      </div>

      {phase === "input" && (
        <div className={shake ? "animate-pulse" : ""}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <label className="opacity-80 w-32">FRAGMENT 0{i + 1}:</label>
              <input
                value={vals[i]}
                onChange={(e) =>
                  setVals((v) => v.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                className={`bg-transparent border px-2 py-1 outline-none flex-1 ${
                  shake ? "border-red-500 text-red-400" : "border-[color:var(--crt-green)]"
                }`}
              />
            </div>
          ))}
          <button
            onClick={submit}
            className="mt-4 border border-[color:var(--crt-green)] px-3 py-1 crt-glow hover:bg-[color:var(--crt-green)]/10"
          >
            [ SUBMIT SEQUENCE ]
          </button>
          {shake && <p className="mt-3 text-red-400">SEQUENCE REJECTED</p>}
        </div>
      )}

      {phase === "accepted" && (
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-2">
              FRAGMENT 0{i + 1}: {accepted[i] ? "✓ ACCEPTED" : "..."}
            </div>
          ))}
        </div>
      )}

      {phase === "confirming" && (
        <div className="space-y-3 mt-4 crt-glow text-lg">
          <p>SEQUENCE ACCEPTED</p>
          <p>IDENTITY CONFIRMED</p>
          <div className="border border-[color:var(--crt-green)]/40 p-3 text-sm leading-relaxed crt-glow-soft">
            <p className="opacity-80">1101 · MNEME · ROH-000 · 2347</p>
            <p className="mt-2">A date he was supposed to die. The name Voss gave his memory. The first case he was caught on. The minute he answered.</p>
            <p className="mt-2 opacity-70">F-13 built this archive. He left the fragments where Stillwater would find them. He hasn&apos;t forgotten a single one of you.</p>
            <p className="mt-2">You assembled them.</p>
          </div>
        </div>
      )}
    </div>
  );
}
