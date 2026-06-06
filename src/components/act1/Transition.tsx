import { useEffect, useState } from "react";
import { spike } from "@/lib/audio";
import {
  LOADER_CRAWL_MS,
  LOADER_STALL_AT,
  LOADER_STALL_MS,
  TRANSITION_FLASH_MS,
} from "@/lib/constants";

type Stage = "oh" | "drain" | "flash" | "loader";

export function Transition({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("oh");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (stage !== "oh") return;
    const t = setTimeout(() => setStage("drain"), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "drain") return;
    const t = setTimeout(() => {
      spike(180);
      setStage("flash");
    }, 2000);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "flash") return;
    const t = setTimeout(() => setStage("loader"), TRANSITION_FLASH_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "loader") return;
    let cancelled = false;
    let p = 0;
    const stepMs = LOADER_CRAWL_MS / LOADER_STALL_AT;
    const crawl = setInterval(() => {
      if (cancelled) return;
      p += 1;
      setPct(p);
      if (p >= LOADER_STALL_AT) {
        clearInterval(crawl);
        setTimeout(() => {
          if (cancelled) return;
          setPct(100);
          setTimeout(() => !cancelled && onComplete(), 400);
        }, LOADER_STALL_MS);
      }
    }, stepMs);
    return () => {
      cancelled = true;
      clearInterval(crawl);
    };
  }, [stage, onComplete]);

  if (stage === "oh") {
    return (
      <div data-act="1" className="min-h-screen grid place-items-center">
        <div className="flex items-end gap-2">
          <div className="text-7xl">🐹</div>
          <div className="bg-white border-2 border-black rounded-2xl px-4 py-2 scrap-head text-2xl">
            oh.
          </div>
        </div>
      </div>
    );
  }

  if (stage === "drain") {
    return (
      <div data-act="1" className="min-h-screen drain grid place-items-center">
        <div className="flex items-end gap-2">
          <div className="text-7xl">🐹</div>
          <div className="bg-white border-2 border-black rounded-2xl px-4 py-2 scrap-head text-2xl">
            oh.
          </div>
        </div>
      </div>
    );
  }

  if (stage === "flash") {
    return <div className="min-h-screen bg-white" />;
  }

  // loader
  return (
    <div className="min-h-screen bg-black text-white font-mono grid place-items-center px-6">
      <div className="w-full max-w-md">
        <p className="text-sm mb-4 tracking-wider">RESTORING SECURE CONNECTION...</p>
        <div className="h-2 w-full bg-white/10 rounded-sm overflow-hidden">
          <div
            className="h-full bg-white/80 transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-70">{pct}%</p>
      </div>
    </div>
  );
}
