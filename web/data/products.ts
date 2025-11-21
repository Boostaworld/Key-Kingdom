// web/data/products.ts
import type { Product } from "./types";

export const products: Product[] = [
    {
        id: "assembly-executor",
        name: "assembly",
        slug: "assembly-executor",
        category: "Executors",
        iconUrl: "/products/assembly.png",
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
                url: "https://keyvendor.com/assembly?aff=XXXX",
                price: 9.97,
                currency: "USD",
                paymentMethods: ["credit_card", "paypal"],
                notes: "Instant delivery via email",
                avatarUrl: "/vendors/keyvendor.png",    // link-specific PFP
            },
            {
                id: "assembly-scripthub",
                vendorName: "ScriptHub",
                url: "https://scripthub.io/assembly?ref=YYYY",
                price: 11.99,
                currency: "USD",
                paymentMethods: ["credit_card", "crypto"],
                notes: "24/7 support",
                avatarUrl: "/vendors/scripthub.png",
            },
        ],
        lowestPrice: 9.97,
        vendorCount: 2,
        tags: ["executor", "roblox"],
        lastUpdated: "2025-11-15",
    },

    // add more products here...
];
