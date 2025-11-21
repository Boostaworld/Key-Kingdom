"use client";

import { useMemo, useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { SearchBar } from "@/components/SearchBar";
import { products } from "@/data/products";
import type { Product } from "@/data/types";

type SortOption = "featured" | "price" | "vendors";
type CategoryFilter = "All" | Product["category"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [filters, setFilters] = useState({
    updatedOnly: false,
    multiVendor: false,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const categories: CategoryFilter[] = ["All", "Executors", "Bundles", "Vendors"];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(query));
      const matchesUpdated = filters.updatedOnly ? product.isUpdated : true;
      const matchesVendorCount = filters.multiVendor ? product.vendorCount > 1 : true;

      return matchesCategory && matchesSearch && matchesUpdated && matchesVendorCount;
    });
  }, [activeCategory, filters.multiVendor, filters.updatedOnly, searchQuery]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortOption) {
      case "price":
        sorted.sort((a, b) => a.lowestPrice - b.lowestPrice || a.name.localeCompare(b.name));
        break;
      case "vendors":
        sorted.sort(
          (a, b) => b.vendorCount - a.vendorCount || a.name.localeCompare(b.name),
        );
        break;
      default:
        sorted.sort((a, b) => {
          const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        break;
    }

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
      <Hero />

      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
              <label className="text-sm text-[#9CA3AF]" htmlFor="sort-select">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="rounded-[10px] border border-[#1F2933] bg-[#0A0F14] px-3 py-2 text-sm text-[#D0D5DD] shadow-[0_0_12px_rgba(20,165,255,0.15)] focus:border-[#14A5FF] focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price">Price (Low)</option>
                <option value="vendors">Vendor count</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-3 py-2 text-sm transition duration-200 ${
                      isActive
                        ? "bg-[#14A5FF] text-[#03060A] shadow-[0_0_18px_rgba(20,165,255,0.45)]"
                        : "border border-[#1F2933] bg-[#0A0F14] text-[#D0D5DD] hover:border-[#14A5FF]/80 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, updatedOnly: !prev.updatedOnly }))}
                className={`rounded-full px-3 py-2 text-sm transition duration-200 ${
                  filters.updatedOnly
                    ? "bg-[#111827] text-[#14A5FF] shadow-[0_0_14px_rgba(20,165,255,0.3)]"
                    : "border border-[#1F2933] bg-[#0A0F14] text-[#D0D5DD] hover:border-[#14A5FF]/80 hover:text-white"
                }`}
              >
                Updated only
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, multiVendor: !prev.multiVendor }))}
                className={`rounded-full px-3 py-2 text-sm transition duration-200 ${
                  filters.multiVendor
                    ? "bg-[#111827] text-[#14A5FF] shadow-[0_0_14px_rgba(20,165,255,0.3)]"
                    : "border border-[#1F2933] bg-[#0A0F14] text-[#D0D5DD] hover:border-[#14A5FF]/80 hover:text-white"
                }`}
              >
                2+ vendors
              </button>
            </div>
          </div>
        </div>

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
