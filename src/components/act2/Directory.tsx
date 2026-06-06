import { batchTitles, docsForBatch, documents, type DocId } from "@/data/documents";
import { ls } from "@/lib/storage";
import { LS } from "@/lib/constants";
import type { ArchiveState } from "./Archive";

type Props = {
  state: ArchiveState;
  onOpenDoc: (id: DocId) => void;
  onOpenPuzzle: (n: 1 | 2 | 3 | 4) => void;
  onOpenMaster: () => void;
  onOpenOngoing: () => void;
};

const REDACT = "████████████████████████";

export function Directory({
  state,
  onOpenDoc,
  onOpenPuzzle,
  onOpenMaster,
  onOpenOngoing,
}: Props) {
  const allFragmentsCollected =
    !!ls.get(LS.fragment(1)) &&
    !!ls.get(LS.fragment(2)) &&
    !!ls.get(LS.fragment(3)) &&
    !!ls.get(LS.fragment(4));

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl md:text-2xl mb-2 crt-glow">STILLWATER ARCHIVE</h1>
      <div className="opacity-60 mb-6">{"=".repeat(48)}</div>

      {[1, 2, 3, 4].map((n) => {
        const batch = n as 1 | 2 | 3 | 4;
        const unlocked = state.batchesUnlocked >= batch;
        const puzzleDone = ls.getBool(LS.puzzleComplete(batch));
        const docs = docsForBatch(batch);
        return (
          <section key={batch} className="mb-6">
            <div className="opacity-90">
              {unlocked ? batchTitles[batch] : `BATCH 0${batch} — ${REDACT.slice(0, 14)}`}
              <span className="ml-3 text-xs opacity-60">
                [{unlocked ? "UNLOCKED" : `LOCKED — COMPLETE PUZZLE 0${batch - 1}`}]
              </span>
            </div>
            <div className="pl-4 mt-1">
              {unlocked ? (
                <>
                  {docs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onOpenDoc(d.id)}
                      className="block text-left hover:crt-glow hover:underline"
                    >
                      &gt; {d.id} {d.title} {d.optional ? "[SUPPLEMENTARY]" : ""}
                    </button>
                  ))}
                  {batch <= 4 && (
                    <button
                      onClick={() => onOpenPuzzle(batch)}
                      className={`block mt-1 text-left hover:underline ${
                        puzzleDone
                          ? "opacity-70"
                          : "text-[color:var(--crt-green)] crt-glow"
                      }`}
                    >
                      &gt; PUZZLE_0{batch}.exe {puzzleDone ? "[REPLAY ✓]" : "[RUN]"}
                    </button>
                  )}
                </>
              ) : (
                <div className="opacity-50">&gt; {REDACT}</div>
              )}
            </div>
          </section>
        );
      })}

      {/* FIELD-19 */}
      <section className="mb-6">
        <div className="opacity-90">
          {state.field19Unlocked ? "PERSONNEL FILES" : `${REDACT.slice(0, 14)}`}{" "}
          <span className="ml-3 text-xs opacity-60">
            [{state.field19Unlocked ? "UNLOCKED" : "LOCKED — COMPLETE PUZZLE 04"}]
          </span>
        </div>
        <div className="pl-4 mt-1">
          {state.field19Unlocked ? (
            <button
              onClick={() => onOpenDoc("DOC-14")}
              className="block text-left hover:underline"
            >
              &gt; DOC-14 {documents["DOC-14"].title}
            </button>
          ) : (
            <div className="opacity-50">&gt; {REDACT}</div>
          )}
        </div>
      </section>

      {/* MASTER + ONGOING */}
      {state.field19Unlocked && allFragmentsCollected && (
        <section className="mb-6">
          <button
            onClick={onOpenMaster}
            className={`block text-left hover:underline ${
              state.ongoingUnlocked ? "opacity-70" : "crt-glow"
            }`}
          >
            &gt; VERIFY_COMPOSITE.exe {state.ongoingUnlocked ? "[REPLAY ✓]" : "[RUN]"}
          </button>
        </section>
      )}

      {state.ongoingUnlocked && (
        <section className="mb-6">
          <button
            onClick={onOpenOngoing}
            className="block text-left crt-glow hover:underline"
          >
            &gt; ONGOING.rec [OPEN]
          </button>
        </section>
      )}

      <div className="mt-10 text-xs opacity-40">
        [ESC closes documents · drone humming · scanlines active]
      </div>
    </div>
  );
}
