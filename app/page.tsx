"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";

const TESTIMONI_DATA = [
  {
    quote:
      "“Belajar menggunakan SmartAgriXR membuat materi yang sebelumnya sulit dipahami menjadi lebih jelas. Simulasi dan visualisasi yang interaktif membantu saya memahami proses budidaya tanaman modern dan smart farming dengan lebih cepat.”",
    name: "Andita Prisilia",
    role: "Mahasiswa Unej",
  },
  {
    quote:
      "“SmartAgriXR memberikan pengalaman belajar yang lebih menarik dibandingkan metode konvensional. Mahasiswa dapat memahami konsep pertanian modern dan teknologi digital secara lebih visual, interaktif, dan mudah dipahami.”",
    name: "Dr. Budi Santoso, S.TP., M.P.",
    role: "Dosen THP",
  },
  {
    quote:
      "“Materi yang disajikan dalam SmartAgriXR mudah dipahami bahkan oleh masyarakat umum. Teknologi ini membuka peluang bagi petani dan pelaku usaha untuk mempelajari inovasi pertanian secara modern tanpa harus selalu berada di lapangan.”",
    name: "Siti Nur Aisyah",
    role: "Pelaku UMKM Pertanian",
  },
];

const FOOTER_LINKS = ["Beranda", "Bahan Ajar", "Editor", "Kelas", "Tutorial"];
const FOOTER_SUPPORT = ["Help Center", "Community", "FAQ"];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === TESTIMONI_DATA.length - 1 ? 0 : prevIndex + 1,
    );
  };
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? TESTIMONI_DATA.length - 1 : prevIndex - 1,
    );
  };
  return (
    <div className="min-h-screen bg-[url('/bg.svg')] bg-top bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />
      <main className="mt-20">
        <section className="relative  overflow-hidden px-5 pb-12 pt-5 sm:px-8 lg:pb-16 lg:pt-8">
          <div className="pointer-events-none absolute -left-[15%] -top-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-[#21a447]/15 blur-[120px] lg:-left-[10%] lg:h-[800px] lg:w-[800px]"></div>

          <div className="pointer-events-none absolute -bottom-[20%] -right-[15%] -z-10 h-[600px] w-[600px] rounded-full bg-[#21a447]/15 blur-[120px] lg:-right-[5%] lg:h-[800px] lg:w-[800px]"></div>

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
              <div className="absolute bottom-[2%] left-[2%] hidden sm:block lg:left-[-15%]">
                <Image
                  src="/images/landing/drone.svg"
                  alt=""
                  width={150}
                  height={180}
                  className="h-auto w-[105px] animate-bounce object-contain lg:w-[125px]"
                />
              </div>
              <div className="absolute top-[2%] right-[2%] hidden sm:block lg:right-[-15%]">
                <Image
                  src="/images/landing/drone.svg"
                  alt=""
                  width={150}
                  height={180}
                  className="h-auto w-[105px] animate-bounce object-contain lg:w-[125px]"
                />
              </div>
            </div>

            <p className="mt-5 max-w-[980px] font-serif text-[16px] leading-[1.45] text-[#202020] sm:mt-6 sm:text-[18px] lg:mt-1 lg:text-[20px]">
              <strong className="font-semibold">SmartAgriXR</strong> menghadirkan
              solusi Extended Reality (XR) untuk membantu petani, pelaku
              agribisnis, dan institusi pertanian meningkatkan produktivitas,
              pembelajaran, serta pengambilan keputusan berbasis teknologi.
            </p>

            <Link
              href="#daftar"
              className="mt-11 rounded-full inline-flex h-[54px] min-w-[300px] items-center justify-center bg-[#22a447] px-10 font-serif text-[20px] font-semibold text-white transition-all hover:bg-[#198b3a] focus:outline-none focus:ring-2 focus:ring-[#22a447] focus:ring-offset-2 sm:min-w-[320px] sm:text-[22px]"
            >
              Coba Sekarang
            </Link>
          </div>
        </section>
        <section id="visi-misi" className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-3">
                <Image
                  src="/images/landing/visi/visi.svg"
                  alt="Ilustrasi dashboard dan lahan pertanian SmartAgriXR"
                  width={800}
                  height={500}
                  className="h-auto w-full rounded-2xl object-cover"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="font-serif text-[28px] font-bold text-black sm:text-[32px] lg:text-[36px]">
                Visi dan <span className="text-[#21a447]">Misi</span>
              </h2>

              <h3 className="mt-4 font-serif text-[22px] font-semibold leading-[1.3] text-[#171717] sm:text-[26px] lg:mt-6 lg:text-[32px]">
                Membangun Masa Depan <br className="hidden sm:block" />
                Pertanian yang Berkelanjutan
              </h3>

              <p className="mt-5 text-justify font-serif text-[16px] leading-[1.7] text-[#4a4a4a] sm:text-left sm:text-[17px] lg:mt-7 lg:text-[18px]">
                SmartAgriXR hadir untuk mendukung pembelajaran pertanian yang
                lebih modern, interaktif, dan relevan dengan kebutuhan industri
                masa depan. Melalui teknologi XR (Extended Reality), simulasi
                digital, dan ekosistem pembelajaran terintegrasi, kami membantu
                menciptakan pengalaman belajar yang lebih efektif dan bermakna.
              </p>
            </div>
          </div>
        </section>
        <section id="bahan-ajar" className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-16 lg:flex-row lg:justify-between lg:gap-12">
            <div className="w-full lg:w-5/12">
              <h2 className="font-serif text-[28px] font-bold text-[#21a447] sm:text-[32px] lg:text-[38px] leading-tight">
                Bahan Ajar 3D & AR Siap Pakai
              </h2>
              <p className="mt-5 text-justify font-serif text-[16px] leading-[1.7] text-[#4a4a4a] sm:text-left sm:text-[17px] lg:mt-6 lg:text-[18px]">
                Menggabungkan pertanian, teknologi, dan pembelajaran imersif
                untuk menciptakan pendidikan yang lebih inovatif dan
                berkelanjutan.
              </p>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-20 pt-10 sm:flex-row sm:gap-8 lg:w-7/12 lg:gap-10 lg:pt-0">
              <div className="flex flex-col gap-20 sm:gap-16">
                <div className="relative w-[230px] rounded-2xl bg-white px-6 pb-8 pt-16 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)]">
                  <div className="absolute -top-12 left-1/2 flex h-[90px] w-[90px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
                    <Image
                      src="/images/landing/ajar/pertanian-berkelanjutan.svg"
                      alt="Ikon Pertanian Berkelanjutan"
                      width={75}
                      height={75}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-center font-serif text-[18px] font-bold leading-snug text-[#171717]">
                    Pertanian <br /> Berkelanjutan
                  </h3>
                </div>

                <div className="relative w-[230px] rounded-2xl bg-white px-6 pb-8 pt-16 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)]">
                  <div className="absolute -top-12 left-1/2 flex h-[90px] w-[90px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
                    <Image
                      src="/images/landing/ajar/transformasi-digital.svg"
                      alt="Ikon Transformasi Digital"
                      width={75}
                      height={75}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-center font-serif text-[18px] font-bold leading-snug text-[#171717]">
                    Transformasi <br /> Digital
                  </h3>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="relative w-[230px] rounded-2xl bg-white px-6 pb-8 pt-16 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)]">
                  <div className="absolute -top-12 left-1/2 flex h-[90px] w-[90px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
                    <Image
                      src="/images/landing/ajar/pembelajaran-imersif.svg"
                      alt="Ikon Pembelajaran Imersif"
                      width={75}
                      height={75}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-center font-serif text-[18px] font-bold leading-snug text-[#171717]">
                    Pembelajaran <br /> Imersif
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="kelas-interaktif" className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center">
            <h2 className="text-center font-serif text-[28px] font-bold text-[#21a447] sm:text-[32px] lg:text-[38px]">
              Kelas Interaktif dengan Praktek 3D
            </h2>

            <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:gap-8">
              <div className="relative w-full overflow-hidden rounded-2xl  border-gray-100  shadow-[0_10px_30px_rgba(0,0,0,0.08)] aspect-[4/3]">
                <Image
                  src="/images/landing/kelas/1.png"
                  alt="Mahasiswa praktek di greenhouse"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] aspect-[4/3]">
                <Image
                  src="/images/landing/kelas/2.png"
                  alt="Diskusi kelompok mahasiswa"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] aspect-[4/3]">
                <Image
                  src="/images/landing/kelas/3.png"
                  alt="Praktek lapangan dengan panel surya"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] aspect-[4/3]">
                <Image
                  src="/images/landing/kelas/4.png"
                  alt="Presentasi alur rantai pasok agroindustri"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONI: carousel 3 kartu, judul + panah di kiri --- */}
        <section id="testimoni" className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="w-full flex-shrink-0 text-left lg:w-[300px]">
              <h2 className="font-serif text-[28px] font-bold text-black sm:text-[32px] lg:text-[36px]">
                <span className="text-[#21a447]">Testimoni</span> Pengguna
              </h2>
              <p className="mt-4 font-serif text-[15px] leading-[1.6] text-[#4a4a4a] sm:text-[16px]">
                Setiap orang punya cara belajar yang berbeda. Dengar langsung
                cerita mereka setelah mencoba cara baru belajar pertanian
                bersama SmartAgriXR.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#21a447] text-[#21a447] transition-all hover:bg-[#21a447] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2"
                  aria-label="Testimoni Sebelumnya"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:-translate-x-1"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  onClick={handleNext}
                  className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#21a447] text-[#21a447] transition-all hover:bg-[#21a447] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2"
                  aria-label="Testimoni Selanjutnya"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="w-full lg:flex-1">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {TESTIMONI_DATA.map((item, idx) => (
                  <div
                    key={item.name}
                    className={`flex flex-col justify-between rounded-2xl bg-white p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all lg:p-7 ${
                      idx === currentIndex
                        ? "ring-2 ring-[#21a447]/70"
                        : "opacity-90"
                    }`}
                  >
                    <p className="font-serif text-[15px] leading-[1.65] text-[#202020]">
                      {item.quote}
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#21a447]/10 font-serif text-[16px] font-bold text-[#21a447]">
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif text-[15px] font-bold text-black">
                          {item.name}
                        </span>
                        <span className="font-serif text-[13px] text-gray-600">
                          {item.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center gap-2 lg:justify-start">
                {TESTIMONI_DATA.map((item, idx) => (
                  <button
                    key={item.name}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Lihat testimoni ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-6 bg-[#21a447]"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA: Buat Simulasi Pembelajaran Imersif --- */}
        <section id="buat-modul" className="px-5 pb-20 pt-4 sm:px-8 lg:pb-28">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center rounded-[32px] bg-gradient-to-br from-[#1f7a37] to-[#0f3d1c] px-6 py-14 text-center sm:px-14 sm:py-16">
            <h2 className="font-serif text-[26px] font-bold text-white sm:text-[32px] lg:text-[36px]">
              Buat Simulasi Pembelajaran Imersif
            </h2>
            <p className="mx-auto mt-4 max-w-[640px] font-serif text-[15px] leading-[1.65] text-white/85 sm:text-[17px]">
              Ubah materi pembelajaran menjadi simulasi imersif yang menarik
              dan mudah dipahami. Tidak perlu coding, cukup desain dan
              publikasikan.
            </p>
            <Link
              href="#daftar"
              className="mt-9 inline-flex h-[54px] items-center justify-center rounded-full bg-white px-9 font-serif text-[16px] font-semibold text-[#1f7a37] transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1f7a37] sm:text-[18px]"
            >
              Buat Modul XR Mu Sekarang
            </Link>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-100 px-5 pb-10 pt-14 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
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
              Platform pembelajaran imersif yang menggabungkan teknologi XR
              dan pertanian untuk menghadirkan pengalaman belajar yang lebih
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
                Jalan Kalimantan No. 37, Kampus Tegalboto, Kecamatan
                Sumbersari, Kabupaten Jember, Jawa Timur 68121.
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
    </div>
  );
}