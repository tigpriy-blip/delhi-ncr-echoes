import { useEffect, useRef, useState } from "react";
import { ls } from "@/lib/storage";
import { LS, FOUND_YOU_HOLD_MS } from "@/lib/constants";
import { stopDrone } from "@/lib/audio";
import { typeText, type TypeSignal } from "@/lib/typeText";

type Stage = "reveal" | "oh" | "glitch" | "black" | "found" | "flash";

const ONGOING_FULL = `[FILE: ONGOING.rec]
[TYPE: RECORDING — PARTIAL RECOVERY]
[RECOVERY STATUS: CORRUPTED]

INITIALIZING RECOVERY...

R▒▒▒▒ ▒▒▒▒▒▒▒ ▒▒▒▒▒▒▒ ▒▒▒ ▒▒▒▒▒▒▒▒

▒▒▒▒▒ 4,849 ▒▒▒▒▒▒▒▒▒ ▒▒▒▒▒ ▒▒▒▒
▒▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒ ▒▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒

▒▒▒▒ ▒▒▒▒▒ YOU ▒▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒ ▒▒▒▒▒ YOU ▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

▒▒ ▒▒▒▒▒▒▒▒▒ ▒▒▒▒ ▒▒ ▒▒▒▒▒▒ ▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ YOU ▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

▒▒▒ YOU ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒ YOU ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

YOU

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

[RECOVERY FAILED]
[TERMINAL ERROR — UNRECOVERABLE]
[SESSION: ONGOING]
`;

export function Ending() {
  const [stage, setStage] = useState<Stage>("reveal");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const sigRef = useRef<TypeSignal>({ cancelled: false, skip: false });

  // Type out the corrupted recording
  useEffect(() => {
    if (stage !== "reveal") return;
    const sig: TypeSignal = { cancelled: false, skip: false };
    sigRef.current = sig;
    setText("");
    setTyping(true);
    (async () => {
      await typeText(ONGOING_FULL, setText, 4, sig);
      if (sig.cancelled) return;
      setTyping(false);
      setTimeout(() => setStage("oh"), 1200);
    })();
    return () => {
      sig.cancelled = true;
    };
  }, [stage]);

  // "oh." beat
  useEffect(() => {
    if (stage !== "oh") return;
    const t = setTimeout(() => setStage("glitch"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "glitch") return;
    const t = setTimeout(() => setStage("black"), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "black") return;
    const t = setTimeout(() => setStage("found"), 900);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "found") return;
    const t = setTimeout(() => {
      stopDrone();
      ls.setBool(LS.hasSeenEnding, true);
      setStage("flash");
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.reload();
      }, 200);
    }, FOUND_YOU_HOLD_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const skip = () => {
    sigRef.current.skip = true;
    setText(ONGOING_FULL);
    setTyping(false);
    setStage("oh");
  };

  if (stage === "reveal" || stage === "oh") {
    return (
      <div className="max-w-3xl">
        <pre className="text-sm md:text-base leading-relaxed crt-glow whitespace-pre-wrap terminal-cursor">
          {text}
        </pre>
        {stage === "oh" && (
          <p className="mt-8 text-2xl opacity-80">oh.</p>
        )}
        {typing && (
          <button
            onClick={skip}
            className="mt-4 text-xs underline opacity-60 hover:opacity-100"
          >
            [SKIP ▸]
          </button>
        )}
      </div>
    );
  }

  if (stage === "glitch") {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-[color:var(--crt-green)] grid place-items-center animate-pulse">
        <pre className="text-xs scale-110 skew-y-1 whitespace-pre">{ONGOING_FULL}</pre>
      </div>
    );
  }

  if (stage === "black") {
    return <div className="fixed inset-0 z-[100] bg-black" />;
  }

  if (stage === "flash") {
    return <div className="fixed inset-0 z-[100] bg-white" />;
  }

  // found
  return (
    <div className="fixed inset-0 z-[100] bg-black grid place-items-center">
      <h1 className="text-white font-mono text-5xl md:text-7xl tracking-widest">
        FOUND YOU
      </h1>
    </div>
  );
}
