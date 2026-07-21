import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Check, ChevronDown, Clock, Sparkles, AlertCircle, X } from 'lucide-react';

// Accent insensitive / Normalize helper
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Fuzzy matching score helper (simple Levenshtein or subsequence matching)
function isFuzzyMatch(query: string, target: string): boolean {
  const q = normalizeText(query);
  const t = normalizeText(target);
  
  if (t.includes(q)) return true;
  
  // Character subsequence check for minor typing mistakes
  let queryIdx = 0;
  for (let charIdx = 0; charIdx < t.length && queryIdx < q.length; charIdx++) {
    if (t[charIdx] === q[queryIdx]) {
      queryIdx++;
    }
  }
  return queryIdx === q.length;
}

// Accent-insensitive text highlighter
function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const normText = normalizeText(text);
  const normHighlight = normalizeText(highlight);
  const index = normText.indexOf(normHighlight);
  
  if (index === -1) return <span>{text}</span>;
  
  const originalHighlight = text.substring(index, index + highlight.length);
  const before = text.substring(0, index);
  const after = text.substring(index + highlight.length);
  
  return (
    <span>
      {before}
      <mark className="bg-amber-100 text-slate-900 font-bold px-0.5 rounded">{originalHighlight}</mark>
      {after}
    </span>
  );
}

export interface AutocompleteSelectProps {
  value: string;
  onChange: (e: { target: { name?: string; value: string } }) => void;
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  entityType?: 'destination' | 'attraction' | 'homestay' | 'route' | 'taxi_stand' | 'village' | 'any';
}

// Global cache for API suggestions
const apiCache: Record<string, any[]> = {};

