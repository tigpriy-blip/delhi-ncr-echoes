# Plan — Act 1: replace Stickers with "my treasures" gallery

## Goal

Remove the StickerBox from Act 1 and replace it with a new **My Treasures** panel — a CSS masonry layout split into **two named sub-sections** the user will fill from a local folder. Target capacity: 175+ images, performant on first load.

## New component: `src/components/act1/TreasuresBox.tsx`

- Header: `my treasures 💝` (scrap-head, same visual language as the other boxes).
- Two sub-sections rendered in order with a small heading between them. Default heading text: **"section one"** and **"section two"** — easily editable strings at the top of the file. (User can rename later; we don't need exact names now.)
- Each sub-section renders its own CSS-columns masonry (`columns-2 md:columns-3 lg:columns-4`, `gap-3`, `break-inside-avoid`).
- Each tile = polaroid-styled wrapper with the image. Random tilt classes (`tilt-1/2/3`) for the scrapbook feel.
- Click a tile → lightbox overlay (full-screen, click-to-close, ESC to close, arrow keys to navigate within the current section). Lightweight — no library, ~40 lines.
- **Performance:** native `loading="lazy"` + `decoding="async"` on every `<img>`. Fixed aspect ratio wrapper to prevent layout shift. With 175+ images this is enough; no virtualization needed for a scroll page.

## Image loading strategy (folder drop-in)

Use Vite's `import.meta.glob` with `eager: true, as: 'url'` so the user just drops files in and they auto-appear, no manifest editing:

```ts
// src/data/treasures.ts
const sectionA = import.meta.glob(
  "/src/assets/treasures/section-a/*.{jpg,jpeg,png,webp,avif,gif}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;
// same for section-b
export const treasures = {
  sectionA: Object.values(sectionA).sort(),
  sectionB: Object.values(sectionB).sort(),
};
```

Two folders to create (empty, with a `.gitkeep` and a short `README.md` explaining "drop images here"):
- `src/assets/treasures/section-a/`
- `src/assets/treasures/section-b/`

Note for the user: 175+ images in `src/assets/` will bloat the repo. After the structure ships, recommend running the `migrate-to-assets` flow (or just upload via chat) to move them to the Lovable CDN. Not part of this plan — mentioned in the closing message only.

## Wiring changes

`src/components/act1/BirthdaySite.tsx`:
- Replace `<StickerBox />` in the `bento-top` section with `<TreasuresBox />`.
- Remove the `"stickers"` tour stop. New tour order: `snapshots → mystery → done`. Initial `tourStop` becomes `"snapshots"`.
- Update `onFirstSearch` to advance to `"mystery"` (already does — no change needed there; the chain just starts one step later).

`src/components/act1/TourGuide.tsx`:
- Remove the `"stickers"` case from the `TourStop` union and the copy map. Keep `snapshots` and `mystery` only.

Delete:
- `src/components/act1/StickerBox.tsx`
- `src/data/stickers.ts`

Search for any other references to `StickerBox` / `stickers` / `tourStop === "stickers"` and clean them up (the bento CSS class `bento-top` stays — it's just a layout slot).

## Out of scope

- Act 2, puzzles, audio, backend.
- Renaming Snapshots or Mystery Box (user only asked to replace stickers).
- Image optimization pipeline (handled later via assets migration).
- The "special sticker" inside the Mystery Box (`onSticker11`) is unrelated to StickerBox and stays — it's the Act 1 → Act 2 trigger.

## Verification

1. Preview loads, Act 1 shows three panels: Mystery Box, **My Treasures** (two empty sub-sections with friendly placeholder text "drop images in `src/assets/treasures/section-a/`"), Snapshots.
2. Tour skips stickers and starts at Snapshots.
3. Drop a couple of test images into each folder → they appear in masonry → click opens lightbox → arrows navigate → ESC closes.
4. No console errors. Build passes. No dangling `StickerBox` imports.
