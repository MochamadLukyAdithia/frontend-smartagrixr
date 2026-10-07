import type { LucideIcon } from "lucide-react";

type Props = {
  name: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
};

export function SubjectPill({ name, icon: Icon, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-colors ${
        isActive
          ? "border-[#21a447] bg-[#21a447]/10 text-[#21a447]"
          : "border-gray-100 bg-white text-[#171717] hover:border-gray-200"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      <span className="font-serif text-[14px] font-medium">{name}</span>
    </button>
  );
}