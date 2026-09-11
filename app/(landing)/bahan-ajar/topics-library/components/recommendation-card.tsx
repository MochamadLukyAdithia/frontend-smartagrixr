import Image from "next/image";
import Link from "next/link";
import type { Recommendation } from "../data";
import { extractCanvaEmbedSrc } from "@/lib/canva";

type Props = {
  item: Recommendation;
  onClick?: (item: Recommendation) => void;
};

export function RecommendationCard({ item, onClick }: Props) {
  const embedSrc = item.embedUrl ? extractCanvaEmbedSrc(item.embedUrl) : null;

  const cardContent = (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
      {/* Thumbnail / Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {embedSrc ? (
          // Preview embed Canva — non-interaktif, cuma buat pratinjau visual
          <iframe
            src={embedSrc}
            title={item.title}
            loading="lazy"
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-sm font-serif text-gray-400">
            Thumbnail Materi
          </div>
        )}
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
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(item)}
        className="block h-full w-full text-left"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={`/bahan-ajar/topics-library/${item.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}