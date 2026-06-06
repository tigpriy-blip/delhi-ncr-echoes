import { useEffect, useRef, useState } from "react";
import { typeText, type TypeSignal } from "@/lib/typeText";

const SCRIPT = [
  "INITIALIZING SECURE CONNECTION...",
  "VERIFYING CREDENTIALS...",
  "ACCESS GRANTED — TIER 5",
  "",
  "WELCOME TO THE STILLWATER ARCHIVE",
  "CLASSIFICATION: EYES ONLY",
  "UNAUTHORIZED ACCESS IS A CRIMINAL",
  "OFFENCE UNDER THE OFFICIAL SECRETS",
  "ACT 1923",
  "",
  "[PRESS ANY KEY TO CONTINUE]",
];

export function LoginSequence({ onContinue }: { onContinue: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const signalRef = useRef<TypeSignal>({ cancelled: false, skip: false });

  useEffect(() => {
    const sig: TypeSignal = { cancelled: false, skip: false };
    signalRef.current = sig;
    (async () => {
      for (let i = 0; i < SCRIPT.length; i++) {
        if (sig.cancelled) return;
        if (sig.skip) {
          setLines(SCRIPT.slice());
          break;
        }
        const target = SCRIPT[i];
        setLines((prev) => [...prev, ""]);
        await typeText(
          target,
          (partial) =>
            setLines((prev) => {
              const next = [...prev];
              next[next.length - 1] = partial;
              return next;
            }),
          18,
          sig
        );
        if (sig.skip) {
          setLines(SCRIPT.slice());
          break;
        }
        await new Promise((r) => setTimeout(r, target === "" ? 100 : 300));
      }
      if (!sig.cancelled) setDone(true);
    })();
    return () => {
      sig.cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        signalRef.current.skip = true;
        setLines(SCRIPT.slice());
        setDone(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    const handle = () => onContinue();
    window.addEventListener("keydown", handle, { once: true });
    window.addEventListener("click", handle, { once: true });
    return () => {
      window.removeEventListener("keydown", handle);
      window.removeEventListener("click", handle);
    };
  }, [done, onContinue]);

  const skip = () => {
    signalRef.current.skip = true;
    setLines(SCRIPT.slice());
    setDone(true);
  };

  return (
    <div>
      <pre className="whitespace-pre-wrap text-sm md:text-base crt-glow leading-relaxed">
        {lines.map((l, i) => (
          <div key={i}>{l || "\u00A0"}</div>
        ))}
      </pre>
      {!done && (
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
