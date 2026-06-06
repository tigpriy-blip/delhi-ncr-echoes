import { useState } from "react";
import { FRIEND_NAME } from "@/lib/constants";
import { sfx } from "@/lib/audio";

type Props = {
  sealed: boolean;
  onOpen?: () => void;
  onSticker11: () => void;
};

type Phase = "wrapped" | "unwrapping" | "revealed";

export function MysteryBox({ sealed, onOpen, onSticker11 }: Props) {
  const [phase, setPhase] = useState<Phase>("wrapped");
  const [specialOpen, setSpecialOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const open = () => {
    if (phase !== "wrapped") return;
    setPhase("unwrapping");
    sfx.snap();
    setTimeout(() => sfx.paper(), 220);
    setTimeout(() => {
      sfx.chime();
      setPhase("revealed");
      onOpen?.();
    }, 900);
  };

  return (
    <div className="bg-white/70 rounded-2xl p-6 shadow-md h-full flex flex-col">
      <h2 className="scrap-head text-4xl mb-3 text-center">
        <span className="party-banner">mystery box</span> 🎀
      </h2>

      <div className="flex flex-col items-center gap-4 py-4 flex-1 justify-center min-h-[320px]">
        {phase === "wrapped" && (
          <button
            onClick={open}
            className="present-stage relative w-44 h-44 hover:scale-105 active:scale-95 transition-transform"
            aria-label="open the mystery box"
          >
            <span className="present-bob block text-[8rem] leading-none">🎁</span>
          </button>
        )}

        {phase === "unwrapping" && (
          <div className="present-stage relative w-44 h-44">
            <span className="text-[8rem] leading-none opacity-0">🎁</span>
            <span className="ribbon ribbon-left" aria-hidden />
            <span className="ribbon ribbon-right" aria-hidden />
            <span className="paper paper-tl" aria-hidden>🎁</span>
            <span className="paper paper-tr" aria-hidden>🎁</span>
            <span className="paper paper-bl" aria-hidden>🎁</span>
            <span className="paper paper-br" aria-hidden>🎁</span>
          </div>
        )}

        {phase === "revealed" && (
          <div className="polaroid tilt-2 w-full max-w-sm text-center animate-[scale-in_0.4s_ease-out]">
            <div className="washi absolute -top-2 left-6 right-6" />
            <p className="scrap-head text-4xl leading-tight mt-2">
              for {FRIEND_NAME} ♡
            </p>
            <p className="text-base mt-3 px-2">
              just a little corner of the internet to say:
              you make everything more fun. happy birthday, you absolute legend.
            </p>
            <p className="text-3xl mt-3">🎂 🎈 🎉 ✨ 🥳</p>
            <p className="scrap-head text-sm mt-2 opacity-70">— 🐹</p>
          </div>
        )}

        {phase === "revealed" && (
          <div className="mt-2 text-center">
            {!specialOpen ? (
              <button
                onClick={() => {
                  setSpecialOpen(true);
                  sfx.tick();
                }}
                className="scrap-head text-sm underline decoration-dashed underline-offset-4 opacity-60 hover:opacity-100"
              >
                open special sticker
              </button>
            ) : (
              <div className="polaroid mx-auto max-w-[180px] text-center">
                {!flipped ? (
                  <div className="py-3">
                    <div
                      className="mx-auto w-28 h-28 rounded-md grayscale opacity-90"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 40%, oklch(0.75 0 0), oklch(0.35 0 0))",
                        boxShadow: "inset 0 0 25px rgba(0,0,0,0.4)",
                      }}
                      aria-label="vintage photograph"
                    />
                    <p className="scrap-head text-xs mt-2 opacity-70">[no caption]</p>
                  </div>
                ) : (
                  <div className="py-4">
                    {sealed ? (
                      <p className="font-mono text-sm tracking-widest opacity-80">
                        [SEALED]
                      </p>
                    ) : (
                      <button
                        onClick={onSticker11}
                        className="font-mono text-sm tracking-widest underline decoration-dotted underline-offset-4 opacity-90"
                      >
                        SUBJECT IDENTIFIED
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    setFlipped((f) => !f);
                    sfx.tick();
                  }}
                  className="mt-1 text-[10px] underline opacity-60"
                >
                  flip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
