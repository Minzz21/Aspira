"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, value, onChange, debounceMs = 300 }) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle local change and debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value, debounceMs]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        <FontAwesomeIcon icon={faSearch} />
      </div>
      <input
        type="text"
        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full pl-10 p-2.5 shadow-sm transition-colors"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
