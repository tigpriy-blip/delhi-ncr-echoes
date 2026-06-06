// Drop image files into:
//   src/assets/treasures/section-a/
//   src/assets/treasures/section-b/
// Raw images (jpg/png/webp/...) are picked up automatically. For large
// batches, run the migrate-to-assets flow — each image becomes a
// `<name>.asset.json` pointer served from the Lovable CDN, and we read
// the `.url` field below. Both forms render side by side, sorted by filename.

const rawA = import.meta.glob(
  "/src/assets/treasures/section-a/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const rawB = import.meta.glob(
  "/src/assets/treasures/section-b/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const assetA = import.meta.glob(
  "/src/assets/treasures/section-a/*.asset.json",
  { eager: true, import: "default" },
) as Record<string, { url: string; original_filename?: string }>;

const assetB = import.meta.glob(
  "/src/assets/treasures/section-b/*.asset.json",
  { eager: true, import: "default" },
) as Record<string, { url: string; original_filename?: string }>;

export type Treasure = { url: string; name: string };

function combine(
  raw: Record<string, string>,
  assets: Record<string, { url: string; original_filename?: string }>,
): Treasure[] {
  const list: { key: string; t: Treasure }[] = [];
  for (const [path, url] of Object.entries(raw)) {
    const name = path.split("/").pop() ?? "";
    list.push({ key: name, t: { url, name } });
  }
  for (const [path, json] of Object.entries(assets)) {
    const file = path.split("/").pop() ?? "";
    const key = file.replace(/\.asset\.json$/, "");
    list.push({ key, t: { url: json.url, name: json.original_filename ?? key } });
  }
  return list
    .sort((x, y) => x.key.localeCompare(y.key))
    .map((e) => e.t);
}

export const treasures = {
  sectionA: combine(rawA, assetA),
  sectionB: combine(rawB, assetB),
};
