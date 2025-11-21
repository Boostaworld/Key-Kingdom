"use client";

import { ChangeEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="mx-auto mb-10 flex w-full max-w-3xl items-center gap-3 rounded-[12px] border border-[#1F2933] bg-[#111827] px-4 py-3 text-left shadow-[0_0_12px_rgba(20,165,255,0.12)] focus-within:border-[#14A5FF] focus-within:shadow-[0_0_10px_rgba(20,165,255,0.35)]">
      <svg
        className="h-5 w-5 flex-shrink-0 text-[#9CA3AF]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M14.875 14.875L18 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.25C15.5 12.9779 12.4779 16 8.75 16C5.02208 16 2 12.9779 2 9.25C2 5.52208 5.02208 2.5 8.75 2.5C12.4779 2.5 15.5 5.52208 15.5 9.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search products..."
        className="w-full bg-transparent text-base text-[#D0D5DD] placeholder:text-[#9CA3AF] focus:outline-none"
      />
    </div>
  );
}
