"use client";

import Image from "next/image";
import { useEffect } from "react";

import { Product, VendorLink } from "../data/types";

type ProductModalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
};

const paymentLabels: Record<VendorLink["paymentMethods"][number], string> = {
    credit_card: "Credit Card",
    paypal: "PayPal",
    crypto: "Crypto",
    cashapp: "Cash App",
    other: "Other",
};

const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) {
        return null;
    }

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,6,10,0.9)] px-4 py-10"
            onMouseDown={handleBackdropClick}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-3xl rounded-[24px] border border-[#1F2933] bg-[#111827] p-10 shadow-[0_0_20px_rgba(20,165,255,0.6),0_0_40px_rgba(95,216,255,0.3)]"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[#D0D5DD] transition hover:text-white"
                >
                    &#215;
                </button>

                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex w-full flex-col items-center gap-4 md:flex-row md:items-start md:justify-between md:text-left">
                        <div className="flex items-center justify-center">
                            <Image
                                src={product.iconUrl}
                                alt={product.name}
                                width={120}
                                height={120}
                                className="rounded-2xl shadow-[0_0_40px_rgba(102,225,255,0.2)]"
                            />
                        </div>
                        <div className="flex flex-1 flex-col items-center gap-2 md:items-start">
                            <h2 className="text-3xl font-bold text-white">{product.name}</h2>
                            {product.tagline ? (
                                <p className="text-lg italic text-[#14A5FF]">{product.tagline}</p>
                            ) : null}
                        </div>
                    </div>

                    <p className="w-full text-left text-base leading-relaxed text-[#D0D5DD] md:text-lg">
                        {product.description}
                    </p>

                    {product.features.length > 0 ? (
                        <div className="w-full text-left">
                            <h3 className="mb-2 text-lg font-semibold text-white">Features:</h3>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-[#D0D5DD]">
                                {product.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <div className="h-px w-full bg-[#1F2933]" aria-hidden />

                    <div className="w-full text-left">
                        <h3 className="mb-4 text-xl font-semibold text-white">Available From:</h3>
                        <div className="space-y-4">
                            {product.vendorLinks.map((vendor) => (
                                <VendorRow key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    </div>

                    <p className="w-full text-center text-xs text-[#9CA3AF]">
                        Key-Kingdom earns commission on purchases. Learn more.
                    </p>
                </div>
            </div>
        </div>
    );
}

function VendorRow({ vendor }: { vendor: VendorLink }) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-[#1F2933] bg-[#111827] p-5 shadow-[0_0_12px_rgba(20,165,255,0.3)] md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-3">
                    {vendor.avatarUrl ? (
                        <Image
                            src={vendor.avatarUrl}
                            alt={`${vendor.vendorName} icon`}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : null}
                    <h4 className="text-lg font-semibold text-white">{vendor.vendorName}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#D0D5DD]">
                    {vendor.paymentMethods.map((method) => (
                        <span
                            key={method}
                            className="rounded-full border border-[#1F2933] bg-[#0d121a] px-3 py-1 text-[11px] uppercase tracking-wide text-[#D0D5DD]"
                        >
                            {paymentLabels[method]}
                        </span>
                    ))}
                </div>
                {vendor.notes ? <p className="text-xs text-[#9CA3AF]">{vendor.notes}</p> : null}
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
                <span className="text-xl font-bold text-[#14A5FF]">{formatPrice(vendor.price, vendor.currency)}</span>
                <a
                    href={vendor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#14A5FF] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 hover:shadow-[0_0_20px_rgba(20,165,255,0.6),0_0_40px_rgba(95,216,255,0.3)]"
                >
                    Buy Now →
                </a>
            </div>
        </div>
    );
}
