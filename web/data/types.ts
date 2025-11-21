// web/data/types.ts

// 1) You want free-form payment method labels (just strings)
export type PaymentMethod = string;

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
    paymentMethods: PaymentMethod[]; // now this is just string[]

    notes?: string;

    /**
     * Optional CTA label for the link button. Defaults to "Buy now" in the UI.
     */
    ctaLabel?: string;

    // optional profile picture / icon for this specific link
    avatarUrl?: string;     // e.g. "/vendors/keyvendor.png"
}

// 2) You said: NO categories in the UX.
//    So we remove it from the Product interface entirely.
export interface Product {
    id: string;
    name: string;
    slug: string;

    iconUrl: string;
    heroImageUrl?: string;
    tagline?: string;
    description: string;
    features: string[];

    // lower = closer to the front of the list
    sortOrder?: number;

    // keep this flag:
    isUpdated: boolean;

    vendorLinks: VendorLink[];
    lowestPrice: number;
    vendorCount: number;

    tags?: string[];
    lastUpdated?: string;
}
