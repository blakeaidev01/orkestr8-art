import Generator from "./components/Generator";
import { getSupabaseClient } from "@/lib/supabase";

async function getFeaturedImages() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("images")
    .select("url,prompt,likes")
    .eq("approved", true)
    .order("likes", { ascending: false })
    .limit(30);

  if (error) {
    // Don't hard-fail the page if Supabase isn't configured yet.
    return [];
  }
  return data || [];
}

export default async function Home() {
  const images = await getFeaturedImages();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="text-center py-16 px-6 bg-gradient-to-b from-black to-purple-900">
        <h1 className="text-5xl md:text-7xl font-black mb-5 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Orkestr8.art
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-white/80">
          Create. Collect. Share.
        </p>

        <Generator />
      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Featured</h2>
          <p className="text-sm text-white/60">
            Showing top liked approved images.
          </p>
        </div>

        {images?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.prompt || ""} className="w-full" />
                <div className="p-4">
                  <p className="text-sm text-white/70 line-clamp-2">{img.prompt}</p>
                  <p className="mt-2 text-xs text-white/50">❤️ {img.likes ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No featured images yet. Generate one above.
          </div>
        )}
      </section>
    </main>
  );
}
