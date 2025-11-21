"use client";

import { Product } from "../data/types";

const categories: (Product["category"] | "All")[] = [
  "All",
  "Executors",
  "Scripts",
  "Tools",
  "Misc",
];

type HeroProps = {
  activeCategory: Product["category"] | "All";
  onCategoryChange: (category: Product["category"] | "All") => void;
};

export function Hero({ activeCategory, onCategoryChange }: HeroProps) {
  return (
    <section className="flex w-full flex-col items-center bg-[#03060A] px-6 py-20 text-center">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-[#0A0F14] px-4 py-3 shadow-[0_0_25px_rgba(20,165,255,0.35)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#14A5FF] via-[#32C8FF] to-[#66E1FF] text-xl font-semibold text-[#03060A] shadow-[0_0_25px_rgba(20,165,255,0.55)]">
            KK
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">Key-Kingdom</span>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-lg font-light text-[#D0D5DD]">
        Unlock Your Software. Choose Your Vendor.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14A5FF] focus-visible:ring-offset-0 ${
                isActive
                  ? "bg-[#14A5FF] text-[#03060A] shadow-[0_0_15px_rgba(20,165,255,0.6)]"
                  : "border border-[#1F2933] bg-[#111827] text-[#9CA3AF] hover:border-[#14A5FF] hover:text-white"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}
