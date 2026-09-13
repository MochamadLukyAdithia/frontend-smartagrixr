import type { Subject } from "../data";

type Props = {
  name: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
};

export function SubjectPill({ name, icon, isActive, onClick }: Props) {
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
      <span>{icon}</span>
      <span className="font-serif text-[14px] font-medium">{name}</span>
    </button>
  );
}