"use client";

import { useMemo, useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { SearchBar, type SortOption } from "@/components/SearchBar";
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
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    sorted.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.lowestPrice - b.lowestPrice;
        case "price-desc":
          return b.lowestPrice - a.lowestPrice;
        case "updated": {
          const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          return dateB - dateA;
        }
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "featured":
        default: {
          const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        }
      }
    });

    return sorted;
  }, [filteredProducts, sortOption]);

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
          sortOption={sortOption}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOption}
        />
        <ProductGrid products={sortedProducts} onProductClick={handleProductClick} />
      </main>
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
