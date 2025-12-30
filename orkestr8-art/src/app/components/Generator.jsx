"use client";

import { useState } from "react";

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestUrl, setLatestUrl] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setLatestUrl(data.url);
      setPrompt("");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[110px]"
          placeholder="Describe what you want to create… (e.g., 'A pastel neon galaxy orchestra forming a figure-8, cinematic lighting')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 font-semibold disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate"}
          </button>

          <span className="text-sm text-white/60">
            Uses Gemini + Cloudinary. Saves approved images to Supabase.
          </span>
        </div>

        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : null}
      </form>

      {latestUrl ? (
        <div className="mt-8">
          <p className="text-white/70 mb-3">Latest result</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={latestUrl}
            alt="Generated"
            className="w-full rounded-2xl border border-white/10"
          />
        </div>
      ) : null}
    </div>
  );
}
