type Props = {
  grade: string;
  isActive?: boolean;
  onClick?: () => void;
};

export function GradeChip({ grade, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-full border px-4 py-2 font-serif text-[13px] font-semibold transition-colors ${
        isActive
          ? "border-[#1da1f2] bg-[#1da1f2]/10 text-[#1da1f2]"
          : "border-gray-100 bg-white text-[#171717] hover:border-gray-200"
      }`}
    >
      {grade}
    </button>
  );
}