import Image from "next/image";
import Link from "next/link";

import type { NavigationItem } from "./navigation-data";
import { DropdownMenuIcon } from "./navigation-icons";

interface NavigationDropdownProps {
  menu: NonNullable<NavigationItem["dropdown"]>;
}

export function NavigationDropdown({ menu }: NavigationDropdownProps) {
  const hasPreview = menu.hasPreview;

  return (
    <div
      className={`
        pointer-events-none invisible absolute top-full z-50 pt-2
        translate-y-2 opacity-0 transition-all duration-200
        group-hover:pointer-events-auto
        group-hover:visible
        group-hover:translate-y-0
        group-hover:opacity-100
        ${menu.align === "right" ? "right-0" : "left-0"}
      `}
    >
      <div
        className={`
          rounded-lg border border-[#22a447] bg-white p-6
          shadow-[0_6px_18px_rgba(0,0,0,0.15)]
          ${hasPreview ? "w-[570px]" : "w-[330px]"}
        `}
      >
        <div
          className={
            hasPreview ? "grid grid-cols-[1fr_185px] gap-8" : "grid grid-cols-1"
          }
        >
          <div className="flex flex-col gap-7">
            {menu.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group/item flex items-start gap-3"
              >
                <span className="transition-colors group-hover/item:text-[#22a447]">
                  <DropdownMenuIcon type={item.icon} />
                </span>

                <span>
                  <span className="block font-serif text-[17px] font-semibold leading-tight text-black transition-colors group-hover/item:text-[#22a447]">
                    {item.label}
                  </span>

                  <span className="mt-1 block font-serif text-[12px] text-[#333333]">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {hasPreview && (
            <div>
              <div className="relative h-[105px] w-full overflow-hidden">
                <Image
                  src="/images/landing/navigation.png"
                  alt="Pratinjau fitur SmartAgriXR"
                  fill
                  sizes="185px"
                  className="object-cover"
                />
              </div>

              <p className="mt-3 text-justify font-serif text-[10px] leading-[1.2] text-[#222222]">
                Kami terus melakukan penyempurnaan untuk memberikan pengalaman
                pengguna yang optimal. Masukan Anda sangat kami hargai.
              </p>

              <Link
                href="#masukan"
                className="mt-3 inline-block font-serif text-[10px] text-blue-600 underline"
              >
                Beri Masukan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
