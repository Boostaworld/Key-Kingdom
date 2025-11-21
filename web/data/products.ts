// web/data/products.ts
import type { Product } from "./types";

/**
 * Adjust `featuredOrder` to hardcode which products appear first on the front page.
 * The order is respected by default and also drives the `sortOrder` field that powers
 * the "Featured" sort option. To add or remove products, edit `productSeeds` below;
 * derived values like lowestPrice and vendorCount will be filled in automatically.
 */
type ProductSeed = Omit<Product, "lowestPrice" | "vendorCount" | "sortOrder">;

const featuredOrder: Product["slug"][] = [
    "lynx-executor",
    "assembly-executor",
    "quantum-injector",
];

const productSeeds: ProductSeed[] = [
    {
        id: "assembly-executor",
        name: "Assembly",
        slug: "assembly-executor",
        category: "Executors",
        iconUrl: "/products/assembly.png",
        heroImageUrl: "/products/assembly-hero.png",
        tagline: "Lightweight Roblox executor with fast injection.",
        description:
            "Assembly is a fast, reliable executor for Roblox scripts with instant injection, auto-attach, and custom UI themes.",
        features: [
            "Instant script injection",
            "Auto-attach on game launch",
            "Custom UI themes",
            "Regular updates",
        ],
        vendorLinks: [
            {
                id: "assembly-keyvendor",
                vendorName: "KeyVendor",
                url: "https://keyvendor.com/assembly",
                redirectUrl: "https://keyvendor.com/assembly?aff=XXXX",
                ctaLabel: "Buy via KeyVendor",
                price: 9.97,
                currency: "USD",
                paymentMethods: ["credit_card", "paypal"],
                notes: "Instant delivery via email",
                avatarUrl: "/vendors/keyvendor.png", // link-specific PFP
            },
            {
                id: "assembly-scripthub",
                vendorName: "ScriptHub",
                url: "https://scripthub.io/assembly",
                redirectUrl: "https://scripthub.io/assembly?ref=YYYY",
                price: 11.99,
                currency: "USD",
                paymentMethods: ["credit_card", "crypto"],
                notes: "24/7 support",
                avatarUrl: "/vendors/scripthub.png",
            },
        ],
        tags: ["executor", "roblox"],
        lastUpdated: "2025-11-15",
    },
    {
        id: "lynx-executor",
        name: "Lynx Executor",
        slug: "lynx-executor",
        category: "Executors",
        iconUrl: "/products/lynx.png",
        tagline: "Stable execution with script sandboxing and crash recovery.",
        description:
            "Lynx prioritizes stability with sandboxed execution, crash recovery, and a built-in script vault so you can swap between loadouts instantly.",
        features: [
            "Sandboxed script runner",
            "One-click crash recovery",
            "Script vault with tagging",
            "Profile-based settings",
        ],
        vendorLinks: [
            {
                id: "lynx-direct",
                vendorName: "Lynx Store",
                url: "https://lynx.gg/buy",
                redirectUrl: "https://lynx.gg/buy?aff=keykingdom",
                ctaLabel: "Buy direct",
                price: 14.99,
                currency: "USD",
                paymentMethods: ["credit_card", "paypal", "crypto"],
                notes: "Official checkout with auto-updates",
            },
            {
                id: "lynx-keyhub",
                vendorName: "KeyHub",
                url: "https://keyhub.to/lynx",
                price: 12.99,
                currency: "USD",
                paymentMethods: ["credit_card"],
                notes: "Starter keys delivered instantly",
            },
        ],
        tags: ["executor", "recovery", "vault"],
        lastUpdated: "2025-10-02",
    },
    {
        id: "quantum-executor",
        name: "Quantum Injector",
        slug: "quantum-injector",
        category: "Executors",
        iconUrl: "/products/quantum.png",
        heroImageUrl: "/products/quantum-hero.png",
        tagline: "Performance-focused executor with script scheduling.",
        description:
            "Quantum Injector optimizes throughput with multi-threaded execution, scheduled script runs, and detailed analytics so you can benchmark every build.",
        features: [
            "Multi-threaded execution",
            "Script scheduling and queues",
            "Runtime performance analytics",
            "Session restore on reconnect",
        ],
        vendorLinks: [
            {
                id: "quantum-studio",
                vendorName: "Quantum Studio",
                url: "https://quantum.run/store",
                redirectUrl: "https://quantum.run/store?ref=kk",
                price: 19.99,
                currency: "USD",
                paymentMethods: ["credit_card", "paypal", "crypto"],
                notes: "Includes analytics dashboard",
            },
            {
                id: "quantum-altshop",
                vendorName: "AltShop",
                url: "https://altshop.gg/quantum",
                price: 17.5,
                currency: "USD",
                paymentMethods: ["crypto", "other"],
                notes: "Crypto-friendly checkout",
                avatarUrl: "/vendors/altshop.png",
            },
        ],
        tags: ["executor", "performance", "analytics"],
        lastUpdated: "2025-09-12",
    },
];

const featuredRank = new Map(featuredOrder.map((slug, index) => [slug, index]));

export const products: Product[] = productSeeds
    .map((seed) => {
        const lowestPrice = seed.vendorLinks.reduce(
            (price, vendor) => Math.min(price, vendor.price),
            Number.POSITIVE_INFINITY,
        );

        const derivedSortOrder = featuredRank.get(seed.slug);

        return {
            ...seed,
            vendorLinks: seed.vendorLinks.map((link) => ({
                ...link,
                redirectUrl: link.redirectUrl ?? link.url,
            })),
            lowestPrice: Number.isFinite(lowestPrice) ? lowestPrice : 0,
            vendorCount: seed.vendorLinks.length,
            sortOrder: derivedSortOrder ?? Number.MAX_SAFE_INTEGER,
        } satisfies Product;
    })
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