export function AutocompleteSelect({
  value,
  onChange,
  children,
  placeholder = 'Search & select...',
  className = '',
  id,
  name,
  disabled = false,
  required = false,
  entityType
}: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [apiSuggestions, setApiSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse static option children recursively to handle optgroups and nests
  const staticOptions = useMemo(() => {
    const list: { value: string; label: string; disabled: boolean; context?: string }[] = [];
    const parse = (nodes: React.ReactNode) => {
      React.Children.forEach(nodes, (child) => {
        if (!child) return;
        if (React.isValidElement(child)) {
          const anyChild = child as any;
          if (anyChild.type === 'option') {
            list.push({
              value: String(anyChild.props.value ?? ''),
              label: anyChild.props.children ? String(anyChild.props.children) : '',
              disabled: !!anyChild.props.disabled,
            });
          } else if (anyChild.type === 'optgroup' || anyChild.props.children) {
            parse(anyChild.props.children);
          }
        }
      });
    };
    parse(children);
    return list;
  }, [children]);

  // Infer entity type if not explicitly supplied
  const inferredEntityType = useMemo(() => {
    if (entityType) return entityType;
    const lowerId = String(id || '').toLowerCase();
    const lowerName = String(name || '').toLowerCase();
    const lowerPlaceholder = String(placeholder || '').toLowerCase();

    if (lowerId.includes('dest') || lowerName.includes('dest') || lowerPlaceholder.includes('dest')) return 'destination';
    if (lowerId.includes('attr') || lowerName.includes('attr') || lowerPlaceholder.includes('attr')) return 'attraction';
    if (lowerId.includes('home') || lowerName.includes('home') || lowerPlaceholder.includes('home')) return 'homestay';
    if (lowerId.includes('route') || lowerName.includes('route') || lowerPlaceholder.includes('route')) return 'route';
    if (lowerId.includes('taxi') || lowerName.includes('taxi') || lowerPlaceholder.includes('taxi')) return 'taxi_stand';
    if (lowerId.includes('hub') || lowerId.includes('vill') || lowerName.includes('hub') || lowerName.includes('vill')) return 'village';
    return 'any';
  }, [entityType, id, name, placeholder]);

  // Load dynamic suggestions from Supabase API endpoints
  useEffect(() => {
    if (inferredEntityType === 'any') return;

    let isMounted = true;
    const cacheKey = inferredEntityType;

    if (apiCache[cacheKey]) {
      setApiSuggestions(apiCache[cacheKey]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        let endpoint = '';
        if (inferredEntityType === 'destination') endpoint = '/api/destinations';
        else if (inferredEntityType === 'attraction') endpoint = '/api/attractions';
        else if (inferredEntityType === 'homestay') endpoint = '/api/homestays';
        else if (inferredEntityType === 'route') endpoint = '/api/routes';
        else if (inferredEntityType === 'taxi_stand') endpoint = '/api/taxi-stands';
        else if (inferredEntityType === 'village') endpoint = '/api/hubs';

        if (!endpoint) return;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        let formattedList: any[] = [];
        if (inferredEntityType === 'destination') {
          const list = data.destinations || data || [];
          formattedList = list.map((d: any) => ({
            value: d.id,
            label: d.name,
            context: `${d.district || 'Sikkim'} • ${d.state || 'India'}`
          }));
        } else if (inferredEntityType === 'attraction') {
          const list = data.attractions || data || [];
          formattedList = list.map((a: any) => ({
            value: a.id,
            label: a.name,
            context: `${a.category || 'Sightseeing'} • Destination: ${a.destinationId || ''}`
          }));
        } else if (inferredEntityType === 'homestay') {
          const list = data.homestays || data || [];
          formattedList = list.map((h: any) => ({
            value: h.id,
            label: h.name,
            context: `Homestay • ${h.destinationId || ''}`
          }));
        } else if (inferredEntityType === 'route') {
          const list = data.routes || data || [];
          formattedList = list.map((r: any) => ({
            value: r.id,
            label: `${r.fromHubId || ''} to ${r.toHubId || ''}`,
            context: `${r.type || 'Direct'} Route • ₹${r.fareMin || ''}-₹${r.fareMax || ''}`
          }));
        } else if (inferredEntityType === 'taxi_stand') {
          const list = data.taxiStands || data || [];
          formattedList = list.map((t: any) => ({
            value: t.id || t.name,
            label: t.name,
            context: `Taxi Stand`
          }));
        } else if (inferredEntityType === 'village') {
          const list = data.hubs || data || [];
          formattedList = list.map((h: any) => ({
            value: h.id,
            label: h.name,
            context: `${h.district || ''} District`
          }));
        }

        if (isMounted) {
          apiCache[cacheKey] = formattedList;
          setApiSuggestions(formattedList);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed for', inferredEntityType, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      isMounted = false;
    };
  }, [inferredEntityType]);

  // Combine static options and dynamic options
  const allOptions = useMemo(() => {
    const combined = [...staticOptions];
    
    // Merge API suggestions if they aren't already represented in static options
    apiSuggestions.forEach(apiOpt => {
      if (!combined.some(c => c.value === apiOpt.value)) {
        combined.push({
          value: apiOpt.value,
          label: apiOpt.label,
          context: apiOpt.context,
          disabled: false
        } as any);
      }
    });

    return combined;
  }, [staticOptions, apiSuggestions]);

  // Find currently selected option label
  const selectedLabel = useMemo(() => {
    const found = allOptions.find(opt => opt.value === value);
    return found ? found.label : '';
  }, [allOptions, value]);

  // Initialize input query to selected option label
  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedLabel);
    }
  }, [selectedLabel, isOpen]);

  // Popular and Recent Selections Logic
  const recentChoices = useMemo(() => {
    try {
      const stored = localStorage.getItem(`hilly_recent_${inferredEntityType}`);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        return allOptions.filter(opt => ids.includes(opt.value)).slice(0, 5);
      }
    } catch (_) {}
    return [];
  }, [allOptions, inferredEntityType, value]);

  const popularChoices = useMemo(() => {
    // Return some seed popular choices based on active bucket / entity type
    if (inferredEntityType === 'destination') {
      return allOptions.filter(o => ['gangtok', 'darjeeling', 'lava', 'kalimpong'].includes(o.value.toLowerCase())).slice(0, 4);
    }
    return allOptions.slice(0, 4);
  }, [allOptions, inferredEntityType]);

  // Debounced/Faceted search filter logic
  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return allOptions;
    }
    return allOptions.filter(opt => 
      isFuzzyMatch(query, opt.label) || 
      (opt.context && isFuzzyMatch(query, opt.context)) ||
      isFuzzyMatch(query, opt.value)
    );
  }, [allOptions, query]);

  // Max 8-10 items as requested
  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, 10);
  }, [filteredOptions]);

  // Update highlighted index if options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Keyboard and Click handlers
  const handleSelect = (val: string) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    
    // Save to recents
    try {
      const stored = localStorage.getItem(`hilly_recent_${inferredEntityType}`);
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = [val, ...ids.filter(id => id !== val)].slice(0, 10);
      localStorage.setItem(`hilly_recent_${inferredEntityType}`, JSON.stringify(ids));
    } catch (_) {}
  };

  // Click outside to close suggestion box
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev + 1) % (visibleOptions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev - 1 + visibleOptions.length) % (visibleOptions.length || 1));
    } else if (e.key === 'Enter') {
      if (isOpen && visibleOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(visibleOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      if (isOpen && visibleOptions[highlightedIndex]) {
        handleSelect(visibleOptions[highlightedIndex].value);
      }
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery(''); // Clear on focus to allow typing
  };

  return (
    <div ref={containerRef} className="relative w-full inline-block text-left font-sans select-none">
      {/* Search Input Input */}
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedLabel}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          className={`w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-2 pl-3 pr-10 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
          } ${className}`}
        />
        
        {/* Indicators */}
        <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
          {isLoading && <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Overlay Suggestion Box */}
      {isOpen && !disabled && (
        <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-[9999] overflow-hidden max-h-72 flex flex-col animate-fade-in">
          {/* Header query prompt */}
          <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>Dynamic Suggest</span>
            </span>
            {query && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-grow py-1">
            {/* Empty Input recommendations: Recently Selected and Popular Choices */}
            {!query.trim() && (
              <>
                {recentChoices.length > 0 && (
                  <div className="px-3 py-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Recently Selected</span>
                    </span>
                    <div className="space-y-0.5">
                      {recentChoices.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700 font-medium transition flex items-center justify-between"
                        >
                          <span>{opt.label}</span>
                          {opt.value === value && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {popularChoices.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-slate-50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span>Popular Choices</span>
                    </span>
                    <div className="space-y-0.5">
                      {popularChoices.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700 font-medium transition flex items-center justify-between"
                        >
                          <span>{opt.label}</span>
                          {opt.value === value && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Main filter list */}
            {query.trim() && (
              <>
                {visibleOptions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <AlertCircle className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                    <div className="text-xs font-bold text-slate-500">No matching results found.</div>
                    <span className="text-[10px] text-slate-400">Try checking spelling or type another name.</span>
                  </div>
                ) : (
                  visibleOptions.map((opt, index) => {
                    const isSelected = opt.value === value;
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full text-left px-3 py-2 text-xs transition flex flex-col ${
                          isHighlighted ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full font-semibold">
                          <HighlightedText text={opt.label} highlight={query} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        {(opt as any).context && (
                          <span className={`text-[10px] mt-0.5 font-medium ${isHighlighted ? 'text-slate-600' : 'text-slate-400'}`}>
                            {(opt as any).context}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
