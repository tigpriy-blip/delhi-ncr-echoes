import { useEffect, useRef, useState } from "react";
import { documents, type DocId } from "@/data/documents";
import { typeText, type TypeSignal } from "@/lib/typeText";

export function DocumentViewer({ id, onBack }: { id: DocId; onBack: () => void }) {
  const doc = documents[id];
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const signalRef = useRef<TypeSignal>({ cancelled: false, skip: false });

  useEffect(() => {
    const sig: TypeSignal = { cancelled: false, skip: false };
    signalRef.current = sig;
    setText("");
    setTyping(true);
    (async () => {
      await typeText(doc.content, setText, 6, sig);
      if (!sig.cancelled) setTyping(false);
    })();
    return () => {
      sig.cancelled = true;
    };
  }, [doc.content]);

  const skip = () => {
    signalRef.current.skip = true;
    setText(doc.content);
    setTyping(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
      else if ((e.key === " " || e.key === "Enter") && typing) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack, typing]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="crt-glow">
          {doc.id} — {doc.title}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          {typing && (
            <button
              onClick={skip}
              className="text-xs underline opacity-80 hover:opacity-100"
              title="Space / Enter"
            >
              [SKIP ▸]
            </button>
          )}
          <button onClick={onBack} className="text-xs underline opacity-80 hover:opacity-100">
            [BACK]
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed terminal-cursor">
        {text}
      </pre>
      <div className="mt-6 pt-4 border-t border-[color:var(--crt-green)]/20 flex justify-end">
        <button
          onClick={onBack}
          className="text-xs border border-[color:var(--crt-green)]/60 px-3 py-1 hover:bg-[color:var(--crt-green)]/10 crt-glow"
        >
          [ BACK TO ARCHIVE ]
        </button>
      </div>
    </div>
  );
}
