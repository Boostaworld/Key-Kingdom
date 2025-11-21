"use client";

import Image from "next/image";
import type { Product } from "@/data/types";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-3xl border border-[#1A1F25] bg-[#0A0F14] p-8 shadow-[0_0_60px_rgba(31,176,255,0.35)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#0F141A] px-3 py-1 text-sm font-semibold text-zinc-200 ring-1 ring-[#1A1F25] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A]"
        >
          Close
        </button>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 space-y-3">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[#0F141A] ring-1 ring-[#1A1F25]">
              <Image
                src={product.heroImageUrl ?? product.iconUrl}
                alt={`${product.name} artwork`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#1FB0FF]">{product.category}</p>
              <h2 className="text-3xl font-semibold text-white">{product.name}</h2>
              <p className="mt-2 text-zinc-300">{product.description}</p>
            </div>
            <ul className="grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 rounded-xl bg-[#0F141A] p-3 ring-1 ring-[#1A1F25]"
                >
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-[#1FB0FF] shadow-[0_0_12px_rgba(31,176,255,0.8)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-[#0F141A] p-5 ring-1 ring-[#1A1F25]">
            <div className="flex items-baseline justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-[#1FB0FF]">Vendors</p>
              <span className="rounded-full bg-[#0A0F14] px-3 py-1 text-xs font-semibold text-white ring-1 ring-[#1A1F25]">
                {product.vendorCount} options
              </span>
            </div>
            <div className="space-y-3">
              {product.vendorLinks.map((vendor) => (
                <a
                  key={vendor.id}
                  href={vendor.redirectUrl ?? vendor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#0A0F14] p-4 ring-1 ring-[#1A1F25] transition hover:border-[#1FB0FF]/60 hover:ring-[#1FB0FF]/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#0F141A] ring-1 ring-[#1A1F25]">
                      {vendor.avatarUrl ? (
                        <Image
                          src={vendor.avatarUrl}
                          alt={`${vendor.vendorName} avatar`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                          {vendor.vendorName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{vendor.vendorName}</p>
                      <p className="text-xs text-zinc-400">{vendor.notes ?? "Secure checkout"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-sm font-semibold text-[#1FB0FF]">
                        {vendor.currency} {vendor.price.toFixed(2)}
                      </p>
                      <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                        {vendor.paymentMethods.join(" • ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#12A0F9]/10 px-3 py-1 text-xs font-semibold text-[#1FB0FF] ring-1 ring-[#1FB0FF]/40">
                      {vendor.ctaLabel ?? "Buy now"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
