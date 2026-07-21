import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
const navigationItems = [
  {
    label: "Beranda",
    href: "/",
    hasDropdown: false,
  },
  {
    label: "Bahan Ajar",
    href: "#bahan-ajar",
    hasDropdown: true,
  },
  {
    label: "Editor",
    href: "#editor",
    hasDropdown: true,
  },
  {
    label: "Kelas",
    href: "#kelas",
    hasDropdown: true,
  },
  {
    label: "Inspirasi",
    href: "#inspirasi",
    hasDropdown: true,
  },
];

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
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

function MenuIcon() {
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#171717]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-5 pb-12 pt-5 sm:px-8 lg:pb-16 lg:pt-8">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center text-center">
            <h1 className="font-serif text-[34px] leading-[1.16] tracking-[-0.6px] text-black sm:text-[42px] lg:text-[49px]">
              <span className="text-[#21a447]">Transformasi Pertanian</span>

              <br />

              <span>
                dengan <span className="text-[#21a447]">Teknologi XR</span> yang
                Cerdas
              </span>
            </h1>

            <div className="relative mt-6 flex w-full max-w-[1080px] items-center justify-center sm:h-[430px] lg:mt-7 lg:h-[455px]">
              <div className="absolute left-[2%] top-[10%] hidden sm:block lg:left-[5%]">
                <Image
                  src="/images/landing/wheat.png"
                  alt=""
                  width={150}
                  height={150}
                  className="h-auto w-[105px] animate-bounce object-contain lg:w-[130px]"
                />
              </div>

              <Image
                src="/images/landing/hero-farm.png"
                alt="Ilustrasi pertanian cerdas menggunakan teknologi Extended Reality"
                width={560}
                height={500}
                priority
                className="h-auto max-w-[620px] md:animate-none animate-bounce md:mt-0 mt-10 object-contain sm:max-w-[690px] lg:max-w-[735px]"
              />

              <div className="absolute bottom-[2%] right-[2%] hidden sm:block lg:right-[4%]">
                <Image
                  src="/images/landing/farmer.png"
                  alt=""
                  width={150}
                  height={180}
                  className="h-auto w-[105px] animate-bounce object-contain lg:w-[125px]"
                />
              </div>
            </div>

            <p className="mt-5 max-w-[980px] font-serif text-[16px] leading-[1.45] text-[#202020] sm:mt-6 sm:text-[18px] lg:mt-1 lg:text-[20px]">
              <strong className="font-semibold">SmartAgriXR</strong>{" "}
              menghadirkan solusi{" "}
              <strong className="font-semibold">Extended Reality (XR)</strong>{" "}
              untuk membantu petani, pelaku agribisnis, dan institusi pertanian
              meningkatkan produktivitas, pembelajaran, serta pengambilan
              keputusan berbasis teknologi.
            </p>

            <Link
              href="#daftar"
              className="mt-11 inline-flex h-[54px] min-w-[300px] items-center justify-center bg-[#22a447] px-10 font-serif text-[20px] font-semibold text-white transition-all hover:bg-[#198b3a] focus:outline-none focus:ring-2 focus:ring-[#22a447] focus:ring-offset-2 sm:min-w-[320px] sm:text-[22px]"
            >
              Coba Sekarang
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
