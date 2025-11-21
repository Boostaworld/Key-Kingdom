// web/data/types.ts

export type PaymentMethod =
    | "credit_card"
    | "paypal"
    | "crypto"
    | "cashapp"
    | "other";

export interface VendorLink {
    id: string;
    vendorName: string;
    url: string;
    /**
     * Optional redirect destination. Use this when you need an affiliate or tracking URL
     * that is different from the public vendor URL.
     */
    redirectUrl?: string;
    price: number;
    currency: string;
    paymentMethods: PaymentMethod[];
    notes?: string;

    /**
     * Optional CTA label for the link button. Defaults to "Buy now" in the UI.
     */
    ctaLabel?: string;

    // NEW: optional profile picture / icon for this specific link
    avatarUrl?: string;     // e.g. "/vendors/keyvendor.png"
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    category: "Executors";
    iconUrl: string;
    heroImageUrl?: string;
    tagline?: string;
    description: string;
    features: string[];
    sortOrder?: number; // lower = closer to the front of the list
    isUpdated: boolean;

    vendorLinks: VendorLink[];
    lowestPrice: number;
    vendorCount: number;

    tags?: string[];
    lastUpdated?: string;
}
