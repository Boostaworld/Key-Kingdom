"use client";

import { ChangeEvent } from "react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex w-full justify-center">
      <label className="group flex w-full max-w-3xl items-center gap-3 rounded-[12px] bg-[#0F141A] px-4 py-3 text-left shadow-[0_0_14px_rgba(20,165,255,0.1)] transition-all duration-200 hover:shadow-[0_0_22px_rgba(20,165,255,0.28)] focus-within:shadow-[0_0_26px_rgba(20,165,255,0.4)]">
        <svg
          className="h-5 w-5 flex-shrink-0 text-[#9CA3AF] transition-colors duration-200 group-hover:text-[#D0D5DD]"
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
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="w-full bg-transparent text-base text-[#D0D5DD] placeholder:text-[#9CA3AF] focus:outline-none"
        />
      </label>
    </div>
  );
}
