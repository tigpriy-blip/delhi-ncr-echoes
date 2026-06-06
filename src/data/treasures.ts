// Drop image files into:
//   src/assets/treasures/section-a/
//   src/assets/treasures/section-b/
// They will appear automatically (sorted by filename). Supported: jpg, jpeg, png, webp, avif, gif.

const a = import.meta.glob(
  "/src/assets/treasures/section-a/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const b = import.meta.glob(
  "/src/assets/treasures/section-b/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const toList = (m: Record<string, string>) =>
  Object.entries(m)
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([path, url]) => ({
      url,
      name: path.split("/").pop() ?? "",
    }));

export const treasures = {
  sectionA: toList(a),
  sectionB: toList(b),
};

export type Treasure = { url: string; name: string };
