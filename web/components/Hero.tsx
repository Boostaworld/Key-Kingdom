"use client";

import Image from "next/image";

export function Hero() {
  return (
    <header className="w-full bg-[#03060A]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col px-6 pb-6 pt-8 md:pb-5 md:pt-10">
        <div className="flex w-full items-start justify-between">
          <div className="flex items-start gap-4">
            <Image
              src="/assets/key-kingdom.png"
              alt="Key-Kingdom profile"
              width={80}
              height={80}
              className="h-20 w-20 object-contain drop-shadow-[0_0_24px_rgba(31,176,255,0.35)]"
              priority
            />
          </div>

        </div>
        <p className="mt-8 text-sm font-medium text-white/50">
          Unlock your software. Choose your vendor.
        </p>
      </div>
    </header>
  );
}
