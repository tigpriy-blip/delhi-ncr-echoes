import { useEffect, useState } from "react";
import { ls, ss } from "@/lib/storage";
import { FRIEND_AGE, FRIEND_NAME, LS } from "@/lib/constants";
import { Header } from "./Header";
import { MemorySearch } from "./MemorySearch";
import { TreasuresBox } from "./TreasuresBox";
import { MysteryBox } from "./MysteryBox";
import { TourGuide, type TourStop } from "./TourGuide";
import { WelcomeSplash } from "./WelcomeSplash";
import { FreeRoamHint } from "./FreeRoamHint";

type Props = {
  sealed: boolean;
  onSticker11: () => void;
};

export function BirthdaySite({ sealed, onSticker11 }: Props) {
  const [tourStop, setTourStop] = useState<TourStop | null>(null);
  const [tourDone, setTourDone] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [showFreeRoam, setShowFreeRoam] = useState(false);

  useEffect(() => {
    const done = ls.getBool(LS.tourComplete) || sealed;
    setTourDone(done);
    const splashAlreadyShown = ss.get(LS.splashShown) === "1";
    if (!done && !splashAlreadyShown) {
      setShowSplash(true);
    } else if (!done) {
      setTourStop("snapshots");
    }
  }, [sealed]);

  const startTour = () => {
    setShowSplash(false);
    setTourStop("snapshots");
  };

  const advance = (next: TourStop | null) => {
    if (next === null) {
      ls.setBool(LS.tourComplete, true);
      setTourDone(true);
      setTourStop(null);
      setShowFreeRoam(true);
    } else {
      setTourStop(next);
    }
  };

  const ring = (id: TourStop) =>
    tourStop === id ? "tour-active" : "";

  return (
    <div data-act="1" className="min-h-screen">
      <div className="garland" aria-hidden />

      <Header name={FRIEND_NAME} age={FRIEND_AGE} />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <div className="bento-grid">
          <section className={`bento-hero ${ring("mystery")}`}>
            <MysteryBox
              sealed={sealed}
              onOpen={() => {
                if (tourStop === "mystery") advance(null);
              }}
              onSticker11={onSticker11}
            />
          </section>

          <section className="bento-top">
            <TreasuresBox />
          </section>

          <section className={`bento-bottom ${ring("snapshots")}`}>
            <MemorySearch
              onFirstSearch={() => {
                if (tourStop === "snapshots") advance("mystery");
              }}
            />
          </section>
        </div>

        <footer className="mt-16 text-center text-base opacity-80 scrap-head">
          🎂🎈🎉 happy birthday 🎉🎈🎂 <br />
          made with ♡ &nbsp; 🐹
        </footer>
      </main>

      {!tourDone && tourStop && <TourGuide stop={tourStop} />}
      {showSplash && <WelcomeSplash name={FRIEND_NAME} onDone={startTour} />}
      {showFreeRoam && <FreeRoamHint />}
    </div>
  );
}
