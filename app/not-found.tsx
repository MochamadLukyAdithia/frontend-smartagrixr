import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[url('/bg.svg')] bg-cover bg-center bg-no-repeat px-6 text-center">
      <Image
        src="/images/landing/wheat.png"
        alt=""
        width={120}
        height={120}
        className="mb-8 h-auto w-[90px] animate-bounce object-contain sm:w-[110px]"
        style={{ animationDuration: "3s" }}
      />

      <h1 className="font-serif text-[90px] font-black leading-none text-[#21a447] sm:text-[130px]">
        404
      </h1>

      <h2 className="mt-4 font-serif text-[24px] font-bold text-[#171717] sm:text-[30px]">
        Halaman Tidak Ditemukan
      </h2>

      <p className="mx-auto mt-3 max-w-[420px] font-serif text-[15px] leading-relaxed text-[#4a4a4a] sm:text-[16px]">
        Sepertinya lahan yang Anda cari belum ditanami. Periksa kembali alamat
        URL Anda atau kembali ke halaman utama.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-[48px] items-center justify-center rounded-full bg-[#21a447] px-8 font-serif text-[15px] font-semibold text-white transition-all hover:bg-[#198b3a] focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/masuk"
          className="inline-flex h-[48px] items-center justify-center rounded-full border border-[#21a447] bg-white px-8 font-serif text-[15px] font-semibold text-[#21a447] transition-all hover:bg-[#21a447]/5 focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2"
        >
          Masuk
        </Link>
      </div>
    </div>
  );
}