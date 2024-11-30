import { useState, useCallback, useRef, useEffect } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#D0021B', '#F5A623',
  '#F8E71C', '#8B572A', '#7ED321', '#417505',
  '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2'
];

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    setCurrentColor(newColor);
    onChange(newColor);
  }, [onChange]);

  return (
    <div className="relative" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-10 rounded-lg border border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 relative overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: currentColor }}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Color Input */}
            <div className="mb-4">
              <input
                type="text"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="#000000"
              />
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                  className={`w-6 h-6 rounded-md border-2 ${
                    currentColor === presetColor ? 'border-gray-900' : 'border-transparent'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>

            {/* Color Input Type */}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="mt-4 w-full h-10"
            />
          </div>
        )}
      </div>
    </div>
  );
}