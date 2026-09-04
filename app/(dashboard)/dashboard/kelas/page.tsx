"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Link from "next/link";

export default function KelasPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState(["", "", "", ""]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleCodeChange = (index: number, value: string) => {
    const char = value.slice(-1).replace(/[^0-9]/g, "");

    const newCode = [...joinCode];
    newCode[index] = char;
    setJoinCode(newCode);

    if (char !== "" && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && joinCode[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleJoinClass = () => {
    setClasses([
      {
        id: "1",
        link: "/dashboard/kelas/1",
        title: "Pertanian Industrial",
        image: "/images/dashboard/beranda/1.png",
      },
    ]);
    setJoinOpen(false);
    setJoinCode(["", "", "", ""]);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[url('/bg.svg')]  text-[#171717] overflow-hidden">
      <Navbar />

      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-[-10%] w-[80%] h-[800px] bg-[#eef6f0] rotate-[-15deg] transform origin-top-right rounded-[100px]"></div>
      </div>

      <main className="relative z-10  flex w-full container flex-col flex-1 px-6 pb-32 pt-32 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 mb-10">
          <h1 className="font-serif text-[26px] font-bold text-[#171717] sm:text-[30px]">
            Kelas Anda
          </h1>

          <button
            type="button"
            onClick={() =>
              classes.length === 0
                ? setJoinOpen(true)
                : alert("Fitur Buat Kelas Baru")
            }
            className="rounded-full bg-[#21a447] px-6 py-2.5 font-serif text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-[#198b3a] w-fit"
          >
            {classes.length === 0 ? "+ Gabung Ke Kelas" : "+ Buat Kelas Baru"}
          </button>
        </div>

        {classes.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-10">
            <div className="relative mb-6 h-32 w-32">
              <Image
                src="/images/dashboard/kelas/maskot-1.png"
                alt="Belum ada kelas"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>

            <p className="font-serif text-[18px] text-[#171717] text-center mb-8">
              Anda belum memiliki kelas apapun.
              <br />
              Gabung kelas sekarang.
            </p>

            <button
              onClick={() => setJoinOpen(true)}
              className="rounded-xl bg-[#21a447] px-10 py-3.5 font-serif text-[16px] font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#198b3a]"
            >
              + Gabung ke Kelas
            </button>
          </div>
        )}

        {classes.length > 0 && (
          <div className="grid grid-cols-1 bg-slate-400/40 backdrop-blur-md relative z-20 h-fit p-6 rounded-xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => (
              <Link
                href={cls.link}
                key={cls.id}
                className="group relative h-[200px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-md transition-all hover:shadow-xl"
              >
                <Image
                  src={cls.image}
                  alt={cls.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5">
                  <h3 className="font-serif text-[18px] font-bold text-white">
                    {cls.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-[400px] left-0 z-0 hidden lg:block w-[400px] h-[250px] pointer-events-none">
        <Image
          src="/images/dashboard/kelas/batu.png"
          alt="Dekorasi Kiri"
          fill
          className="object-contain object-bottom-left"
        />
      </div>
      <div className="fixed bottom-[400px] right-0 z-0 hidden lg:block w-[350px] h-[250px] pointer-events-none">
        <Image
          src="/images/dashboard/kelas/batu-2.png"
          alt="Dekorasi Kanan"
          fill
          className="object-contain object-bottom-right"
        />
      </div>
      <div className="z-[200] mt-20">
        <Footer />
      </div>

      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-[450px] rounded-2xl bg-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <Image src="/logo.png" alt="watermark" width={300} height={300} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="mb-8 font-serif text-[20px] font-bold text-[#145a2b]">
                Masukkan Kode Undangan
              </h2>

              <div className="mb-10 flex gap-4">
                {joinCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-16 w-14 rounded-lg border-2 border-gray-300 bg-white text-center font-sans text-[24px] font-bold text-black outline-none transition-colors focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20"
                  />
                ))}
              </div>

              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={handleJoinClass}
                  disabled={joinCode.join("").length < 4}
                  className="w-full rounded-xl bg-[#21a447] py-3.5 font-serif text-[16px] font-bold text-white shadow-md transition-all hover:bg-[#198b3a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={() => {
                    setJoinOpen(false);
                    setJoinCode(["", "", "", ""]);
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white py-3.5 font-serif text-[16px] font-bold text-gray-600 transition-all hover:bg-gray-50"
                >
                  Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
