"use client";

import { useState, useMemo } from "react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { SearchBar } from "@/components/SearchBar";
import { products } from "@/data/products";
import type { Product } from "@/data/types";

const categories: (Product["category"] | "All")[] = [
  "All",
  "Executors",
  "Scripts",
  "Tools",
  "Misc",
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Product["category"] | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

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
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:py-16">
        <Hero />
        <SearchBar
          activeCategory={activeCategory}
          categories={categories}
          searchQuery={searchQuery}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchQuery}
        />
        <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
      </main>
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
