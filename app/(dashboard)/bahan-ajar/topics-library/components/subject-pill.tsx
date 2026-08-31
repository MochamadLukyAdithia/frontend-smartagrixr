import type { Subject } from "../data";

export function SubjectPill({ name, icon }: Subject) {
  return (
    <button className="flex min-w-[200px] flex-shrink-0 items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-[0_5px_15px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1 hover:border-[#21a447]/30 hover:shadow-[0_10px_20px_rgba(33,164,71,0.1)] focus:outline-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f9f2] text-[24px] font-bold text-[#21a447]">
        {icon}
      </div>
      <span className="font-serif text-[16px] font-semibold text-[#171717]">
        {name}
      </span>
    </button>
  );
}