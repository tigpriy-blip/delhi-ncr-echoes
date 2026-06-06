import { useEffect, useState } from "react";
import { isMuted, setMuted, subscribeMute } from "@/lib/audio";

export function MuteToggle() {
  const [muted, setLocal] = useState(false);
  useEffect(() => {
    setLocal(isMuted());
    return subscribeMute(setLocal);
  }, []);
  return (
    <button
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "unmute" : "mute"}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur border-2 border-black/20 shadow-md grid place-items-center text-lg hover:scale-110 active:scale-95 transition-transform"
      title={muted ? "unmute" : "mute"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
