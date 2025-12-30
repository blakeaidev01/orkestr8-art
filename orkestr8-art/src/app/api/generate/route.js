import { generateImage } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Prefer a server-only key if you have it; fall back to anon.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    if (!prompt)
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const url = await generateImage(prompt);

    // Save to gallery (best-effort; don't fail generation if DB write fails)
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("images")
        .insert({ url, prompt, likes: 0, approved: true });

      if (error) {
        // Still return the URL so the user gets their result.
        console.error("Supabase insert failed:", error);
      }
    } else {
      console.warn(
        "Supabase env not configured. Skipping gallery insert. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)."
      );
    }

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/generate error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
