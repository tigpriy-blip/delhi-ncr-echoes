import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { treasures, type Treasure } from "@/data/treasures";

const TILT = ["tilt-1", "tilt-2", "tilt-3"];

type LightboxState = { list: Treasure[]; index: number } | null;

type SectionKey = "a" | "b";

export function TreasuresGallery({
  labelA = "section one",
  labelB = "section two",
}: {
  labelA?: string;
  labelB?: string;
}) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [active, setActive] = useState<SectionKey>("a");
  const aRef = useRef<HTMLDivElement | null>(null);
  const bRef = useRef<HTMLDivElement | null>(null);

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

  // Preload neighbours
  useEffect(() => {
    if (!lightbox) return;
    const { list, index } = lightbox;
    const urls = [
      list[(index + 1) % list.length]?.url,
      list[(index - 1 + list.length) % list.length]?.url,
    ];
    urls.forEach((u) => {
      if (!u) return;
      const img = new Image();
      img.src = u;
    });
  }, [lightbox]);

  const totalA = treasures.sectionA.length;
  const totalB = treasures.sectionB.length;

  const jumpTo = (k: SectionKey) => {
    setActive(k);
    const el = k === "a" ? aRef.current : bRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <div className="sticky top-0 z-30 bg-[var(--paper)]/95 backdrop-blur border-b border-black/10 py-2 mb-4 -mx-4 px-4 flex gap-2">
        <button
          onClick={() => jumpTo("a")}
          className={`px-3 py-1 rounded-full text-sm scrap-head transition ${active === "a" ? "bg-black/10" : "opacity-70 hover:opacity-100"}`}
        >
          {labelA} · {totalA}
        </button>
        <button
          onClick={() => jumpTo("b")}
          className={`px-3 py-1 rounded-full text-sm scrap-head transition ${active === "b" ? "bg-black/10" : "opacity-70 hover:opacity-100"}`}
        >
          {labelB} · {totalB}
        </button>
      </div>

      <div ref={aRef}>
        <Section
          label={labelA}
          items={treasures.sectionA}
          folder="section-a"
          onOpen={(i) => setLightbox({ list: treasures.sectionA, index: i })}
        />
      </div>

      <div className="my-8 border-t border-dashed border-black/20" />

      <div ref={bRef}>
        <Section
          label={labelB}
          items={treasures.sectionB}
          folder="section-b"
          onOpen={(i) => setLightbox({ list: treasures.sectionB, index: i })}
        />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-4 animate-[fade-in_0.15s_ease-out]"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 text-white text-4xl px-3 py-2 opacity-80 hover:opacity-100"
            aria-label="previous image"
          >‹</button>
          <img
            src={lightbox.list[lightbox.index].url}
            alt={lightbox.list[lightbox.index].name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 text-white text-4xl px-3 py-2 opacity-80 hover:opacity-100"
            aria-label="next image"
          >›</button>
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white text-2xl opacity-80 hover:opacity-100"
            aria-label="close"
          >✕</button>
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
  const tiles = useMemo(() => items, [items]);
  return (
    <div>
      <h3 className="scrap-head text-3xl mb-4">{label}</h3>
      {tiles.length === 0 ? (
        <p className="text-sm opacity-60 italic border-2 border-dashed border-black/15 rounded-xl p-4">
          drop images into <code className="font-mono text-xs">src/assets/treasures/{folder}/</code> and they'll show up here ♡
        </p>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 [column-fill:_balance]">
          {tiles.map((t, i) => (
            <button
              key={t.url}
              onClick={() => onOpen(i)}
              className={`treasure-tile polaroid ${TILT[i % TILT.length]} mb-3 block w-full break-inside-avoid p-2 hover:scale-[1.02] transition-transform`}
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