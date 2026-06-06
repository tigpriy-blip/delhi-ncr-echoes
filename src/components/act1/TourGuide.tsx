export type TourStop = "snapshots" | "mystery";

const COPY: Record<TourStop, string> = {
  snapshots: "start here! search a snapshot. type literally anything.",
  mystery: "okay. the big one. open the box.",
};

const POSITION: Record<TourStop, string> = {
  snapshots: "right-6 top-28 md:top-44",
  mystery: "left-6 top-28 md:top-44",
};

export function TourGuide({ stop }: { stop: TourStop }) {
  return (
    <div className={`fixed ${POSITION[stop]} z-40 pointer-events-none`}>
      <div className="pointer-events-auto flex items-end gap-2 max-w-xs animate-[fade-in_0.3s_ease-out]">
        <div className="text-5xl select-none tour-hamster" aria-hidden>
          🐹
        </div>
        <div className="bg-white border-2 border-black rounded-2xl px-3 py-2 scrap-head text-lg shadow-md tour-bubble">
          {COPY[stop]}
        </div>
      </div>
    </div>
  );
}
