import Link from "next/link";
import type { Recommendation } from "../data";

export function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <Link href={`/bahan-ajar/topics-library/${item.id}`}>
      <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-sm font-serif text-gray-400">
            Thumbnail Materi
          </div>
          {/* Ganti placeholder di atas dengan gambar asli:
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          */}
        </div>

        {/* Konten teks bawah */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-[#171717] group-hover:text-[#21a447]">
            {item.title}
          </h3>

          <div className="mt-4 flex justify-end">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1da1f2]/10 text-[13px] font-bold text-[#1da1f2]">
              {item.grade}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}