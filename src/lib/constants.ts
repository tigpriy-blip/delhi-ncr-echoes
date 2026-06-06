// All "magic numbers" live here so a new AI session can tweak without spelunking.

export const FRIEND_NAME = "[FRIEND NAME]";
export const FRIEND_AGE = 19;

// Fragment values — DO NOT CHANGE without updating MasterPuzzle.tsx too.
export const FRAGMENTS = ["1101", "MNEME", "ROH-000", "2347"] as const;

// Typing / pacing
export const TYPE_SPEED_MS = 20;
export const TRANSITION_DRAIN_MS = 2000;
export const TRANSITION_FLASH_MS = 150;
export const LOADER_STALL_AT = 97;
export const LOADER_STALL_MS = 8000;
export const LOADER_CRAWL_MS = 3000;
export const FOUND_YOU_HOLD_MS = 3000;

// Audio
export const DRONE_FREQ = 60;
export const DRONE_GAIN = 0.03;

// localStorage keys
export const LS = {
  hasSeenEnding: "f13_hasSeenEnding",
  tourComplete: "f13_tourComplete",
  fragment: (n: 1 | 2 | 3 | 4) => `f13_fragment${n}`,
  puzzleComplete: (n: 1 | 2 | 3 | 4) => `f13_puzzle${n}Complete`,
  puzzleState: (id: string) => `f13_puzzleState_${id}`,
  puzzleHints: (id: string) => `f13_puzzleHints_${id}`,
  batchesUnlocked: "f13_batchesUnlocked", // 1..4
  field19Unlocked: "f13_field19Unlocked",
  ongoingUnlocked: "f13_ongoingUnlocked",
  muted: "f13_muted",
  splashShown: "f13_splashShownSession", // sessionStorage flag
} as const;
