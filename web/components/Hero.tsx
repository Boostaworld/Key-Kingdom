"use client";

import Image from "next/image";

export function Hero() {
  return (
    <section className="flex w-full flex-col items-center bg-[#03060A] px-6 py-12 text-center md:py-14">
      <div className="flex w-full max-w-6xl justify-start">
        <div className="flex items-center justify-center rounded-full border border-[#1A1F25] bg-[#0A0F14] p-2 shadow-[0_0_18px_rgba(20,165,255,0.45)]">
          <Image
            src="/assets/key-kingdom.png"
            alt="Key-Kingdom profile"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full drop-shadow-[0_0_18px_rgba(50,200,255,0.55),0_0_32px_rgba(102,225,255,0.35)] shadow-[0_0_25px_rgba(20,165,255,0.65)]"
            priority
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 md:mt-9">
        <p className="max-w-2xl text-lg font-light text-[#D0D5DD]">
          Your one stop hub for all executor keys
        </p>
      </div>
    </section>
  );
}
