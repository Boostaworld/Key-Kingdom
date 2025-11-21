"use client";
import Image from "next/image";
import type { Product } from "@/data/types";

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1A1F25] bg-[#0A0F14] p-10 text-center text-zinc-300">
        No products match your filters yet. Try a different category or search.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] justify-items-stretch gap-6">
      {products.map((product) => (
        <article
          key={product.id}
          role="button"
          tabIndex={0}
          onClick={() => onProductClick(product)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onProductClick(product);
            }
          }}
          className="group relative flex h-full flex-col gap-4 rounded-2xl border border-[#1F2933] bg-[#0A0F14] p-5 shadow-[0_0_16px_rgba(20,165,255,0.14)] transition duration-200 hover:-translate-y-1 hover:border-[#1FB0FF] hover:shadow-[0_0_32px_rgba(31,176,255,0.32)] focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A]"
        >
          {/* Status Indicator Dot */}
          <div
            className={`absolute right-3 top-3 h-3 w-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.6)] ${
              product.isUpdated
                ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            }`}
            aria-label={product.isUpdated ? "Recently updated" : "Update pending"}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#0F141A] ring-1 ring-[#1A1F25]">
                <Image
                  src={product.iconUrl}
                  alt={`${product.name} icon`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-[0.24em] text-[#1FB0FF]">{product.category}</p>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              </div>
            </div>
            <div
              className="flex items-center gap-1 rounded-full bg-[#0F141A] px-3 py-1 text-xs font-semibold text-white ring-1 ring-[#1A1F25] shadow-[0_0_18px_rgba(31,176,255,0.24)]"
              aria-label={`${product.vendorCount} vendors available`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1FB0FF]" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 12c1.93 0 3.5-1.57 3.5-3.5S13.93 5 12 5 8.5 6.57 8.5 8.5 10.07 12 12 12Zm0 2c-2.33 0-7 1.17-7 3.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5C19 15.17 14.33 14 12 14Z"
                  opacity="0.4"
                />
                <path
                  fill="currentColor"
                  d="M17 11.7a3 3 0 1 0-2.4-5.5 4 4 0 0 1 0 4.6c.36.18.75.28 1.18.28h1.22Zm-2.5 1.33a5.89 5.89 0 0 1 1.5.97c1.2.46 2 .98 2.33 1.74H21a1 1 0 0 0 1-1c0-1.62-2.34-2.93-5.5-3.1Z"
                />
              </svg>
              <span className="text-sm font-semibold text-white">{product.vendorCount}</span>
            </div>
          </div>

          <p className="line-clamp-3 min-h-[54px] text-sm text-zinc-300">{product.tagline ?? product.description}</p>

          <div className="mt-auto flex items-center justify-between text-sm text-zinc-400">
            <span>
              From <span className="font-semibold text-[#1FB0FF]">${product.lowestPrice.toFixed(2)}</span>
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onProductClick(product);
              }}
              className="rounded-full border border-[#1FB0FF] px-3 py-1 font-semibold text-[#1FB0FF] transition duration-200 hover:bg-[#0F141A] hover:shadow-[0_0_18px_rgba(31,176,255,0.45)] focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A]"
            >
              Quick view
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
