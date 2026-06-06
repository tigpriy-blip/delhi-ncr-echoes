import { useEffect, useState } from "react";
import { startDrone, stopDrone } from "@/lib/audio";
import { ls } from "@/lib/storage";
import { LS } from "@/lib/constants";
import { LoginSequence } from "./LoginSequence";
import { Directory } from "./Directory";
import { DocumentViewer } from "./DocumentViewer";
import { Ending } from "./Ending";
import { Puzzle1Redaction } from "./puzzles/Puzzle1Redaction";
import { Puzzle2Transmission } from "./puzzles/Puzzle2Transmission";
import { Puzzle3CaseBoard } from "./puzzles/Puzzle3CaseBoard";
import { Puzzle4Timeline } from "./puzzles/Puzzle4Timeline";
import { MasterPuzzle } from "./puzzles/MasterPuzzle";
import { LiveViewers } from "./LiveViewers";
import type { DocId } from "@/data/documents";

type View =
  | { kind: "login" }
  | { kind: "dir" }
  | { kind: "doc"; id: DocId }
  | { kind: "puzzle"; n: 1 | 2 | 3 | 4 }
  | { kind: "master" }
  | { kind: "ending" };

export type ArchiveState = {
  batchesUnlocked: number; // 1..4
  field19Unlocked: boolean;
  ongoingUnlocked: boolean;
};

export function Archive() {
  const [view, setView] = useState<View>({ kind: "login" });
  const [state, setState] = useState<ArchiveState>({
    batchesUnlocked: 1,
    field19Unlocked: false,
    ongoingUnlocked: false,
  });

  useEffect(() => {
    startDrone();
    // restore unlock state
    setState({
      batchesUnlocked: Math.max(1, ls.getNum(LS.batchesUnlocked, 1)),
      field19Unlocked: ls.getBool(LS.field19Unlocked),
      ongoingUnlocked: ls.getBool(LS.ongoingUnlocked),
    });
    return () => stopDrone();
  }, []);

  const unlockBatch = (b: 2 | 3 | 4) => {
    setState((s) => {
      const next = { ...s, batchesUnlocked: Math.max(s.batchesUnlocked, b) };
      ls.set(LS.batchesUnlocked, String(next.batchesUnlocked));
      return next;
    });
  };

  const unlockField19 = () => {
    ls.setBool(LS.field19Unlocked, true);
    setState((s) => ({ ...s, field19Unlocked: true }));
  };

  const unlockOngoing = () => {
    ls.setBool(LS.ongoingUnlocked, true);
    setState((s) => ({ ...s, ongoingUnlocked: true }));
  };

  // Observer joins permanently when player engages with batch 4 material
  const observerPresent =
    state.batchesUnlocked >= 4 &&
    ((view.kind === "doc" && ["DOC-13", "DOC-14", "ARCH-10"].includes(view.id)) ||
      (view.kind === "puzzle" && view.n === 4) ||
      view.kind === "master" ||
      view.kind === "ending");

  return (
    <div data-act="2" className="min-h-screen px-4 py-6 md:px-10 md:py-10">
      {view.kind !== "login" && <LiveViewers observerPresent={observerPresent} />}
      {view.kind === "login" && <LoginSequence onContinue={() => setView({ kind: "dir" })} />}

      {view.kind === "dir" && (
        <Directory
          state={state}
          onOpenDoc={(id) => setView({ kind: "doc", id })}
          onOpenPuzzle={(n) => setView({ kind: "puzzle", n })}
          onOpenMaster={() => setView({ kind: "master" })}
          onOpenOngoing={() => setView({ kind: "ending" })}
        />
      )}

      {view.kind === "doc" && (
        <DocumentViewer id={view.id} onBack={() => setView({ kind: "dir" })} />
      )}

      {view.kind === "puzzle" && view.n === 1 && (
        <Puzzle1Redaction
          onComplete={() => {
            unlockBatch(2);
            setView({ kind: "dir" });
          }}
          onBack={() => setView({ kind: "dir" })}
        />
      )}
      {view.kind === "puzzle" && view.n === 2 && (
        <Puzzle2Transmission
          onComplete={() => {
            unlockBatch(3);
            setView({ kind: "dir" });
          }}
          onBack={() => setView({ kind: "dir" })}
        />
      )}
      {view.kind === "puzzle" && view.n === 3 && (
        <Puzzle3CaseBoard
          onComplete={() => {
            unlockBatch(4);
            setView({ kind: "dir" });
          }}
          onBack={() => setView({ kind: "dir" })}
        />
      )}
      {view.kind === "puzzle" && view.n === 4 && (
        <Puzzle4Timeline
          onComplete={() => {
            unlockField19();
            setView({ kind: "dir" });
          }}
          onBack={() => setView({ kind: "dir" })}
        />
      )}

      {view.kind === "master" && (
        <MasterPuzzle
          onComplete={() => {
            unlockOngoing();
            setView({ kind: "dir" });
          }}
          onBack={() => setView({ kind: "dir" })}
        />
      )}

      {view.kind === "ending" && <Ending />}
    </div>
  );
}
