import { useCallback, useEffect, useState } from "react";
import { treasures, type Treasure } from "@/data/treasures";

// Rename these any time — they're just the on-screen sub-section headings.
const SECTION_A_LABEL = "section one";
const SECTION_B_LABEL = "section two";

const TILT = ["tilt-1", "tilt-2", "tilt-3"];

type LightboxState = { list: Treasure[]; index: number } | null;

export function TreasuresBox() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () =>
      setLightbox((lb) =>
        lb ? { ...lb, index: (lb.index + 1) % lb.list.length } : lb,
      ),
    [],
  );
  const prev = useCallback(
    () =>
      setLightbox((lb) =>
        lb
          ? { ...lb, index: (lb.index - 1 + lb.list.length) % lb.list.length }
          : lb,
      ),
    [],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, next, prev]);

  return (
    <div className="bg-white/70 rounded-2xl p-5 shadow-md h-full">
      <h2 className="scrap-head text-3xl mb-4">
        <span className="party-banner">my treasures</span> 💝
      </h2>

      <Section
        label={SECTION_A_LABEL}
        items={treasures.sectionA}
        folder="section-a"
        onOpen={(i) => setLightbox({ list: treasures.sectionA, index: i })}
      />

      <div className="my-6 border-t border-dashed border-black/20" />

      <Section
        label={SECTION_B_LABEL}
        items={treasures.sectionB}
        folder="section-b"
        onOpen={(i) => setLightbox({ list: treasures.sectionB, index: i })}
      />

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-4 animate-[fade-in_0.15s_ease-out]"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 md:left-8 text-white text-4xl px-3 py-2 opacity-80 hover:opacity-100"
            aria-label="previous image"
          >
            ‹
          </button>
          <img
            src={lightbox.list[lightbox.index].url}
            alt={lightbox.list[lightbox.index].name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 md:right-8 text-white text-4xl px-3 py-2 opacity-80 hover:opacity-100"
            aria-label="next image"
          >
            ›
          </button>
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white text-2xl opacity-80 hover:opacity-100"
            aria-label="close"
          >
            ✕
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm scrap-head">
            {lightbox.index + 1} / {lightbox.list.length}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  items,
  folder,
  onOpen,
}: {
  label: string;
  items: Treasure[];
  folder: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div>
      <h3 className="scrap-head text-2xl mb-3 opacity-90">{label}</h3>

      {items.length === 0 ? (
        <p className="text-sm opacity-60 italic border-2 border-dashed border-black/15 rounded-xl p-4">
          drop images into <code className="font-mono text-xs">src/assets/treasures/{folder}/</code> and they'll show up here ♡
        </p>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {items.map((t, i) => (
            <button
              key={t.url}
              onClick={() => onOpen(i)}
              className={`polaroid ${TILT[i % TILT.length]} mb-3 block w-full break-inside-avoid p-2 hover:scale-[1.02] transition-transform`}
              aria-label={`open ${t.name}`}
            >
              <img
                src={t.url}
                alt={t.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-sm block"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
