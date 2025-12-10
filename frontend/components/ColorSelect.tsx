import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ColorSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const colorOptions = [
  { value: 'マークなし', color: 'bg-gray-100', textColor: 'text-gray-700', label: 'マークなし', hex: '' },
  { value: 'ピンク', color: 'bg-pink-500', textColor: 'text-white', label: 'ピンク', hex: '#ec4899' },
  { value: 'グリーン', color: 'bg-green-500', textColor: 'text-white', label: 'グリーン', hex: '#22c55e' },
  { value: 'ブルー', color: 'bg-blue-500', textColor: 'text-white', label: 'ブルー', hex: '#3b82f6' },
  { value: 'イエロー', color: 'bg-yellow-400', textColor: 'text-black', label: 'イエロー', hex: '#facc15' },
  { value: 'パープル', color: 'bg-purple-600', textColor: 'text-white', label: 'パープル', hex: '#9333ea' },
  { value: 'オレンジ', color: 'bg-orange-500', textColor: 'text-white', label: 'オレンジ', hex: '#f97316' },
  { value: 'ネオンブルー', color: 'bg-cyan-400', textColor: 'text-black', label: 'ネオンブルー', hex: '#22d3ee' },
  { value: 'イエローグリーン', color: 'bg-lime-400', textColor: 'text-black', label: 'イエローグリーン', hex: '#a3e635' },
  { value: 'レッド', color: 'bg-red-600', textColor: 'text-white', label: 'レッド', hex: '#dc2626' },
  { value: 'グレー', color: 'bg-gray-400', textColor: 'text-white', label: 'グレー', hex: '#9ca3af' },
];

// Export function to convert color name to hex code
export function getColorHex(colorName: string): string {
  const option = colorOptions.find(opt => opt.value === colorName);
  return option?.hex || '';
}

export function ColorSelect({ value, onValueChange, id, className, disabled }: ColorSelectProps) {
  const selectedOption = colorOptions.find(opt => opt.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className} disabled={disabled}>
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${selectedOption.color} border border-gray-300`}></div>
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {colorOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <div className={`w-full h-6 rounded ${option.color} border border-gray-200 px-2 flex items-center justify-center ${option.textColor} min-w-[120px]`}>
                {option.label}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}