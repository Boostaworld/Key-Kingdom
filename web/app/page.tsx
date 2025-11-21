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

      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 pb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-white">Browse Products</h2>
          <p className="text-sm text-[#9CA3AF]">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
          </p>
        </div>

        <div className="w-full max-w-md">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-white">No products found</h3>
            <p className="text-sm text-[#9CA3AF]">Try adjusting your search terms</p>
          </div>
        ) : (
          <ProductGrid products={sortedProducts} onProductClick={handleProductClick} />
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
