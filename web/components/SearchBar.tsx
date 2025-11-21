"use client";

import type { Product } from "@/data/types";

interface SearchBarProps {
  activeCategory: Product["category"] | "All";
  categories: (Product["category"] | "All")[];
  searchQuery: string;
  onCategoryChange: (category: Product["category"] | "All") => void;
  onSearchChange: (query: string) => void;
}

export function SearchBar({
  activeCategory,
  categories,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: SearchBarProps) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-[#1A1F25] bg-[#0A0F14] p-6 shadow-[0_0_40px_rgba(31,176,255,0.18)]">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A] ${
                isActive
                  ? "bg-[#1FB0FF] text-black shadow-[0_0_24px_rgba(31,176,255,0.55)]"
                  : "bg-[#0F141A] text-zinc-200 ring-1 ring-[#1A1F25] hover:ring-[#1FB0FF]/60"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      <label className="relative block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">Search</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Find a product by name or tag"
          className="w-full rounded-xl bg-[#0F141A] py-4 pl-20 pr-4 text-base text-white outline-none ring-1 ring-[#1A1F25] transition focus:ring-2 focus:ring-[#1FB0FF]"
          type="search"
        />
      </label>
    </section>
  );
}
