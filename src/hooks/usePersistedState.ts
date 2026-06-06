import { useEffect, useRef, useState } from "react";
import { ls } from "@/lib/storage";

export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = ls.getJSON<T | null>(key, null);
    if (stored !== null) setValue(stored);
    hydrated.current = true;
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    ls.setJSON(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
