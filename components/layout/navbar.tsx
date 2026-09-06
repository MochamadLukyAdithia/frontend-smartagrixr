"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { navigationItems } from "./navigation-data";
import { NavigationDropdown } from "./navigation-dropdown";
import { ChevronDownIcon } from "./navigation-icons";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";

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
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = !!token;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // State untuk Modal Konfirmasi Logout yang keren
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
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

  function confirmLogout() {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsLogoutModalOpen(false);
    router.push("/");
  }

  return (
    <>
      <header
        className={`fixed z-[60] w-full transition-all duration-300 ${
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

          {isLoggedIn ? (
            <div className="hidden shrink-0 items-center gap-6 lg:flex pr-4">
              <button
                type="button"
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#dca82a] shadow-sm transition hover:bg-[#c99723] hover:scale-105 cursor-pointer"
                title="Pencapaian Anda"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 15.25l-4.5 2.75.75-5.25-3.75-3.5 5.25-.5L12 4l2.25 4.75 5.25.5-3.75 3.5.75 5.25z" />
                </svg>
              </button>

              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsProfileOpen(false);
                  }}
                  className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full transition hover:bg-gray-100 cursor-pointer"
                  title="Notifikasi"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#171717"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span className="absolute right-[8px] top-[6px] h-2.5 w-2.5 rounded-full bg-[#ff3b3b] border-2 border-white"></span>
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-white p-5 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="font-serif text-[16px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                      Notifikasi
                    </h4>
                    <div className="py-6 flex flex-col items-center justify-center">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-2"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <p className="font-serif text-[14px] text-gray-500">
                        Notifikasi kosong
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative ml-2" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotifOpen(false);
                  }}
                  className="h-[46px] w-[46px] overflow-hidden rounded-full border border-gray-200 transition-all hover:border-[#21a447] hover:shadow-md cursor-pointer focus:outline-none"
                >
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
                    }
                    alt="Profil"
                    className="h-full w-full object-cover"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href="/dashboard/beranda"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[15px] font-serif font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      Dashboard
                    </Link>
                    <div className="h-[1px] bg-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-serif font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}

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

          {isLoggedIn ? (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 border border-gray-100">
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
                  }
                  alt="Profil"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="font-serif text-[16px] font-semibold text-[#171717]">
                  {user?.name || "Profil Anda"}
                </span>
              </div>
              <button
                onClick={() => {
                  handleMobileMenuClose();
                  setIsLogoutModalOpen(true);
                }}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-red-500 bg-white font-serif text-[16px] font-semibold text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
              >
                Keluar Akun
              </button>
            </div>
          ) : (
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
          )}
        </nav>
      </div>

      {/* =========================================================
          MODAL KONFIRMASI LOGOUT (EFEK KEREN DENGAN ANIMASI)
          ========================================================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
            {/* Dekorasi Cahaya / Lingkaran Lembut di Atas */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full bg-red-100 blur-xl pointer-events-none"></div>

            {/* Ikon Peringatan / Keluar */}
            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-inner">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>

            {/* Teks Konfirmasi */}
            <h3 className="font-serif text-[20px] font-bold text-gray-900 mb-2">
              Keluar dari Akun?
            </h3>
            <p className="font-serif text-[14px] text-gray-500 mb-8 leading-relaxed">
              Anda harus masuk kembali menggunakan kredensial Anda untuk
              mengakses sesi berikutnya.
            </p>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 font-serif text-[15px] font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-3.5 font-serif text-[15px] font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
