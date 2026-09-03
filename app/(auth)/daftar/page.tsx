"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Daftar() {
  // Step 1: Split-screen (awal), Step 2-5: Card Pop-up
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    role: "Mahasiswa",
    topics: [] as string[],
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- RENDER 3D KUBUS INTERAKTIF (BISA DIGESER DENGAN MOUSE) UNTUK STEP 5 ---
  useEffect(() => {
    if (step !== 5) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationX = 0.5;
    let rotationY = 0.5;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      rotationY += deltaX * 0.01;
      rotationX += deltaY * 0.01;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (!isDragging) {
        rotationY += 0.015;
      }

      ctx.save();
      ctx.translate(cx, cy);

      const size = 80;
      const points = [
        [-size, -size, -size],
        [size, -size, -size],
        [size, size, -size],
        [-size, size, -size],
        [-size, -size, size],
        [size, -size, size],
        [size, size, size],
        [-size, size, size],
      ];

      const projected = points.map(([x, y, z]) => {
        let x1 = x * Math.cos(rotationY) - z * Math.sin(rotationY);
        let z1 = x * Math.sin(rotationY) + z * Math.cos(rotationY);
        let y2 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = y * Math.sin(rotationX) + z1 * Math.cos(rotationX);
        const distance = 400;
        const fov = distance / (distance + z2);
        return { x: x1 * fov, y: y2 * fov, z: z2 };
      });

      const drawFace = (indices: number[], color: string) => {
        ctx.beginPath();
        ctx.moveTo(projected[indices[0]].x, projected[indices[0]].y);
        for (let i = 1; i < indices.length; i++) {
          ctx.lineTo(projected[indices[i]].x, projected[indices[i]].y);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#136229";
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      drawFace([0, 1, 2, 3], "rgba(33, 164, 71, 0.9)");
      drawFace([4, 5, 6, 7], "rgba(45, 206, 90, 0.7)");
      drawFace([0, 4, 7, 3], "rgba(29, 143, 61, 0.8)");
      drawFace([1, 5, 6, 2], "rgba(52, 211, 153, 0.8)");

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🌾 SmartAgri 3D", 0, 0);

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [step]);

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      window.location.href = "/dashboard/beranda";
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => {
      const exists = prev.topics.includes(topic);
      if (exists) {
        return { ...prev, topics: prev.topics.filter((t) => t !== topic) };
      } else {
        return { ...prev, topics: [...prev.topics, topic] };
      }
    });
  };
  // --- MENCEGAH REFRESH TIDAK SENGAJA (MUNCUL POP-UP WARNING) ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Kita hanya memunculkan peringatan jika user sudah berada di Step 2 atau lebih
      if (step > 1 && step < 5) {
        e.preventDefault();
        e.returnValue = ""; // Diperlukan untuk memunculkan dialog di browser modern
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup saat komponen dibongkar (unmount)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [step]);

  // =========================================================================
  // TAMPILAN LANGKAH 1 (FLOW 1 - SPLIT SCREEN SEPERTI GAMBAR 1)
  // =========================================================================
  if (step === 1) {
    return (
      <div className="flex min-h-screen bg-[url('/bg-login.svg')] bg-cover bg-center bg-no-repeat text-[#171717]">
        {/* --- BAGIAN KIRI: Ilustrasi Grid Hijau & Teks --- */}
        <div className="relative hidden flex-1 flex-col items-center justify-center p-12 lg:flex">
          {/* Teks Sambutan */}
          <div className="z-10 mb-8 text-center">
            <h1 className="font-serif text-[32px] leading-snug text-black xl:text-[40px]">
              <span className="uppercase tracking-wide">SELAMAT DATANG DI</span>
              <br />
              <span className="font-semibold">SmartAgriXR UNEJ</span>
            </h1>
          </div>

          {/* --- CLUSTER ILUSTRASI --- */}
          {/* Container dengan ukuran fix agar susunan gambar selalu proporsional dan tidak lari-lari */}
          <div className="relative h-[450px] w-[500px]">
            {/* 1. Ilustrasi Gandum (Atas Tengah) */}
            {/* Pastikan nama file dan foldernya sudah sesuai dengan project Anda */}
            <div className="absolute left-[50%] top-0 z-10 -translate-x-1/2">
              <Image
                src="/images/landing/wheat.png"
                alt="Ilustrasi Gandum"
                width={160}
                height={160}
                className="animate-bounce object-contain"
                style={{ animationDuration: "3s" }}
              />
            </div>

            {/* 2. Ilustrasi Drone & Smart Farm (Kiri Bawah) */}
            <div className="absolute left-[5%] top-[40%] z-20">
              <Image
                src="/images/landing/drone.svg" // Ganti .png jika file aslinya png
                alt="Ilustrasi Drone"
                width={240}
                height={240}
                className="animate-bounce object-contain"
                style={{ animationDuration: "4s", animationDelay: "0.5s" }}
              />
            </div>

            {/* 3. Ilustrasi Petani (Kanan Bawah) */}
            <div className="absolute right-[15%] top-[55%] z-20">
              <Image
                src="/images/landing/farmer.png"
                alt="Ilustrasi Petani"
                width={150}
                height={150}
                className="animate-bounce object-contain"
                style={{ animationDuration: "3.5s", animationDelay: "1s" }}
              />
            </div>
          </div>
        </div>
        {/* --- BAGIAN KANAN: Form Daftar --- */}
        <div className="flex w-full flex-col justify-center bg-white px-8 py-12 shadow-2xl sm:px-16 lg:w-[500px] lg:rounded-l-[40px] xl:w-[600px] xl:px-24">
          {/* Tab Navigasi */}
          <div className="mb-12 flex justify-center gap-10">
            <Link
              href="/masuk"
              className="pb-2 font-serif text-[18px] font-semibold text-gray-400 transition-colors hover:text-gray-600"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="border-b-[3px] border-[#21a447] pb-2 font-serif text-[18px] font-bold text-[#21a447]"
            >
              Daftar
            </Link>
          </div>

          <div className="text-center mx-auto w-full max-w-sm">
            <h3 className="mb-8 font-serif text-[22px] font-bold text-black">
              Mulai Pembelajaran XR
            </h3>

            {/* Tombol Google */}
            <button
              onClick={() => handleNext()}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-3.5 transition-all hover:bg-gray-50 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-serif text-[15px] font-medium text-gray-700">
                Daftar dengan Google
              </span>
            </button>

            <div className="my-6 text-center">
              <span className="font-serif text-[14px] text-gray-500">atau</span>
            </div>

            {/* Tombol Email */}
            <button
              onClick={() => handleNext()}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-gray-200 py-3.5 transition-all hover:bg-gray-300 border border-transparent"
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
                className="text-gray-700"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="font-serif text-[15px] font-medium text-gray-700">
                Lanjutkan dengan email
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN LANGKAH 2 SAMPAI 5 (FLOW 2 - CARD POP UP DI TENGAH)
  // =========================================================================
  const cardMaxWidth = step === 2 ? "max-w-[420px]" : "max-w-[850px]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#636862] p-4 sm:p-6 lg:p-10  min-h-screen bg-[url('/bg-login.svg')] bg-cover bg-center bg-no-repeat">
      {/* --- KARTU UTAMA DENGAN BORDER EMAS & GRID BACKGROUND --- */}
      <div
        className={`relative w-full ${cardMaxWidth} transition-all duration-500 rounded-[24px] border-[4px] border-[#d8bb63] bg-white shadow-2xl`}
      >
        {/* Layer Background: Gradient hijau lembut & Grid transparan */}
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[#e8f4eb] via-white to-white opacity-80" />
        <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(to_right,#1717170a_1px,transparent_1px),linear-gradient(to_bottom,#1717170a_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Konten Dalam Kartu */}
        <div className="relative z-10 px-8 py-10 sm:px-12">
          {/* --- STEP 2: INPUT NAMA & USERNAME --- */}
          {step === 2 && (
            <div className="relative pt-12">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2">
                {/* <Image
                  src="/images/landing/visi/visi.png"
                  alt="Ilustrasi dashboard dan lahan pertanian SmartAgriXR"
                  width={800}
                  height={500}
                  className="h-auto w-full shadow-xl border-2 border-green-400 rounded-2xl object-cover"
                /> */}
                <Image
                  src="/images/auth/maskot-1.png"
                  width={180}
                  height={180}
                  alt="Mascot"
                  className="w-fit"
                />
              </div>

              <div className="mb-6">
                <p className="font-serif text-[16px] text-[#171717]">Halo,</p>
                <p className="font-serif text-[16px] text-[#171717]">
                  Siapa nama anda?
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <input
                  type="text"
                  placeholder="Aisyah Kirana"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-full border border-gray-400/50 bg-white/80 px-6 py-3 font-serif text-[15px] outline-none focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                />

                <div>
                  <label className="mb-2 block font-serif text-[15px] text-[#171717]">
                    Buat username yang keren!
                  </label>
                  <input
                    type="text"
                    placeholder="asykrn_04"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full rounded-full border border-gray-400/50 bg-white/80 px-6 py-3 font-serif text-[15px] outline-none focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 px-2">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#21a447]"
                  defaultChecked
                />
                <p className="font-serif text-[12px] leading-tight text-gray-600">
                  Saya setuju dengan{" "}
                  <span className="text-[#3b82f6] font-medium cursor-pointer">
                    Syarat dan Ketentuan
                  </span>{" "}
                  yang berlaku pada SmartAgriXR.
                </p>
              </div>

              <button
                onClick={() => handleNext()}
                className="mt-8 w-full rounded-full bg-[#1b7339] py-3.5 font-serif text-[16px] font-bold text-white shadow-md transition-all hover:bg-[#145a2b]"
              >
                Mulai
              </button>
            </div>
          )}

          {/* --- STEP 3: PILIH ROLE --- */}
          {step === 3 && (
            <div className="w-full">
              {/* Header Step 3 */}
              <div className="mb-14 flex items-center gap-4">
                <Image
                  src="/images/auth/maskot-1.png"
                  width={140}
                  height={140}
                  alt="Mascot"
                  className="h-[120px] w-[120px] object-contain drop-shadow-md"
                />
                <div>
                  <h3 className="font-serif text-[16px] font-bold text-[#171717]">
                    Langkah 3 :
                  </h3>
                  <p className="font-serif text-[15px] text-[#171717]">
                    Personalisasi Perjalanan Anda
                  </p>
                </div>
              </div>

              {/* Grid 3 Kolom Pilihan Role */}
              {/* Ditambahkan margin-top agar maskot yang melayang tidak menabrak teks di atasnya */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  {
                    id: "Mahasiswa",
                    title: "Saya Mahasiswa",
                    desc: "Jelajahi Proyek Seru dan Mulai Berkreasi",
                    img: "/images/auth/maskot-2.png",
                  },
                  {
                    id: "Dosen",
                    title: "Saya Dosen",
                    desc: "Dapatkan Template Pembelajaran dan Buat Kelas",
                    img: "/images/auth/maskot-3.png",
                  },
                  {
                    id: "Umum",
                    title: "Umum",
                    desc: "Explore Proyek 3D anda",
                    img: "/images/auth/maskot-4.png",
                  },
                ].map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`relative cursor-pointer rounded-2xl border ${formData.role === role.id ? "border-[#21a447] shadow-lg ring-1 ring-[#21a447]" : "border-gray-200"} bg-white p-6 pt-16 text-center transition-all hover:-translate-y-1 hover:shadow-md`}
                  >
                    {/* Posisi absolut diperbesar (-top-[75px]) agar maskot lebih pop-out ke atas */}
                    <div className="absolute -top-[75px] left-1/2 -translate-x-1/2">
                      <img
                        src={role.img}
                        alt={role.title}
                        // Dihilangkan bg-gray-200 & rounded-full, diganti ukuran & drop-shadow
                        className="h-[130px] w-[130px] object-contain drop-shadow-xl"
                      />
                    </div>
                    <h4 className="font-serif text-[16px] font-bold text-[#171717]">
                      {role.title}
                    </h4>
                    <p className="mt-2 font-serif text-[13px] text-gray-500 leading-snug">
                      {role.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tombol Selanjutnya */}
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => handleNext()}
                  className="w-full max-w-[400px] rounded-full bg-[#1b7339] py-3.5 font-serif text-[16px] font-bold text-white shadow-md transition-all hover:bg-[#145a2b]"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 4: PILIH MATA KULIAH/TOPIK --- */}
          {step === 4 && (
            <div className="w-full">
              <div className="mb-10 flex items-center gap-4">
                <Image
                  width={64}
                  height={64}
                  src="/images/auth/maskot-1.png"
                  alt="Mascot Mini"
                  className="w-20"
                />
                <div>
                  <h3 className="font-serif text-[16px] font-bold text-[#171717]">
                    Langkah 4 :
                  </h3>
                  <p className="font-serif text-[15px] text-[#171717]">
                    Personalisasi Perjalanan Anda
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <div className="flex flex-col justify-center">
                  <p className="font-serif text-[18px] text-[#171717] mb-8 leading-snug">
                    Mata kuliah atau topik apa yang paling menarik bagi anda?
                    <br />
                    Pilih Mata Kuliah favorit anda!
                  </p>
                  <button
                    onClick={() => handleNext()}
                    className="w-[180px] rounded-full bg-[#1b7339] py-3.5 font-serif text-[16px] font-bold text-white shadow-md transition-all hover:bg-[#145a2b]"
                  >
                    Ayo Mulai!
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    "Budidaya Tanaman Modern",
                    "Smart Farming (IoT)",
                    "Rantai Pasok Agroindustri",
                    "Perencanaan dan Pengelolaan",
                    "Mekanisasi Pertanian",
                  ].map((topic) => {
                    const isSelected = formData.topics.includes(topic);
                    return (
                      <div
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`flex cursor-pointer items-center gap-4 rounded-full px-5 py-3.5 transition-all ${
                          isSelected
                            ? "bg-[#1b7339] text-white shadow-md"
                            : "bg-[#e5e7eb]/80 text-[#171717] hover:bg-gray-300"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isSelected ? "border-white bg-transparent" : "border-gray-400 bg-white"}`}
                        >
                          {isSelected && (
                            <div className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-serif text-[15px] font-medium">
                          {topic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 5: SIMULASI KUBUS 3D --- */}
          {step === 5 && (
            <div className="text-center">
              <span className="font-serif text-[13px] font-bold uppercase tracking-widest text-[#21a447]">
                LANGKAH TERAKHIR ✨
              </span>
              <h3 className="mb-2 mt-2 font-serif text-[24px] font-bold text-black">
                Simulasi Kotak 3D Interaktif
              </h3>
              <p className="mb-8 font-serif text-[14px] text-gray-500">
                Klik dan geser (*drag*) dengan mouse pada area kotak di bawah
                untuk memutar posisinya ke berbagai arah secara *real-time*!
              </p>

              <div className="relative mx-auto mb-8 flex w-full max-w-lg items-center justify-center overflow-hidden rounded-2xl border border-[#21a447]/30 bg-white p-4 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={220}
                  className="cursor-grab rounded-xl active:cursor-grabbing"
                />
              </div>

              <button
                onClick={() => handleNext()}
                className="w-full max-w-[400px] rounded-full bg-[#1b7339] py-3.5 font-serif text-[16px] font-bold text-white shadow-xl transition-all hover:bg-[#145a2b]"
              >
                Ayo Mulai ke Beranda! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
