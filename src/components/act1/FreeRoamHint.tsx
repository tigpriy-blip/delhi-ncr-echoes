import { useEffect, useState } from "react";

export function FreeRoamHint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4500);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => setShow(false)}
        className="flex items-end gap-2 max-w-xs animate-[fade-in_0.3s_ease-out]"
      >
        <div className="text-5xl select-none" aria-hidden>🐹</div>
        <div className="bg-white border-2 border-black rounded-2xl px-3 py-2 scrap-head text-lg shadow-md">
          you're free — go explore ♡
        </div>
      </button>
    </div>
  );
}
