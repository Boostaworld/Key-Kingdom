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
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          className="group flex h-full flex-col gap-4 rounded-2xl border border-[#1F2933] bg-[#0A0F14] p-5 shadow-[0_0_16px_rgba(20,165,255,0.14)] transition duration-200 hover:-translate-y-1 hover:border-[#1FB0FF] hover:shadow-[0_0_32px_rgba(31,176,255,0.32)] focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A]"
        >
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
            <span className="rounded-full bg-[#0F141A] px-3 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-[#1A1F25]">
              {product.vendorCount} vendors
            </span>
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
