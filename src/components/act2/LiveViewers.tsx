import { useEffect, useState } from "react";

type Props = {
  /** When true, observer joins permanently (Batch 4 reached). */
  observerPresent: boolean;
};

function fakeTimestamp() {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, "0");
  const m = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  const s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function LiveViewers({ observerPresent }: Props) {
  const [count, setCount] = useState(1);
  const [glitch, setGlitch] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Permanent join when Batch 4 unlocked
  useEffect(() => {
    if (!observerPresent) return;
    setGlitch(true);
    setCount(2);
    setNote(`● UNKNOWN OBSERVER JOINED [${fakeTimestamp()}]`);
    const t = setTimeout(() => setGlitch(false), 600);
    return () => clearTimeout(t);
  }, [observerPresent]);

  // Random brief flickers before observer is permanent
  useEffect(() => {
    if (observerPresent) return;
    let cancelled = false;

    const schedule = () => {
      const wait = 45000 + Math.random() * 75000; // 45-120s
      return setTimeout(() => {
        if (cancelled) return;
        setGlitch(true);
        setCount(2);
        setNote(`● UNKNOWN OBSERVER PINGED [${fakeTimestamp()}]`);
        setTimeout(() => {
          if (cancelled) return;
          setGlitch(false);
        }, 500);
        const hold = 4000 + Math.random() * 4000; // 4-8s
        setTimeout(() => {
          if (cancelled) return;
          setCount(1);
          setNote(null);
          timer = schedule();
        }, hold);
      }, wait);
    };

    let timer = schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [observerPresent]);

  return (
    <div
      className={`fixed top-3 right-3 z-40 text-[10px] md:text-xs font-mono border border-[color:var(--crt-green)]/40 bg-black/70 px-2 py-1 leading-tight pointer-events-none select-none ${
        glitch ? "crt-glow animate-pulse" : "opacity-70"
      }`}
      aria-live="polite"
    >
      <div className={count > 1 ? "crt-glow" : ""}>
        ● LIVE · VIEWERS: {count}
      </div>
      {note && <div className="opacity-80 mt-0.5">{note}</div>}
    </div>
  );
}
