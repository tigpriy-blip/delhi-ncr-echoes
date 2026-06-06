## Plan: add Meme.rar images to treasures section one

1. Extract `Meme.rar` to a temp dir (`nix run nixpkgs#unrar -- x`).
2. For each image inside, create a CDN pointer via `lovable-assets create` writing `src/assets/treasures/section-a/<name>.asset.json` (keeps repo light, same pattern we'll use for the 175+ batch).
3. Update `src/data/treasures.ts` to also glob `*.asset.json` in both section folders and read `.url` from them, merging with any raw image files already present. Sort by filename.
4. Verify gallery + Act 1 teaser still render (no component changes needed — they just consume `treasures.sectionA`).

No changes to UI components, audio, or Act 2.