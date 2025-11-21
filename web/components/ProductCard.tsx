import Image from "next/image";

import { Product } from "@/data/types";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${product.name}`}
      className="group relative flex h-[240px] w-[180px] flex-col items-center rounded-2xl border border-[#1F2933] bg-[#111827] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-transform duration-200 ease-out hover:scale-[1.02] hover:border-[#14A5FF] hover:shadow-[0_0_24px_rgba(20,165,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14A5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03060A]"
    >
      <div className="mt-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#0A0F14] shadow-[0_0_16px_rgba(50,200,255,0.35)]">
        <Image
          src={product.iconUrl}
          alt={`${product.name} icon`}
          width={80}
          height={80}
          className="h-16 w-16 object-contain drop-shadow-[0_0_12px_rgba(50,200,255,0.45)]"
        />
      </div>

      <div className="mt-4 px-3 text-center">
        <p className="text-[16px] font-semibold leading-tight text-white">{product.name}</p>
      </div>

      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        From
      </div>

      <div className="text-[18px] font-bold text-[#14A5FF]">
        ${product.lowestPrice.toFixed(2)}
      </div>

      <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#1F2933] bg-[#111827] shadow-[0_0_12px_rgba(101,225,255,0.25)] transition duration-200 ease-out group-hover:border-[#14A5FF] group-hover:shadow-[0_0_18px_rgba(20,165,255,0.45)]">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 text-[#D0D5DD]"
          fill="currentColor"
        >
          <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7zm0 4h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6zm4 3a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H7z" />
        </svg>
        <span className="absolute -bottom-1 -right-1 rounded-full border border-[#1F2933] bg-[#0A0F14] px-1 text-[11px] font-bold leading-4 text-[#14A5FF]">
          {product.vendorCount}
        </span>
      </div>
    </button>
  );
}

export default ProductCard;
