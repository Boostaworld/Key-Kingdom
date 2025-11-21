"use client";

import Image from "next/image";

export function Hero() {
  return (
    <header className="w-full bg-[#03060A]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 pb-6 pt-8 md:pb-5 md:pt-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1F2933] bg-[#0A0F14]">
            <Image
              src="/assets/key-kingdom.png"
              alt="Key-Kingdom profile"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
              priority
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-xs uppercase tracking-[0.24em] text-[#1FB0FF]">Key-Kingdom</span>
            <p className="text-base font-light text-[#D0D5DD]">
              Unlock your software. Choose your vendor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/your-invite-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join the Discord"
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#1F2933] bg-[#111827] text-[#D0D5DD] transition duration-200 hover:border-[#14A5FF] hover:text-[#14A5FF] hover:shadow-[0_0_16px_rgba(20,165,255,0.35)] focus:outline-none focus:ring-2 focus:ring-[#1FB0FF] focus:ring-offset-2 focus:ring-offset-[#03060A]"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.373.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
