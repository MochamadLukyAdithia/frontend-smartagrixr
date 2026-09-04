import Link from "next/link";
import type { KelasItem } from "../data";

export function ClassCard({ item }: { item: KelasItem }) {
  return (
    // NOTE: arahkan ke halaman detail kelas kamu sendiri, sesuaikan path-nya
    // kalau struktur route detail kelas berbeda (mis. /kelas/[id]).
    <Link href={`/kelas/${item.id}`}>
      <div
        style={{ backgroundColor: item.color }}
        className="group relative flex h-[230px] w-full flex-col justify-end overflow-hidden rounded-3xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1"
      >
        {item.decorated && <DecorativePattern />}
        <h3 className="relative z-10 font-serif text-[22px] font-bold leading-snug text-white">
          {item.name}
        </h3>
      </div>
    </Link>
  );
}

function DecorativePattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 400 260"
      fill="none"
    >
      <g stroke="white" strokeWidth="2">
        {/* pensil */}
        <path d="M55 55l110 24-7 26-110-24z" />
        {/* buku */}
        <rect x="250" y="130" width="46" height="34" rx="4" />
        {/* pin */}
        <path d="M300 40l14 14-14 14-14-14z" />
        <circle cx="70" cy="170" r="4" fill="white" stroke="none" />
        <circle cx="90" cy="150" r="2.5" fill="white" stroke="none" />
        <circle cx="55" cy="140" r="2" fill="white" stroke="none" />
      </g>
      <text x="185" y="120" fontSize="46" fontFamily="serif" fill="white">
        ?
      </text>
    </svg>
  );
}