import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartAgriXR UNEJ - Platform Interaktif 3D & XR",
  description: "Platform Transformasi Edukasi Pertanian Interaktif dengan teknologi 3D & XR yang Cerdas dan Menyenangkan",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-zinc-800">{children}</body>
    </html>
  );
}

