import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ls, ss } from "@/lib/storage";
import { LS } from "@/lib/constants";
import { BirthdaySite } from "@/components/act1/BirthdaySite";
import { Transition } from "@/components/act1/Transition";
import { Archive } from "@/components/act2/Archive";
import { MuteToggle } from "@/components/MuteToggle";

type Stage = "act1" | "transition" | "archive";

const STAGE_KEY = "f13_stage"; // sessionStorage — survives refresh within session

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "happy birthday!" },
      { name: "description", content: "a little birthday site, just for you." },
    ],
  }),
  component: Index,
});

function Index() {
  const [stage, setStage] = useState<Stage>("act1");
  const [sealed, setSealed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const seen = ls.getBool(LS.hasSeenEnding);
    setSealed(seen);
    const saved = ss.get(STAGE_KEY) as Stage | null;
    if (seen) {
      // ending played — always return to act1 sealed
      ss.set(STAGE_KEY, "act1");
    } else if (saved === "archive" || saved === "transition") {
      setStage(saved);
    }
    setHydrated(true);
  }, []);

  const goto = (s: Stage) => {
    ss.set(STAGE_KEY, s);
    setStage(s);
  };

  if (!hydrated) {
    return <BirthdaySite sealed={false} onSticker11={() => {}} />;
  }

  return (
    <>
      {stage === "act1" && (
        <BirthdaySite
          sealed={sealed}
          onSticker11={() => {
            if (sealed) return;
            goto("transition");
          }}
        />
      )}
      {stage === "transition" && (
        <Transition onComplete={() => goto("archive")} />
      )}
      {stage === "archive" && <Archive />}
      <MuteToggle />
    </>
  );
}
