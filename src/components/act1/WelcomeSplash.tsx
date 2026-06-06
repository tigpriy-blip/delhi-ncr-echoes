import { useEffect } from "react";
import { ss } from "@/lib/storage";
import { LS } from "@/lib/constants";

type Props = { name: string; onDone: () => void };

const COLORS = [
  "var(--party-pink)",
  "var(--party-teal)",
  "var(--party-lilac)",
  "var(--party-mint)",
  "var(--highlight)",
  "var(--washi)",
];

export function WelcomeSplash({ name, onDone }: Props) {
  useEffect(() => {
    ss.set(LS.splashShown, "1");
    const t = setTimeout(onDone, 2200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  return (
    <div
      className="splash-overlay"
      onClick={onDone}
      role="button"
      aria-label="dismiss welcome"
    >
      <div className="splash-confetti" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 53) % 100}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${(i % 12) * 0.08}s`,
              animationDuration: `${1.8 + ((i * 7) % 18) / 10}s`,
              transform: `rotate(${(i * 41) % 360}deg)`,
            }}
          />
        ))}
      </div>

      <div className="splash-balloons" aria-hidden>
        {["🎈", "🎈", "🎈", "🎈", "🎈", "🎈", "🎉", "🎊"].map((b, i) => (
          <span
            key={i}
            className="splash-balloon"
            style={{
              left: `${8 + i * 11}%`,
              fontSize: `${48 + ((i * 17) % 28)}px`,
              animationDelay: `${(i % 5) * 0.18}s`,
              animationDuration: `${2.2 + ((i * 3) % 8) / 10}s`,
            }}
          >
            {b}
          </span>
        ))}
      </div>

      <div className="splash-title">
        <div className="scrap-head splash-title-line">HAPPY</div>
        <div className="scrap-head splash-title-line splash-title-big">
          BIRTHDAY
        </div>
        <div className="scrap-head splash-title-line">
          <span className="party-banner">{name}</span> !!!
        </div>
        <p className="scrap-head splash-tap">(tap anywhere to start)</p>
      </div>
    </div>
  );
}
