import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  id: string;
  name: string;
}

interface SearchableComboboxProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
  label?: string;
  required?: boolean;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchableCombobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

<<<<<<< HEAD
  // Safely sanitize the incoming options list to prevent any runtime property crashes
  const safeOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.filter((o): o is Option => !!o && typeof o.id === 'string' && typeof o.name === 'string');
  }, [options]);

  // Synchronize internal input text with external value selection (e.g. from state change)
  useEffect(() => {
    const selectedOption = safeOptions.find((o) => o.id === value);
=======
  // Synchronize internal input text with external value selection (e.g. from state change)
  useEffect(() => {
    const selectedOption = options.find((o) => o.id === value);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    if (selectedOption) {
      setInputValue(selectedOption.name);
    } else {
      setInputValue('');
    }
<<<<<<< HEAD
  }, [value, safeOptions]);
=======
  }, [value, options]);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

  // Handle clicking outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset input to matching selected value if they blur without selecting
<<<<<<< HEAD
        const selectedOption = safeOptions.find((o) => o.id === value);
=======
        const selectedOption = options.find((o) => o.id === value);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
        setInputValue(selectedOption ? selectedOption.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
<<<<<<< HEAD
  }, [value, safeOptions]);
=======
  }, [value, options]);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

  // Debounce input value for search performance (120ms for slick responsiveness)
  const debouncedSearchTerm = useDebounce(inputValue, 120);

  // We perform search filtering after the debounce state updates
  // Support matching from the beginning and middle, match case-insensitively
  const filteredOptions = useMemo(() => {
    // If input is exactly matching the selected option's name, show full list on dropdown focus
<<<<<<< HEAD
    const selectedOption = safeOptions.find((o) => o.id === value);
    if (selectedOption && inputValue === selectedOption.name && !isOpen) {
      return safeOptions.slice(0, 10);
    }

    if (!inputValue.trim()) {
      return safeOptions.slice(0, 10);
=======
    const selectedOption = options.find((o) => o.id === value);
    if (selectedOption && inputValue === selectedOption.name && !isOpen) {
      return options.slice(0, 10);
    }

    if (!inputValue.trim()) {
      return options.slice(0, 10);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    }

    const term = inputValue.toLowerCase().trim();
    // Search both beginning and middle of destination names
<<<<<<< HEAD
    const matched = safeOptions.filter((o) => o.name.toLowerCase().includes(term));
=======
    const matched = options.filter((o) => o.name.toLowerCase().includes(term));
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    
    // Sort so that options starting with the search term appear first, then contains
    const sorted = [...matched].sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(term);
      const bStarts = b.name.toLowerCase().startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, 10);
<<<<<<< HEAD
  }, [inputValue, safeOptions, value, isOpen]);
=======
  }, [inputValue, options, value, isOpen]);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

  // Keep highlighted index within bounds of filtered items
  useEffect(() => {
    if (filteredOptions.length === 0) {
<<<<<<< HEAD
      if (highlightedIndex !== -1) {
        setHighlightedIndex(-1);
      }
    } else if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(filteredOptions.length - 1);
    }
  }, [filteredOptions.length, highlightedIndex]);
=======
      setHighlightedIndex(-1);
    } else if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(filteredOptions.length - 1);
    }
  }, [filteredOptions, highlightedIndex]);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

  // Highlight matching characters elegantly
  const highlightMatches = (text: string, search: string) => {
    if (!search.trim()) return <span className="font-bold">{text}</span>;
    
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span className="font-bold">
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === search.toLowerCase().trim();
          return isMatch ? (
            <span key={i} className="bg-sky-500/20 text-sky-500 dark:text-sky-400 px-0.5 rounded-sm font-black">
              {part}
            </span>
          ) : (
            <span key={i} className="font-medium text-slate-800 dark:text-slate-100">
              {part}
            </span>
          );
        })}
      </span>
    );
  };

  const selectOption = (option: Option) => {
    onChange(option.id);
    setInputValue(option.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          selectOption(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length > 0) {
          selectOption(filteredOptions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        // Safe selection first if they tab away
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  // Helper to clear the input
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputValue('');
    setIsOpen(true);
  };

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {label && (
        <label className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1.5 block select-none font-sans">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          type="text"
          value={inputValue}
          required={required && !value}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750/70 rounded-xl py-3 pl-10 pr-10 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all cursor-text shadow-xs"
        />
        
        {/* Search Left Icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

        {/* Action Right Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Styled Autocomplete Suggestions Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            ref={dropdownRef}
            className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
            id={`${id}-dropdown`}
          >
            {filteredOptions.length > 0 ? (
              <div className="py-1.5 p-1 space-y-0.5">
                {filteredOptions.map((option, idx) => {
                  const isSelected = value === option.id;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectOption(option)}
                      // On touch screens we use onMouseDown to guarantee immediate response
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevents blurring state reset
                        selectOption(option);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-xs flex items-center justify-between transition-colors cursor-pointer outline-hidden select-none ${
                        isHighlighted 
                          ? 'bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-white' 
                          : isSelected 
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-extrabold text-xs">
                          {highlightMatches(option.name, inputValue)}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 block">
                No matching destinations found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
