"use client";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-[#0A0F14]/60 px-8 py-14 text-center shadow-[0_0_60px_rgba(31,176,255,0.25)] backdrop-blur-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1FB0FF]">
        Key-Kingdom
      </p>
      <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
        Curated Roblox tools with neon-grade clarity
      </h1>
      <p className="text-lg text-zinc-300">
        Explore executors, scripts, and utilities vetted for performance, reliability, and lightning-fast setup.
      </p>
    </section>
  );
}
