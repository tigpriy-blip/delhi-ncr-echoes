import { TYPE_SPEED_MS } from "./constants";

export type TypeSignal = { cancelled: boolean; skip?: boolean };

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Character-by-character typewriter. Resolves when done. */
export async function typeText(
  full: string,
  onChunk: (partial: string) => void,
  speed = TYPE_SPEED_MS,
  signal?: TypeSignal
) {
  let acc = "";
  for (const ch of full) {
    if (signal?.cancelled) return;
    if (signal?.skip) {
      onChunk(full);
      return;
    }
    acc += ch;
    onChunk(acc);
    await sleep(ch === "\n" ? speed * 4 : speed);
  }
}
