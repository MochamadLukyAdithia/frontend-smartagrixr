type Props = {
  grade: string;
};

export function GradeChip({ grade }: Props) {
  return (
    <button className="flex flex-shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm transition-colors hover:border-[#21a447] hover:bg-[#f0f9f2] hover:text-[#21a447]">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
        {grade.charAt(0)}
      </div>
      <span className="font-serif text-[15px] font-medium text-[#4a4a4a]">
        {grade}
      </span>
    </button>
  );
}