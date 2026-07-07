import React from 'react';

interface FilterChipsProps {
  options: { value: string; label: string }[];
  activeValue: string;
  onChange: (value: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ options, activeValue, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;
