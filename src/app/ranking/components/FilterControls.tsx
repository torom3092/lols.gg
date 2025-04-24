interface FilterControlsProps {
  selectedPosition: string;
  onPositionChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

export default function FilterControls({
  selectedPosition,
  onPositionChange,
  selectedMonth,
  onMonthChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <select
        value={selectedPosition}
        onChange={(e) => onPositionChange(e.target.value)}
        className="px-3 py-2 bg-white/10 text-white rounded text-sm"
      >
        <option value="전체라인" className="text-black">
          전체라인
        </option>
        <option value="탑" className="text-black">
          탑
        </option>
        <option value="정글" className="text-black">
          정글
        </option>
        <option value="미드" className="text-black">
          미드
        </option>
        <option value="원딜" className="text-black">
          원딜
        </option>
        <option value="서폿" className="text-black">
          서폿
        </option>
      </select>

      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="px-3 py-2 bg-white/10 text-white rounded text-sm"
      >
        <option className="text-black" value="전체">
          전체
        </option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <option className="text-black" key={month} value={String(month)}>
            {month}월
          </option>
        ))}
      </select>
    </div>
  );
}
