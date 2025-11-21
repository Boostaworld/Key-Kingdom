"use client";

import Image from "next/image";
import { products } from "../data/products";
import type { Product } from "../data/types";

type ProductGridProps = {
    activeCategory: Product["category"] | "All";
    searchQuery: string;
    onProductClick: (product: Product) => void;
};

const creditCardIcon = (
    <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
    >
        <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5zM5 8h14V6.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5zM5 10v8.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10zm2.5 5a1 1 0 1 0 0 2h3a1 1 0 0 0 0-2z" />
    </svg>
);

const matchesSearch = (value: string, query: string) =>
    value.toLowerCase().includes(query.toLowerCase());

export function ProductGrid({ activeCategory, searchQuery, onProductClick }: ProductGridProps) {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesQuery =
            normalizedQuery.length === 0 ||
            matchesSearch(product.name, normalizedQuery) ||
            matchesSearch(product.description, normalizedQuery);

        return matchesCategory && matchesQuery;
    });

    if (filteredProducts.length === 0) {
        return (
            <div className="w-full rounded-2xl border border-[#1F2933] bg-[#111827] p-8 text-center text-[#D0D5DD]">
                No products found
            </div>
        );
    }

    return (
        <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">
            {filteredProducts.map((product) => (
                <article
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className="group flex cursor-pointer flex-col items-center rounded-2xl border border-[#1F2933] bg-[#111827] p-5 shadow-[0_0_12px_rgba(31,176,255,0.10)] transition duration-200 hover:-translate-y-1 hover:border-[#14A5FF] hover:shadow-[0_0_25px_rgba(20,165,255,0.35)]"
                >
                    <div className="flex h-full flex-col items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#0A0F14]">
                            <Image src={product.iconUrl} alt={product.name} width={80} height={80} className="object-contain" />
                        </div>

                        <div className="text-center">
                            <h3 className="font-semibold text-white">{product.name}</h3>
                            <p className="mt-1 text-xs uppercase tracking-wide text-[#9CA3AF]">From</p>
                            <p className="text-xl font-bold text-[#14A5FF]">${product.lowestPrice.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex w-full items-center justify-end gap-2 text-[#D0D5DD]">
                        <div className="flex items-center gap-1 rounded-full border border-[#1F2933] bg-[#0A0F14] px-3 py-1 text-xs font-semibold text-[#14A5FF] shadow-[0_0_10px_rgba(20,165,255,0.20)]">
                            <span className="text-[#D0D5DD]">{creditCardIcon}</span>
                            <span>{product.vendorCount}</span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

export default ProductGrid;
