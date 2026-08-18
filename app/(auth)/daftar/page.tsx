"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Daftar() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    avatar: "🌱",
    role: "Mahasiswa",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        return {
          x: x1 * fov,
          y: y2 * fov,
          z: z2,
        };
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/bg-login.svg')] bg-cover bg-center bg-no-repeat p-4 text-[#171717] sm:p-6 lg:p-10">
      <div className="w-full max-w-[850px] rounded-[32px] bg-white/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-12 lg:p-16">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
          <div>
            <span className="font-serif text-[12px] font-bold uppercase tracking-widest text-[#21a447]">
              Pendaftaran Akun • Langkah {step} dari 5
            </span>
            <h2 className="font-serif text-[22px] font-bold text-black sm:text-[26px]">
              SmartAgriXR UNEJ
            </h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i <= step ? "w-10 bg-[#21a447]" : "w-4 bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
        </div>

        <div className="py-2">
          {step === 1 && (
            <div>
              <div className="mb-8 flex justify-center gap-12">
                <Link
                  href="/masuk"
                  className="pb-2 font-serif text-[22px] font-semibold text-gray-400 hover:text-gray-600"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="border-b-[3px] border-[#21a447] pb-2 font-serif text-[22px] font-bold text-[#21a447]"
                >
                  Daftar
                </Link>
              </div>

              <div className="mx-auto max-w-md flex flex-col items-center">
                <h3 className="mb-6 text-center font-serif text-[24px] font-bold text-black">
                  Mulai Pembelajaran XR
                </h3>

                <button
                  onClick={() => handleNext()}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-4 transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
                  <span className="font-serif text-[16px] text-black">
                    Daftar dengan Google
                  </span>
                </button>

                <div className="my-6 text-center">
                  <span className="font-serif text-[16px] text-gray-500">
                    atau
                  </span>
                </div>

                <button
                  onClick={() => handleNext()}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-gray-100 py-4 transition-all hover:bg-gray-200"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                  </svg>
                  <span className="font-serif text-[16px] text-black">
                    Lanjutkan dengan email
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-lg">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#21a447]/10 text-3xl">
                  🌱
                </div>
                <h3 className="font-serif text-[24px] font-bold text-black">
                  Halo 👋 Siapa nama Anda?
                </h3>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block font-serif text-[15px] text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama Anda..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-5 py-4 font-serif text-[16px] outline-none focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-serif text-[15px] text-gray-700">
                    Username Keren 🚀
                  </label>
                  <input
                    type="text"
                    placeholder="Pilih username unik..."
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-5 py-4 font-serif text-[16px] outline-none focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  />
                </div>
              </div>

              <button
                onClick={() => handleNext()}
                className="mt-8 w-full rounded-full bg-[#21a447] py-4 font-serif text-[16px] font-bold text-white shadow-lg transition-all hover:bg-[#198b3a]"
              >
                Mulai Sekarang
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#21a447]/20 bg-[#fdf6e3] text-5xl shadow-inner">
                {formData.avatar}
              </div>
              <h3 className="font-serif text-[22px] font-bold text-black">
                Halo, {formData.name || "Sobat Tani"} 👋
              </h3>
              <p className="mb-8 font-serif text-[15px] text-gray-500">
                Pilih avatar representatif kesukaanmu!
              </p>

              <div className="mb-10 flex justify-center gap-4">
                {["🌱", "🚜", "🌾", "👨‍🌾", "💧", "🌽"].map((av, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFormData({ ...formData, avatar: av })}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl transition-all ${formData.avatar === av ? "border-[#21a447] bg-[#f0f9f2] scale-110 shadow-md" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleNext()}
                className="w-full rounded-full bg-[#21a447] py-4 font-serif text-[16px] font-bold text-white shadow-lg transition-all hover:bg-[#198b3a]"
              >
                Berikutnya
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-2 font-serif text-[24px] font-bold text-black text-center">
                Personalisasi Perjalanan Anda 🎨
              </h3>
              <p className="mb-8 font-serif text-[15px] text-gray-500 text-center">
                Apa peran utama Anda di platform ini?
              </p>

              <div className="mb-8 flex flex-col gap-4">
                {[
                  {
                    title: "Mahasiswa / Siswa",
                    desc: "Jelajahi modul 3D & AR interaktif.",
                  },
                  {
                    title: "Pendidik / Dosen",
                    desc: "Akses kit pembelajaran dan materi kelas.",
                  },
                  {
                    title: "Peneliti / Inovator",
                    desc: "Simulasi riset agrikultur presisi.",
                  },
                ].map((role, idx) => (
                  <label
                    key={idx}
                    onClick={() =>
                      setFormData({ ...formData, role: role.title })
                    }
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition-all ${formData.role === role.title ? "border-[#21a447] bg-[#f0f9f2] shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div>
                      <p className="font-serif text-[16px] font-bold text-black">
                        {role.title}
                      </p>
                      <p className="font-serif text-[14px] text-gray-500">
                        {role.desc}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === role.title}
                      onChange={() => {}}
                      className="h-5 w-5 accent-[#21a447]"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleNext()}
                className="w-full rounded-full bg-[#21a447] py-4 font-serif text-[16px] font-bold text-white shadow-lg transition-all hover:bg-[#198b3a]"
              >
                Berikutnya
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mx-auto max-w-lg text-center">
              <span className="font-serif text-[13px] font-bold uppercase tracking-widest text-[#21a447]">
                LANGKAH TERAKHIR ✨
              </span>
              <h3 className="mb-2 font-serif text-[24px] font-bold text-black">
                Simulasi Kotak 3D Interaktif
              </h3>
              <p className="mb-6 font-serif text-[14px] text-gray-500">
                Klik dan geser (*drag*) dengan mouse pada area kotak di bawah
                untuk memutar posisinya ke berbagai arah secara *real-time*!
              </p>

              <div className="relative mb-8 flex items-center justify-center overflow-hidden rounded-2xl border border-[#21a447]/30 bg-gradient-to-tr from-[#eaf6ed] to-[#f4fbf5] p-4 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={220}
                  className="cursor-grab rounded-xl active:cursor-grabbing"
                />
              </div>

              <button
                onClick={() => handleNext()}
                className="w-full rounded-full bg-[#21a447] py-4 font-serif text-[16px] font-bold text-white shadow-xl transition-all hover:bg-[#198b3a] hover:scale-[1.01]"
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
