"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { SearchBar } from "@/components/SearchBar";
import type { Product } from "@/data/types";

interface HomePageClientProps {
  products: Product[];
}

export function HomePageClient({ products }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesSearch;
    });
  }, [products, searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [filteredProducts]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#03060A] text-white">
      <div className="flex min-h-screen flex-col">
        <Hero />

        <main className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-6 pb-12">
          <div className="w-full max-w-6xl">
            <div className="rounded-2xl border border-[#1F2933] bg-gradient-to-br from-[#0A0F14] to-[#050709] p-8 shadow-2xl shadow-[#14A5FF]/10">
              <div className="mb-5 flex items-center justify-center">
                <div className="rounded-full border border-[#1F2933] bg-[#0A0F14] p-3 shadow-[0_0_28px_rgba(31,176,255,0.35)]">
                  <Image
                    src="/key-kingdom-pfp.png"
                    alt="Key-Kingdom logo"
                    width={144}
                    height={144}
                    className="h-24 w-24 md:h-28 md:w-28"
                    priority
                  />
                </div>
              </div>
              <div className="mb-6">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>

              <div className="rounded-2xl border border-[#1F2933] bg-[#0A0F14] p-6 shadow-[0_0_18px_rgba(31,176,255,0.14)]">
                {sortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div className="text-6xl">🔍</div>
                    <h3 className="text-xl font-semibold text-white">No products found</h3>
                    <p className="text-sm text-[#9CA3AF]">Try adjusting your search or category</p>
                  </div>
                ) : (
                  <ProductGrid products={sortedProducts} onProductClick={handleProductClick} />
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-[#1F2933] bg-[#03060A]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-8">
            <p className="text-center text-sm font-semibold text-[#1FB0FF]/60 drop-shadow-[0_0_16px_rgba(31,176,255,0.55)]">
              Unlock your software. Choose your vendor.
            </p>
          </div>
        </footer>

        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
