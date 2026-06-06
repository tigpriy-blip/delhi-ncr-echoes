import { createFileRoute, Link } from "@tanstack/react-router";
import { TreasuresGallery } from "@/components/treasures/TreasuresGallery";

export const Route = createFileRoute("/treasures")({
  head: () => ({
    meta: [
      { title: "my treasures ♡" },
      { name: "description", content: "every little thing worth keeping." },
    ],
  }),
  component: TreasuresPage,
});

function TreasuresPage() {
  return (
    <div data-act="1" className="min-h-screen">
      <div className="garland" aria-hidden />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="scrap-head text-4xl md:text-5xl">
            <span className="party-banner">my treasures</span> 💝
          </h1>
          <Link
            to="/"
            className="scrap-head text-base underline decoration-dotted opacity-80 hover:opacity-100"
          >
            ← back home
          </Link>
        </div>
        <TreasuresGallery />
      </main>
    </div>
  );
}