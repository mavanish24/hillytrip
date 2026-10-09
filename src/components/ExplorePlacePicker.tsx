import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Navigation, X, ChevronDown, Check, Mountain, Train, Plane, Car, Compass, Home } from 'lucide-react';
import { Destination, Attraction, Hub, Homestay } from '../types';
import { suggestPlaces, SuggestedPlace } from '../utils/placeSuggestions';

export interface ExplorePlacePickerProps {
  label: 'FROM' | 'TO';
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  destinations?: Destination[];
  attractions?: Attraction[];
  hubs?: Hub[];
  homestays?: Homestay[];
  hasError?: boolean;
  errorMessage?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  excludePlace?: string;
}

export const ExplorePlacePicker: React.FC<ExplorePlacePickerProps> = ({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  destinations = [],
  attractions = [],
  hubs = [],
  homestays = [],
  hasError = false,
  errorMessage,
  ariaLabel,
  autoFocus = false,
  excludePlace
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync internal input value with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Compute suggestions based on query, data sources, mode, and exclusion
  const suggestions = useMemo(() => {
    return suggestPlaces(inputValue, homestays, destinations, 9, {
      mode: label,
      excludePlace
    });
  }, [inputValue, homestays, destinations, label, excludePlace]);

  // Close dropdown on click or touch outside
  useEffect(() => {
    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handlePointerOutside);
    document.addEventListener('touchstart', handlePointerOutside);
    return () => {
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
    };
  }, []);

  // Scroll highlighted item into view if navigating with keyboard
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      const targetItem = items[highlightedIndex];
      if (targetItem) {
        targetItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelectPlace = useCallback((placeName: string) => {
    setInputValue(placeName);
    onChange(placeName);
    if (onSelect) onSelect(placeName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange, onSelect]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange('');
    setHighlightedIndex(-1);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectPlace(suggestions[highlightedIndex].name);
      } else if (suggestions.length > 0) {
        handleSelectPlace(suggestions[0].name);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const getBadgeIcon = (badge?: string) => {
    if (!badge) return <MapPin className="w-3.5 h-3.5" />;
    if (badge.includes('Airport')) return <Plane className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />;
    if (badge.includes('Railway')) return <Train className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
    if (badge.includes('Transport') || badge.includes('Taxi')) return <Car className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />;
    if (badge.includes('Town') || badge.includes('Mountain')) return <Mountain className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
    if (badge.includes('Scenic') || badge.includes('Viewpoint')) return <Compass className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />;
    if (badge.includes('Village')) return <Home className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />;
    return <MapPin className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />;
  };

  const isFrom = label === 'FROM';
  const hasTypedQuery = Boolean(inputValue.trim());

  return (
    <div ref={containerRef} className="relative space-y-1 w-full">
      <div className="flex items-center justify-between">
        <label 
          htmlFor={`place-input-${label.toLowerCase()}`}
          className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block"
        >
          {label}
        </label>
        {value ? (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium hidden sm:inline">
            ✓ Location selected
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            {isFrom ? 'Select pickup' : 'Select destination'}
          </span>
        )}
      </div>

      {/* Input Shell */}
      <div
        className={`relative flex items-center min-h-[48px] bg-slate-50 dark:bg-slate-800/80 border rounded-2xl px-3 transition-colors ${
          hasError
            ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-400/30'
            : isOpen
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:ring-emerald-400/20 bg-white dark:bg-slate-900'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        {/* Leading Icon */}
        <div className="shrink-0 mr-2.5 flex items-center justify-center">
          {isFrom ? (
            <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Navigation className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          id={`place-input-${label.toLowerCase()}`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder || (isFrom ? 'e.g. NJP, Bagdogra, Siliguri, Gangtok' : 'e.g. Darjeeling, Kalimpong, Sandakphu, Pelling')}
          aria-label={ariaLabel || `${label} Location`}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`place-listbox-${label.toLowerCase()}`}
          role="combobox"
          autoComplete="off"
          className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer mr-1 shrink-0"
            title="Clear location"
            aria-label="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown Toggle indicator */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer shrink-0"
          aria-label="Toggle places list"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Validation error message */}
      {hasError && errorMessage && (
        <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1 pt-0.5 animate-fadeIn">
          {errorMessage}
        </p>
      )}

      {/* Autocomplete Dropdown Listbox */}
      {isOpen && (
        <div 
          className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-fadeIn ring-1 ring-black/5 dark:ring-white/10"
        >
          {/* Header indicator */}
          <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>
              {hasTypedQuery ? 'Matching Mountain Places' : isFrom ? 'Popular Starting Points' : 'Popular Destinations'}
            </span>
            <span>{suggestions.length} available</span>
          </div>

          {suggestions.length > 0 ? (
            <ul
              ref={listboxRef}
              id={`place-listbox-${label.toLowerCase()}`}
              role="listbox"
              className="py-1 divide-y divide-slate-100 dark:divide-slate-800/60"
            >
              {suggestions.map((place, idx) => {
                const isSelected = value.toLowerCase().trim() === place.name.toLowerCase().trim();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={place.id || `${place.name}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelectPlace(place.name)}
                    className={`min-h-[48px] px-3.5 py-2.5 sm:py-3 flex items-center justify-between gap-3 cursor-pointer transition select-none active:bg-emerald-50 dark:active:bg-emerald-950/40 ${
                      isHighlighted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                        : isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white border-l-2 border-emerald-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isHighlighted
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {getBadgeIcon(place.categoryBadge)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {place.name}
                          </span>
                          {place.categoryBadge && (
                            <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                              {place.categoryBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {place.district}{place.state ? `, ${place.state}` : ''}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No matching mountain places found
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                Try searching for a town (e.g. Gangtok, Darjeeling, Pelling), hub (NJP, Bagdogra), or peak (Sandakphu).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePlacePicker;
