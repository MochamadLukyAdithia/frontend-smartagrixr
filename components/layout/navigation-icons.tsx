import type { MenuIcon } from "./navigation-data";
import Image from "next/image";
import { iconMap } from "./icon-map";

export function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DropdownMenuIcon({ type }: { type: MenuIcon }) {
  return (
    <Image
      src={iconMap[type]}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 object-contain"
    />
  );
}
