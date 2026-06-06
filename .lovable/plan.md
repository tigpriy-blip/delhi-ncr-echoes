## 1. Scary audio in Act 2

Today Act 2 only plays the synthesized low drone (`startDrone` in `src/lib/audio.ts`). I'll layer in extra dread without adding any asset files — all synthesized via WebAudio so it respects the existing mute toggle and stays zero-bytes.

Add to `src/lib/audio.ts`:
- **Heartbeat** — slow ~50 BPM low thump (sine ~55 Hz + filtered noise), starts when `Archive` mounts, BPM ramps up subtly as `batchesUnlocked` increases.
- **Random whispers/scrapes** — every 8–25s schedule a short filtered-noise gust or detuned high-pitch shimmer at low volume. Adds "something's wrong" texture.
- **Stinger SFX** — sharp dissonant cluster (two detuned oscillators, fast decay) for: puzzle solved (`stamp` replacement variant), document open, observer-joined moment in `LiveViewers`.
- **Reverse-cymbal swell** before `MasterPuzzle` and `Ending` — rising filtered noise over ~2s.

Wiring:
- `Archive.tsx`: replace `startDrone()` with new `startAct2Ambience({ intensity })` that bundles drone + heartbeat + whisper scheduler; pass intensity from `state.batchesUnlocked`. Call `stopAct2Ambience()` on unmount.
- Add a stinger call in the puzzle `onComplete` handlers and in `DocumentViewer` mount.
- All new sounds gated by existing `muted` flag — the 🔊/🔇 toggle keeps working.

No new dependencies, no audio files, no UI changes.

## 2. Treasures section — scale to 175+ images

Problem: rendering 175+ `<img>` tags inline on the Act 1 page will tank first paint and overwhelm the bento layout, even with `loading="lazy"`.

Solution: **move the full gallery to its own route** and keep only a small teaser on Act 1.

### New route: `src/routes/treasures.tsx`

- Full-page gallery with the two sub-sections.
- Reuses the masonry + lightbox from current `TreasuresBox`, extracted into a shared `<TreasuresGallery />` component in `src/components/treasures/TreasuresGallery.tsx`.
- Performance for 175+ images:
  - Native `loading="lazy"` + `decoding="async"` + explicit `width/height` (read from image natural size via a tiny wrapper, or fixed aspect-ratio container) to prevent CLS.
  - **`content-visibility: auto`** on each tile (CSS one-liner) so off-screen tiles skip layout/paint entirely — biggest win for long galleries.
  - Lightbox preloads only the next/prev image, not all of them.
  - Sticky sub-section tab bar (`section one` / `section two`) so the user can jump without scrolling through hundreds of tiles.
- Back button (`<Link to="/">`) returns to Act 1; Act 1 stage state is preserved (it lives in sessionStorage already).

### Act 1 teaser: rewrite `TreasuresBox.tsx`

- Show only the **first 6 thumbnails** (3 per section) as a preview collage.
- Big "see all my treasures →" `<Link to="/treasures">` button.
- Shows total count: e.g. `"178 treasures inside ♡"`.
- No lightbox here — clicking a thumb also navigates to `/treasures`.

### Asset pipeline note (mentioned to user, not built now)

175 images in `src/assets/` will balloon the repo and slow `bun run build`. After the user drops them in, recommend the `migrate-to-assets` flow to push them to the Lovable CDN — the `import.meta.glob` will keep working through the same path because the `.asset.json` pointer files live in the same folder.

## Files touched

- `src/lib/audio.ts` — add ambience/stinger functions (additive, no breaking changes).
- `src/components/act2/Archive.tsx` — swap drone calls for ambience, pass intensity.
- `src/components/act2/DocumentViewer.tsx`, `LiveViewers.tsx`, `puzzles/*` — small stinger hooks.
- `src/components/treasures/TreasuresGallery.tsx` — new, extracted from current TreasuresBox.
- `src/components/act1/TreasuresBox.tsx` — rewritten as a teaser.
- `src/routes/treasures.tsx` — new full gallery route.
- `src/styles.css` — add `.treasure-tile { content-visibility: auto; contain-intrinsic-size: ... }`.

## Out of scope

- Pagination/infinite scroll (not needed with `content-visibility: auto` for 175 images).
- Image format conversion / CDN migration (separate flow, user-triggered).
- Changing existing Act 1 → Act 2 transition or puzzle logic.
