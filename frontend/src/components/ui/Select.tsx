import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
          className
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50",
                  option.value === value ? "text-primary-700 font-bold bg-primary-50/50" : "text-gray-700"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check size={16} className="text-primary-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
