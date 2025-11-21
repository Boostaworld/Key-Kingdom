"use client";

import { useMemo, useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { SearchBar } from "@/components/SearchBar";
import { products } from "@/data/products";
import type { Product } from "@/data/types";



export default function Home() {
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
  }, [searchQuery]);

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
      <Hero />

      <main className="mx-auto flex w-full flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-6xl">
          {/* Search Container */}
          <div className="mb-8 rounded-2xl border border-[#1F2933] bg-gradient-to-br from-[#0A0F14] to-[#050709] p-8 shadow-2xl shadow-[#14A5FF]/10">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">
              Find Your Keys
            </h2>

            {/* Search Bar */}
            <div className="mb-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            <p className="text-center text-sm text-[#9CA3AF]">
              {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"} available
            </p>
          </div>

          {/* Products Section */}
          <div className="rounded-2xl border border-[#1F2933] bg-gradient-to-br from-[#0A0F14] to-[#050709] p-8 shadow-2xl shadow-[#14A5FF]/10">
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
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
