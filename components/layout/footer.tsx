import Image from "next/image";
import Link from "next/link";
import React from "react";

const footer = () => {
  const FOOTER_LINKS = ["Beranda", "Bahan Ajar", "Editor", "Kelas", "Tutorial"];
  const FOOTER_SUPPORT = ["Help Center", "Community", "FAQ"];
  return (
    <footer className="border-t border-gray-100 px-5 pb-10 pt-14 sm:px-8">
      <div className="flex w-full container flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
        <div className="max-w-[320px]">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo UNEJ SmartAgriXR"
              width={36}
              height={36}
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-[15px] font-bold text-black">
                UNEJ
              </span>
              <span className="font-serif text-[15px] font-bold text-[#21a447]">
                SmartAgriXR
              </span>
            </div>
          </div>
          <p className="mt-4 font-serif text-[14px] leading-[1.65] text-gray-500">
            Platform pembelajaran imersif yang menggabungkan teknologi XR dan
            pertanian untuk menghadirkan pengalaman belajar yang lebih
            interaktif, praktis, dan menyenangkan.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-20">
          <div>
            <h4 className="font-serif text-[16px] font-bold text-black">
              Link
            </h4>
            <ul className="mt-4 flex flex-col gap-2 font-serif text-[14px] text-gray-500">
              {FOOTER_LINKS.map((label) => (
                <li key={label}>
                  <Link href="#" className="hover:text-[#21a447]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[16px] font-bold text-black">
              Support
            </h4>
            <ul className="mt-4 flex flex-col gap-2 font-serif text-[14px] text-gray-500">
              {FOOTER_SUPPORT.map((label) => (
                <li key={label}>
                  <Link href="#" className="hover:text-[#21a447]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[16px] font-bold text-black">
              Contact
            </h4>
            <p className="mt-4 max-w-[240px] font-serif text-[14px] leading-[1.65] text-gray-500">
              Jalan Kalimantan No. 37, Kampus Tegalboto, Kecamatan Sumbersari,
              Kabupaten Jember, Jawa Timur 68121.
              <br />
              (0331) 330224
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[1320px] border-t border-gray-100 pt-6 text-center font-serif text-[13px] text-gray-400">
        ©2026 SmartAgriXR, All Rights Reserved
      </div>
    </footer>
  );
};

export default footer;
