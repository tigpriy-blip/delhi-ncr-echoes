import { Link } from "@tanstack/react-router";
import { treasures } from "@/data/treasures";

const TILT = ["tilt-1", "tilt-2", "tilt-3"];
const TEASER_PER_SECTION = 3;

export function TreasuresBox() {
  const total = treasures.sectionA.length + treasures.sectionB.length;
  const teaser = [
    ...treasures.sectionA.slice(0, TEASER_PER_SECTION),
    ...treasures.sectionB.slice(0, TEASER_PER_SECTION),
  ];

  return (
    <div className="bg-white/70 rounded-2xl p-5 shadow-md h-full flex flex-col">
      <h2 className="scrap-head text-3xl mb-1">
        <span className="party-banner">my treasures</span> 💝
      </h2>
      <p className="text-sm opacity-70 mb-4 scrap-head">
        {total > 0
          ? `${total} treasure${total === 1 ? "" : "s"} inside ♡`
          : "drop images into src/assets/treasures/ to fill this up ♡"}
      </p>

      {teaser.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {teaser.map((t, i) => (
            <Link
              key={t.url}
              to="/treasures"
              className={`polaroid ${TILT[i % TILT.length]} block p-1.5 hover:scale-[1.03] transition-transform`}
              aria-label="open my treasures"
            >
              <img
                src={t.url}
                alt={t.name}
                loading="lazy"
                decoding="async"
                className="w-full aspect-square object-cover rounded-sm block"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-black/15 rounded-xl p-4 mb-4 text-sm opacity-60 italic">
          your photos, notes, and tiny things will live here.
        </div>
      )}

      <Link
        to="/treasures"
        className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[var(--washi)] text-white scrap-head text-lg shadow-md hover:scale-[1.03] active:scale-95 transition"
      >
        see all my treasures →
      </Link>
    </div>
  );
}
