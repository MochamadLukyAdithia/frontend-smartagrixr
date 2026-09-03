"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { navigationItems } from "./navigation-data";
import { NavigationDropdown } from "./navigation-dropdown";
import { ChevronDownIcon } from "./navigation-icons";
import Image from "next/image";

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative block h-6 w-6">
      {isOpen ? (
        <>
          <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-black transition-all duration-300" />
          <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-black transition-all duration-300" />
        </>
      ) : (
        <>
          <span className="absolute left-0 top-[4px] h-[2px] w-6 rounded-full bg-black transition-all duration-300" />
          <span className="absolute left-0 top-[11px] h-[2px] w-6 rounded-full bg-black transition-all duration-300" />
          <span className="absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-black transition-all duration-300" />
        </>
      )}
    </span>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleMobileMenuToggle() {
    setIsMobileMenuOpen((previousState) => !previousState);
    setActiveMobileDropdown(null);
  }

  function handleMobileDropdownToggle(label: string) {
    setActiveMobileDropdown((currentLabel) =>
      currentLabel === label ? null : label,
    );
  }

  function handleMobileMenuClose() {
    setIsMobileMenuOpen(false);
    setActiveMobileDropdown(null);
  }

  return (
    <>
      <header
        className={`fixed z-[60]  w-full transition-all duration-300 ${
          isScrolled ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[98px] w-full max-w-[1580px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handleMobileMenuClose}
              className="shrink-0 font-serif text-[22px] font-semibold text-black sm:text-[25px] lg:text-[28px]"
            >
              <Image
                src="/logo-fixed.png"
                width={40}
                height={40}
                className="w-40"
                alt="Logo"
              />
            </Link>
          </div>

          <nav className="hidden flex-1 items-center lg:flex">
            <div className="ml-[70px] flex items-center gap-[38px] xl:ml-[92px] xl:gap-[43px]">
              {navigationItems.map((item) => (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className="flex h-[70px] items-center gap-2 font-serif text-[18px] text-[#1b1b1b] transition-colors hover:text-[#21a447] xl:text-[20px]"
                  >
                    <span>{item.label}</span>

                    {item.dropdown && <ChevronDownIcon />}
                  </Link>

                  {item.dropdown && <NavigationDropdown menu={item.dropdown} />}
                </div>
              ))}
            </div>
          </nav>

          <div className="hidden shrink-0 items-center gap-7 lg:flex">
            <Link
              href="/masuk"
              className="font-serif text-[18px] text-[#1b1b1b] transition-colors hover:text-[#21a447] xl:text-[20px]"
            >
              Masuk
            </Link>

            <Link
              href="/daftar"
              className="inline-flex rounded-full h-[42px] min-w-[138px] items-center justify-center bg-[#22a447] px-7 font-serif text-[18px] text-white transition-colors hover:bg-[#198b3a] xl:text-[20px]"
            >
              Daftar
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={handleMobileMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>
        </div>
      </header>

      <button
        type="button"
        aria-label="Tutup menu navigasi"
        onClick={handleMobileMenuClose}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <div
        id="mobile-navigation"
        className={`fixed left-0 right-0 top-[98px] z-50 overflow-hidden border-t border-gray-200 bg-white shadow-lg transition-all duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "visible max-h-[calc(100vh-98px)] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
      >
        <nav className="max-h-[calc(100vh-98px)] overflow-y-auto px-6 pb-7 pt-3">
          {navigationItems.map((item) => {
            const isDropdownOpen = activeMobileDropdown === item.label;

            if (!item.dropdown) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleMobileMenuClose}
                  className="flex min-h-12 items-center border-b border-gray-100 font-serif text-[17px] font-medium text-[#171717] transition-colors hover:text-[#22a447]"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.label} className="border-b border-gray-100">
                <button
                  type="button"
                  aria-expanded={isDropdownOpen}
                  onClick={() => handleMobileDropdownToggle(item.label)}
                  className="flex min-h-12 w-full items-center justify-between font-serif text-[17px] font-medium text-[#171717]"
                >
                  <span>{item.label}</span>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isDropdownOpen ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-1 border-l-2 border-[#22a447] pl-4">
                      {item.dropdown.items.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          onClick={handleMobileMenuClose}
                          className="rounded-md px-3 py-3 transition-colors hover:bg-green-50"
                        >
                          <span className="block font-serif text-[16px] font-semibold text-[#171717]">
                            {dropdownItem.label}
                          </span>

                          <span className="mt-1 block font-serif text-[13px] leading-relaxed text-gray-500">
                            {dropdownItem.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/masuk"
              onClick={handleMobileMenuClose}
              className="inline-flex h-11 items-center justify-center border border-[#22a447] font-serif text-[16px] font-semibold text-[#22a447] transition-colors hover:bg-green-50"
            >
              Masuk
            </Link>

            <Link
              href="/daftar"
              onClick={handleMobileMenuClose}
              className="inline-flex h-11 items-center justify-center bg-[#22a447] font-serif text-[16px] font-semibold text-white transition-colors hover:bg-[#198b3a]"
            >
              Daftar
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
