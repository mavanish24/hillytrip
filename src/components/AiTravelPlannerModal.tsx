import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, RefreshCw, ArrowLeft, Check, 
  MapPin, Clock, DollarSign, CheckSquare, Square, 
  ChevronRight, Heart, ShieldAlert, Send, Flame, 
  Trees, Compass, Home, Compass as CompassIcon
} from 'lucide-react';

interface AiTravelPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

interface QuestionDef {
  key: string;
  question: string;
  subtitle: string;
}

export default function AiTravelPlannerModal({
  isOpen,
  onClose,
  userLocation = null
}: AiTravelPlannerModalProps) {
  // Session Form State
  const [formData, setFormData] = useState({
    tripType: '',
    travellers: 'Solo', // internal intelligence fallback compatibility
    source: '',
    days: '',
    budget: '',
    month: '',
    interests: [] as string[],
    stayPreference: '',
    fitnessLevel: '',
    difficulty: ''
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free Text input & suggestions
  const [naturalInput, setNaturalInput] = useState('');
  const [isFreeTextExpanded, setIsFreeTextExpanded] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement | null>(null);

  const autocompleteSources = [
    'Kolkata', 'Siliguri', 'Bagdogra', 'NJP', 
    'Gangtok', 'Darjeeling', 'Kalimpong', 'Delhi', 'Guwahati'
  ];

  const tripTypes = [
    { value: 'Weekend Escape', label: 'Weekend Escape', icon: '🏕️', desc: 'Perfect for a quick getaway.' },
    { value: 'Honeymoon', label: 'Honeymoon', icon: '❤️', desc: 'Romantic mountain escape.' },
    { value: 'Family Trip', label: 'Family Trip', icon: '👨‍👩‍👧', desc: 'Fun for everyone.' },
    { value: 'Trekking', label: 'Trekking', icon: '🥾', desc: 'Adventure through mountain trails.' },
    { value: 'Road Trip', label: 'Road Trip', icon: '🚗', desc: 'Enjoy scenic drives.' },
    { value: 'Backpacking', label: 'Backpacking', icon: '🎒', desc: 'Travel more, spend less.' },
    { value: 'Photography', label: 'Photography', icon: '📷', desc: 'Discover beautiful viewpoints.' },
    { value: 'Relaxation', label: 'Relaxation', icon: '🌿', desc: 'Peaceful mountain stays.' }
  ];

  const daysOptions = ['2', '3', '4', '5', '7+'];
  const budgetOptions = ['₹10,000', '₹20,000', '₹30,000', '₹50,000+'];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const stayPreferences = [
    { value: 'Luxury Resort', label: 'Luxury Resort', icon: '🏨', desc: 'Premium amenities, spa, and valley views.' },
    { value: 'Cozy Homestay', label: 'Cozy Homestay', icon: '🏡', desc: 'Local hospitality with home-cooked meals.' },
    { value: 'Secluded Cabin', label: 'Secluded Cabin', icon: '🪵', desc: 'Private wooden cottages in dense forests.' },
    { value: 'Adventure Camp', label: 'Adventure Camp', icon: '⛺', desc: 'Riverside glamping under starry skies.' }
  ];

  const fitnessLevels = [
    { value: 'Beginner', label: 'Beginner', icon: '🌱', desc: 'I walk occasionally, seek gentle paths.' },
    { value: 'Active', label: 'Active', icon: '🏃', desc: 'Good stamina, can hike 3-4 hours easily.' },
    { value: 'Experienced', label: 'Experienced', icon: '💪', desc: 'Fit for steep ascents and high altitudes.' }
  ];

  const difficulties = [
    { value: 'Easy', label: 'Easy', icon: '🚶', desc: 'Gentle slopes and well-marked trails.' },
    { value: 'Moderate', label: 'Moderate', icon: '🏔️', desc: 'Some steep climbs, altitude trekking.' },
    { value: 'Challenging', label: 'Challenging', icon: '🧗', desc: 'High endurance trails and passes.' }
  ];

  const travelStyles = [
    { name: 'Hidden Gems', desc: 'Lesser-known villages untouched by crowds.' },
    { name: 'Popular Destinations', desc: 'Famous landmarks and must-visit sightseeing.' },
    { name: 'Nature', desc: 'Waterfalls, lakes, forests, and panoramic viewpoints.' },
    { name: 'Tea Gardens', desc: 'Rolling green tea estates and bungalows.' },
    { name: 'Bird Watching', desc: 'Rare avifauna and high-altitude sanctuaries.' },
    { name: 'Photography', desc: 'Scenic photo spots and golden sunrise views.' },
    { name: 'Luxury', desc: 'Premium comfort and top-tier dining.' },
    { name: 'Adventure', desc: 'Thrilling offroad routes and suspension bridges.' }
  ];

  // Dynamic question sequence builder based on trip type
  const getStepsForTripType = (type: string): QuestionDef[] => {
    const base = [{ key: 'tripType', question: 'What kind of trip are you looking for?', subtitle: 'Just answer a few quick questions and we\'ll help you find the perfect trip.' }];
    
    if (type === 'Weekend Escape') {
      return [
        ...base,
        { key: 'source', question: 'Where are you starting from?', subtitle: 'We\'ll look up transport routes and taxi fares starting from here.' },
        { key: 'budget', question: 'What is your budget for this trip?', subtitle: 'We\'ll filter the perfect homestay tariffs and taxi fares.' },
        { key: 'days', question: 'How many days do you have for this trip?', subtitle: 'Helps us construct a realistic route timeline for your stay.' }
      ];
    } else if (type === 'Honeymoon') {
      return [
        ...base,
        { key: 'source', question: 'Where are you starting from?', subtitle: 'We\'ll look up transport routes and taxi fares starting from here.' },
        { key: 'days', question: 'How many days do you have for this trip?', subtitle: 'Helps us construct a realistic route timeline for your stay.' },
        { key: 'budget', question: 'What is your budget for this trip?', subtitle: 'We\'ll filter the perfect homestay tariffs and taxi fares.' },
        { key: 'stayPreference', question: 'What is your stay preference?', subtitle: 'Select the perfect atmosphere for your romantic mountain escape.' }
      ];
    } else if (type === 'Trekking') {
      return [
        ...base,
        { key: 'fitnessLevel', question: 'What is your fitness level?', subtitle: 'Trekking trails require different levels of stamina.' },
        { key: 'difficulty', question: 'Preferred trek difficulty?', subtitle: 'We\'ll choose a peak or valley trail that matches your pace.' },
        { key: 'days', question: 'How many days do you have for this trip?', subtitle: 'Helps us construct a realistic route timeline for your stay.' },
        { key: 'budget', question: 'What is your budget for this trip?', subtitle: 'We\'ll filter the perfect homestay tariffs and taxi fares.' }
      ];
    } else {
      // Default/All other trip types
      return [
        ...base,
        { key: 'source', question: 'Where are you starting from?', subtitle: 'We\'ll look up transport routes and taxi fares starting from here.' },
        { key: 'days', question: 'How many days do you have for this trip?', subtitle: 'Helps us construct a realistic route timeline for your stay.' },
        { key: 'budget', question: 'What is your budget for this trip?', subtitle: 'We\'ll filter the perfect homestay tariffs and taxi fares.' },
        { key: 'month', question: 'Which month are you visiting?', subtitle: 'Ensures we account for monsoon warnings, snowfall, or local peak seasons.' },
        { key: 'interests', question: 'What are your travel styles & interests?', subtitle: 'Select multiple. We\'ll cross-reference these with nearby attractions.' }
      ];
    }
  };

  const steps = getStepsForTripType(formData.tripType);
  const currentStep = steps[currentQuestionIndex] || steps[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  useEffect(() => {
    if (itinerary && resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [itinerary, isGenerating]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const saved = localStorage.getItem('hillytrip_planner_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
          if (parsed.source) {
            setSourceSearch(parsed.source);
          }
        } catch (e) {}
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Local parser for natural text
  const parseNaturalLanguageInput = (text: string) => {
    const normalized = text.toLowerCase().trim();
    const detected: Partial<typeof formData> = {};
    
    // Trip Type
    if (/\bhoneymoon\b|\bmarriage\b|\bcouple\b|\bromance\b|\bromantic\b/i.test(normalized)) {
      detected.tripType = 'Honeymoon';
      detected.travellers = 'Couple';
    } else if (/\bfamily\b|\bparent\b|\bkid\b|\bchild\b|\bchildren\b|\bsenior\b/i.test(normalized)) {
      detected.tripType = 'Family Trip';
      detected.travellers = 'Family';
    } else if (/\btrek\b|\btrekking\b|\bhike\b|\bhiking\b|\bclimb\b|\bpeak\b/i.test(normalized)) {
      detected.tripType = 'Trekking';
    } else if (/\broad\s*trip\b|\bdrive\b|\bdriving\b|\bcar\b|\bbike\b|\brider\b|\bride\b/i.test(normalized)) {
      detected.tripType = 'Road Trip';
    } else if (/\bbackpack\b|\bbackpacking\b|\bhostel\b|\bcheap\b/i.test(normalized)) {
      detected.tripType = 'Backpacking';
      detected.travellers = 'Solo';
    } else if (/\bphoto\b|\bphotography\b|\bphotos\b|\bshoot\b|\bcamera\b|\bcinematic\b/i.test(normalized)) {
      detected.tripType = 'Photography';
    } else if (/\brelax\b|\brelaxation\b|\bslow\b|\bcozy\b|\bpeaceful\b|\bquiet\b|\bcalm\b|\bsecluded\b/i.test(normalized)) {
      detected.tripType = 'Relaxation';
    } else if (/\bweekend\b|\bshort\b|\bquick\b|\brefresh\b/i.test(normalized)) {
      detected.tripType = 'Weekend Escape';
    }

    // Starting location
    let sourceMatch: string | null = null;
    const fromMatch = normalized.match(/(?:from|starting\s+at|starting\s+from|out\s+of)\s+([a-z\s]+)/i);
    if (fromMatch) {
      const candidate = fromMatch[1].trim();
      for (const src of autocompleteSources) {
        if (candidate.toLowerCase().includes(src.toLowerCase())) {
          sourceMatch = src;
          break;
        }
      }
    }

    if (!sourceMatch) {
      for (const src of autocompleteSources) {
        const regex = new RegExp(`\\b${src}\\b`, 'i');
        if (regex.test(normalized)) {
          sourceMatch = src;
          break;
        }
      }
    }

    if (sourceMatch) {
      detected.source = sourceMatch;
    }

    // Days duration
    let daysMatch: string | null = null;
    const dayNumRegex = /\b(\d+)\s*(?:day|days|night|nights|d|n)\b/i;
    const dayNumMatch = normalized.match(dayNumRegex);
    if (dayNumMatch) {
      const num = parseInt(dayNumMatch[1], 10);
      if (num <= 2) daysMatch = '2';
      else if (num === 3) daysMatch = '3';
      else if (num === 4) daysMatch = '4';
      else if (num === 5 || num === 6) daysMatch = '5';
      else if (num >= 7) daysMatch = '7+';
    }
    if (daysMatch) {
      detected.days = daysMatch;
    }

    // Budget
    let budgetMatch: string | null = null;
    const kMatch = normalized.match(/\b(\d+)\s*k\b/i);
    let budgetValue: number | null = null;
    if (kMatch) {
      budgetValue = parseInt(kMatch[1], 10) * 1000;
    } else {
      const rsMatch = normalized.match(/(?:rs\.?|rupees|₹|inr)?\s*(\d+[\d,.]*)/i);
      if (rsMatch && rsMatch[1]) {
        const cleaned = rsMatch[1].replace(/[,.]/g, '');
        const parsedNum = parseInt(cleaned, 10);
        if (parsedNum >= 1000) {
          budgetValue = parsedNum;
        }
      }
    }

    if (budgetValue !== null) {
      if (budgetValue <= 15000) budgetMatch = '₹10,000';
      else if (budgetValue <= 25500) budgetMatch = '₹20,000';
      else if (budgetValue <= 40000) budgetMatch = '₹30,000';
      else budgetMatch = '₹50,000+';
    }

    if (budgetMatch) {
      detected.budget = budgetMatch;
    }

    // Month
    let monthMatch: string | null = null;
    for (const m of months) {
      const regex = new RegExp(`\\b${m}\\b`, 'i');
      if (regex.test(normalized)) {
        monthMatch = m;
        break;
      }
    }
    if (monthMatch) {
      detected.month = monthMatch;
    }

    return detected;
  };

  const handleApplyNaturalLanguage = (textToUse?: string) => {
    const text = typeof textToUse === 'string' ? textToUse : naturalInput;
    if (!text.trim()) return;

    const parsed = parseNaturalLanguageInput(text);
    const updated = {
      ...formData,
      ...parsed
    };

    setFormData(updated);
    localStorage.setItem('hillytrip_planner_draft', JSON.stringify(updated));

    if (parsed.source) {
      setSourceSearch(parsed.source);
    }

    setNaturalInput('');
    setIsFreeTextExpanded(false);

    // Dynamic prefilling: find the first missing step for the detected/current trip type
    const updatedSteps = getStepsForTripType(updated.tripType || formData.tripType);
    let nextUnansweredIndex = 0;

    for (let i = 0; i < updatedSteps.length; i++) {
      const key = updatedSteps[i].key;
      const value = updated[key as keyof typeof updated];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        nextUnansweredIndex = i;
        break;
      }
      if (i === updatedSteps.length - 1) {
        // Everything answered, trigger AI immediately
        nextUnansweredIndex = updatedSteps.length;
      }
    }

    if (nextUnansweredIndex >= updatedSteps.length) {
      triggerPlannerAI(updated);
    } else {
      setCurrentQuestionIndex(nextUnansweredIndex);
    }
  };

  const selectOption = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };

    // Fallback alignment for server
    if (key === 'tripType') {
      if (value === 'Honeymoon') {
        updated.travellers = 'Couple';
      } else if (value === 'Family Trip') {
        updated.travellers = 'Family';
      } else {
        updated.travellers = 'Solo';
      }
    }

    setFormData(updated);
    localStorage.setItem('hillytrip_planner_draft', JSON.stringify(updated));

    // Wait 350ms to allow selected animation before auto advancing
    setTimeout(() => {
      advanceNext(updated);
    }, 350);
  };

  const advanceNext = (updatedState = formData) => {
    const currentSteps = getStepsForTripType(updatedState.tripType);
    let nextIndex = currentQuestionIndex + 1;

    // Skip steps that are already filled (e.g., from natural language parsing)
    while (nextIndex < currentSteps.length) {
      const nextKey = currentSteps[nextIndex].key;
      const val = updatedState[nextKey as keyof typeof updatedState];
      if (val && (Array.isArray(val) ? val.length > 0 : true)) {
        nextIndex++;
      } else {
        break;
      }
    }

    if (nextIndex >= currentSteps.length) {
      triggerPlannerAI(updatedState);
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const isSelected = formData.interests.includes(interest);
    const updatedInterests = isSelected
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData(prev => ({ ...prev, interests: updatedInterests }));
  };

  const triggerPlannerAI = async (finalData = formData) => {
    setIsGenerating(true);
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setLoadingStepIndex(0);

    // Stagger loading indicators sequentially for extreme premium feedback
    const interval = setInterval(() => {
      setLoadingStepIndex(prev => {
        if (prev < 4) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 800);

    try {
      // Append extra dynamic features to interests array so server receives all details
      const combinedInterests = [...finalData.interests];
      if (finalData.fitnessLevel) combinedInterests.push(`Fitness: ${finalData.fitnessLevel}`);
      if (finalData.difficulty) combinedInterests.push(`Difficulty: ${finalData.difficulty}`);
      if (finalData.stayPreference) combinedInterests.push(`Stay Preference: ${finalData.stayPreference}`);

      const requestBody = {
        tripType: finalData.tripType || 'Weekend Escape',
        travellers: finalData.travellers || 'Solo',
        source: finalData.source || 'Siliguri',
        budget: finalData.budget || '₹20,000',
        days: finalData.days || '3',
        month: finalData.month || 'September',
        interests: combinedInterests
      };

      const response = await fetch('/api/ai-assistant/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Our Himalayan servers are busy. Please try generating again.');
      }

      const data = await response.json();
      setItinerary(data.reply);
      localStorage.removeItem('hillytrip_planner_draft');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to establish connection with our mountain guides.');
    } finally {
      setIsLoading(false);
      clearInterval(interval);
    }
  };

  const resetPlanner = () => {
    setFormData({
      tripType: '',
      travellers: 'Solo',
      source: '',
      days: '',
      budget: '',
      month: '',
      interests: [],
      stayPreference: '',
      fitnessLevel: '',
      difficulty: ''
    });
    setSourceSearch('');
    setNaturalInput('');
    setIsFreeTextExpanded(false);
    setCurrentQuestionIndex(0);
    setItinerary(null);
    setError(null);
    setIsGenerating(false);
    localStorage.removeItem('hillytrip_planner_draft');
  };

  // High-contrast renderers for Markdown
  const renderBoldItalicText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const formatItineraryMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          const content = line.trim();
          
          if (content.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-extrabold text-base text-slate-950 tracking-tight mt-6 mb-2 border-l-4 border-emerald-500 pl-3">
                {content.replace('### ', '')}
              </h4>
            );
          }
          if (content.startsWith('## ') || content.startsWith('# ')) {
            return (
              <h3 key={idx} className="font-black text-lg text-emerald-600 mt-8 mb-3 border-b border-slate-100 pb-2 tracking-tight">
                {content.replace(/^#+\s/, '')}
              </h3>
            );
          }
          if (content.startsWith('- ') || content.startsWith('* ')) {
            const bulletText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 leading-relaxed text-sm">
                <span className="text-emerald-500 mt-1.5 shrink-0 text-[10px]">✦</span>
                <span className="flex-1">{renderBoldItalicText(bulletText)}</span>
              </div>
            );
          }

          const numMatch = content.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 leading-relaxed text-sm">
                <span className="text-emerald-600 font-extrabold shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1">{renderBoldItalicText(numMatch[2])}</span>
              </div>
            );
          }

          if (content === '') {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="text-sm text-slate-700 leading-relaxed font-normal">
              {renderBoldItalicText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredSources = autocompleteSources.filter(src =>
    src.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const isStepValid = () => {
    if (currentStep.key === 'tripType') {
      if (isFreeTextExpanded) return naturalInput.trim().length > 0;
      return !!formData.tripType;
    }
    if (currentStep.key === 'source') return !!formData.source || !!sourceSearch.trim();
    if (currentStep.key === 'days') return !!formData.days;
    if (currentStep.key === 'budget') return !!formData.budget;
    if (currentStep.key === 'month') return !!formData.month;
    if (currentStep.key === 'interests') return formData.interests.length > 0;
    if (currentStep.key === 'fitnessLevel') return !!formData.fitnessLevel;
    if (currentStep.key === 'difficulty') return !!formData.difficulty;
    if (currentStep.key === 'stayPreference') return !!formData.stayPreference;
    return true;
  };

  const handleContinueWithManualInput = () => {
    if (currentStep.key === 'source') {
      const finalSource = formData.source || sourceSearch.trim() || 'Siliguri';
      selectOption('source', finalSource);
    } else if (currentStep.key === 'interests') {
      advanceNext();
    }
  };

  const handleSourceSelect = (src: string) => {
    setSourceSearch(src);
    setShowSourceDropdown(false);
    selectOption('source', src);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          id="ai-planner-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col bg-white text-slate-900 outline-none overflow-hidden font-sans"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* HEADER ROW - Premium minimal Apple aesthetics */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              {currentQuestionIndex > 0 && !isGenerating && (
                <button
                  onClick={handleBack}
                  className="mr-1 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
              )}
              <span className="text-xl">🗻</span>
              <h2 className="text-sm font-black tracking-tight text-slate-800">HillyTrip Planner</h2>
            </div>

            <div className="flex items-center gap-2">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={resetPlanner}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Start Fresh</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-100 hover:border-slate-200 bg-white transition cursor-pointer"
                aria-label="Close trip planner"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* PROGRESS BAR - No text, just a clean animated bar */}
          {!isGenerating && (
            <div className="w-full h-1 bg-slate-100 shrink-0">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentQuestionIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* MAIN FORM SCREEN */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8">
            <div className="max-w-md mx-auto w-full pb-20">
              
              <AnimatePresence mode="wait">
                {!isGenerating ? (
                  <motion.div
                    key={`step-${currentQuestionIndex}`}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* TITLE & SUBTITLE */}
                    <div className="text-center space-y-1">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 leading-tight">
                        {currentQuestionIndex === 0 ? "Let's Plan Your Mountain Trip" : currentStep.question}
                      </h1>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                        {currentQuestionIndex === 0 ? "Just answer a few quick questions and we'll help you find the perfect trip." : currentStep.subtitle}
                      </p>
                    </div>

                    {/* RENDER DYNAMIC STEPS */}

                    {/* Step: Trip Type Card Layout */}
                    {currentStep.key === 'tripType' && (
                      <div className="space-y-5 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          {tripTypes.map((t) => {
                            const isSelected = formData.tripType === t.value && !isFreeTextExpanded;
                            return (
                              <button
                                key={t.value}
                                onClick={() => {
                                  setIsFreeTextExpanded(false);
                                  selectOption('tripType', t.value);
                                }}
                                className={`h-[105px] p-3 bg-white border rounded-2xl text-center transition-all duration-300 flex flex-col justify-center items-center gap-1 cursor-pointer active:scale-95 ${
                                  isSelected 
                                    ? 'border-emerald-500 ring-4 ring-emerald-100/50 bg-emerald-50/5' 
                                    : 'border-slate-150 hover:border-slate-300 hover:shadow-xs'
                                }`}
                              >
                                <span className="text-2xl select-none" role="img" aria-label={t.label}>
                                  {t.icon}
                                </span>
                                <span className="font-extrabold text-xs text-slate-950 block tracking-tight">
                                  {t.label}
                                </span>
                                <span className="hidden sm:block text-[10px] text-slate-400 font-medium">
                                  {t.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* FREE TEXT FLOW */}
                        <div className="pt-2">
                          <div className="flex items-center my-5">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="mx-3.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">or</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                          </div>

                          <div className="w-full">
                            {!isFreeTextExpanded ? (
                              <button
                                onClick={() => {
                                  setIsFreeTextExpanded(true);
                                  // Reset selected preset when using free-form text
                                  setFormData(prev => ({ ...prev, tripType: '' }));
                                }}
                                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-3xs hover:bg-slate-50 transition active:scale-[0.98]"
                              >
                                <span>💬 Tell us about your trip</span>
                              </button>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Describe your ideal trip</span>
                                  <button
                                    onClick={() => {
                                      setIsFreeTextExpanded(false);
                                      setNaturalInput('');
                                    }}
                                    className="text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer"
                                  >
                                    Use presets
                                  </button>
                                </div>
                                
                                <textarea
                                  value={naturalInput}
                                  onChange={(e) => setNaturalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleApplyNaturalLanguage();
                                    }
                                  }}
                                  placeholder='Example: "I have 4 days from Kolkata and a budget of ₹20,000."'
                                  rows={2}
                                  className="w-full p-3.5 rounded-xl bg-white border border-slate-250 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none text-xs sm:text-sm font-semibold transition text-slate-800 placeholder-slate-400 resize-none shadow-3xs"
                                />

                                <div className="flex items-center justify-between gap-3 pt-1">
                                  <div className="flex flex-wrap gap-1.5">
                                    <button
                                      onClick={() => setNaturalInput("Honeymoon under ₹25,000")}
                                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-slate-200 transition text-slate-600 font-bold cursor-pointer"
                                    >
                                      Honeymoon under ₹25,000
                                    </button>
                                    <button
                                      onClick={() => setNaturalInput("Family trip from Siliguri")}
                                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-slate-200 transition text-slate-600 font-bold cursor-pointer"
                                    >
                                      Family trip from Siliguri
                                    </button>
                                  </div>

                                  <button
                                    disabled={!naturalInput.trim()}
                                    onClick={() => handleApplyNaturalLanguage()}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
                                      naturalInput.trim() 
                                        ? 'bg-emerald-500 text-white cursor-pointer active:scale-95' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <Send className="w-4 h-4 ml-0.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step: Starting Location */}
                    {currentStep.key === 'source' && (
                      <div className="space-y-4 pt-1 relative">
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-4 w-4 h-4 text-emerald-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Type starting location..."
                            value={sourceSearch}
                            onChange={(e) => {
                              setSourceSearch(e.target.value);
                              setShowSourceDropdown(true);
                            }}
                            onFocus={() => setShowSourceDropdown(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && sourceSearch.trim()) {
                                e.preventDefault();
                                handleSourceSelect(sourceSearch);
                              }
                            }}
                            className="w-full h-12 pl-11 pr-12 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none text-xs sm:text-sm font-semibold transition text-slate-800 placeholder-slate-400 shadow-3xs"
                          />
                          {sourceSearch.trim() && (
                            <button
                              onClick={() => handleSourceSelect(sourceSearch)}
                              className="absolute right-3 w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              Go
                            </button>
                          )}
                        </div>

                        {/* Autocomplete dropdown */}
                        {showSourceDropdown && sourceSearch.trim() !== '' && (
                          <div className="absolute z-20 w-full bg-white border border-slate-150 rounded-xl overflow-hidden shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {filteredSources.length > 0 ? (
                              filteredSources.map((item) => (
                                <button
                                  key={item}
                                  onClick={() => handleSourceSelect(item)}
                                  className="w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-emerald-50/50 transition cursor-pointer text-slate-800 hover:text-emerald-700 font-bold border-b border-slate-50 last:border-none"
                                >
                                  {item}
                                </button>
                              ))
                            ) : (
                              <button
                                onClick={() => handleSourceSelect(sourceSearch)}
                                className="w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-emerald-50/50 transition cursor-pointer text-slate-800 hover:text-emerald-700 font-bold"
                              >
                                Custom: "{sourceSearch}"
                              </button>
                            )}
                          </div>
                        )}

                        {/* Hub chips */}
                        <div className="space-y-2.5 pt-1">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Popular Hubs</span>
                          <div className="flex flex-wrap gap-2">
                            {autocompleteSources.map((item) => {
                              const isSelected = formData.source === item;
                              return (
                                <button
                                  key={item}
                                  onClick={() => handleSourceSelect(item)}
                                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                                    isSelected 
                                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-700' 
                                      : 'border-slate-150 bg-white hover:border-slate-300 text-slate-700'
                                  }`}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step: Days Options */}
                    {currentStep.key === 'days' && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                        {daysOptions.map((opt) => {
                          const isSelected = formData.days === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => selectOption('days', opt)}
                              className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100 bg-emerald-50/10' 
                                  : 'border-slate-150 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Clock className="w-4 h-4" />
                              </div>
                              <span className={`font-bold text-xs sm:text-sm block ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                {opt} {opt === '7+' ? 'Days' : 'Days'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Budget Options */}
                    {currentStep.key === 'budget' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {budgetOptions.map((opt) => {
                          const isSelected = formData.budget === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => selectOption('budget', opt)}
                              className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100 bg-emerald-50/10' 
                                  : 'border-slate-150 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <span className={`font-bold text-xs sm:text-sm block ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Stay Preference (Honeymoon specific) */}
                    {currentStep.key === 'stayPreference' && (
                      <div className="space-y-3 pt-1">
                        {stayPreferences.map((opt) => {
                          const isSelected = formData.stayPreference === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => selectOption('stayPreference', opt.value)}
                              className={`w-full p-4 bg-white border rounded-2xl text-left transition-all duration-300 flex items-start gap-4 cursor-pointer active:scale-[0.98] ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100/40 bg-emerald-50/5' 
                                  : 'border-slate-150 hover:border-slate-200'
                              }`}
                            >
                              <span className="text-2xl select-none" role="img" aria-label={opt.label}>
                                {opt.icon}
                              </span>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-sm text-slate-900 block">{opt.label}</span>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Fitness Level (Trekking specific) */}
                    {currentStep.key === 'fitnessLevel' && (
                      <div className="space-y-3 pt-1">
                        {fitnessLevels.map((opt) => {
                          const isSelected = formData.fitnessLevel === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => selectOption('fitnessLevel', opt.value)}
                              className={`w-full p-4 bg-white border rounded-2xl text-left transition-all duration-300 flex items-start gap-4 cursor-pointer active:scale-[0.98] ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100/40 bg-emerald-50/5' 
                                  : 'border-slate-150 hover:border-slate-200'
                              }`}
                            >
                              <span className="text-2xl select-none" role="img" aria-label={opt.label}>
                                {opt.icon}
                              </span>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-sm text-slate-900 block">{opt.label}</span>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Difficulty (Trekking specific) */}
                    {currentStep.key === 'difficulty' && (
                      <div className="space-y-3 pt-1">
                        {difficulties.map((opt) => {
                          const isSelected = formData.difficulty === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => selectOption('difficulty', opt.value)}
                              className={`w-full p-4 bg-white border rounded-2xl text-left transition-all duration-300 flex items-start gap-4 cursor-pointer active:scale-[0.98] ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100/40 bg-emerald-50/5' 
                                  : 'border-slate-150 hover:border-slate-200'
                              }`}
                            >
                              <span className="text-2xl select-none" role="img" aria-label={opt.label}>
                                {opt.icon}
                              </span>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-sm text-slate-900 block">{opt.label}</span>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Month Selector */}
                    {currentStep.key === 'month' && (
                      <div className="grid grid-cols-3 gap-2.5 pt-2">
                        {months.map((m) => {
                          const isSelected = formData.month === m;
                          return (
                            <button
                              key={m}
                              onClick={() => selectOption('month', m)}
                              className={`py-3 px-2 rounded-xl border text-center text-xs font-extrabold transition duration-200 cursor-pointer active:scale-95 ${
                                isSelected 
                                  ? 'border-emerald-500 ring-4 ring-emerald-100/40 bg-emerald-50/10 text-emerald-700' 
                                  : 'border-slate-150 bg-white hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step: Interests Styles Checkboxes */}
                    {currentStep.key === 'interests' && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                          {travelStyles.map((style) => {
                            const isSelected = formData.interests.includes(style.name);
                            return (
                              <button
                                key={style.name}
                                onClick={() => handleInterestToggle(style.name)}
                                className={`p-3.5 bg-white border rounded-2xl text-left transition-all duration-200 cursor-pointer flex gap-3.5 items-start active:scale-[0.99] ${
                                  isSelected 
                                    ? 'border-emerald-500 ring-3 ring-emerald-100/40 bg-emerald-50/5' 
                                    : 'border-slate-150 hover:border-slate-250'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">{style.name}</span>
                                  <span className="text-slate-500 text-[10px] leading-relaxed block font-medium">{style.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Continue Button is needed ONLY for checkboxes to confirm choices */}
                        <div className="pt-4">
                          <button
                            onClick={() => handleContinueWithManualInput()}
                            disabled={formData.interests.length === 0}
                            className={`w-full py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-md transition ${
                              formData.interests.length > 0 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer active:scale-[0.98]' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>Continue →</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                ) : (
                  /* IMMERSIVE VERIFICATION & LOADING */
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-8"
                  >
                    {/* Status Screen */}
                    {isLoading ? (
                      <div className="space-y-6 w-full max-w-sm">
                        <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
                          <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-pulse" />
                          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <Sparkles className="w-5 h-5 text-emerald-600 animate-bounce" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">Finding the best options...</h3>
                        </div>

                        {/* Sequenced Milestones */}
                        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3.5 text-left shadow-2xs">
                          {[
                            { step: 0, label: 'Searching destinations' },
                            { step: 1, label: 'Matching homestays' },
                            { step: 2, label: 'Finding attractions' },
                            { step: 3, label: 'Checking routes' },
                            { step: 4, label: 'Creating your personalised itinerary...' }
                          ].map((item) => {
                            const isDone = loadingStepIndex > item.step;
                            const isActive = loadingStepIndex === item.step;
                            return (
                              <div 
                                key={item.step} 
                                className={`flex items-center gap-3 text-xs font-bold transition-all duration-300 ${
                                  isDone ? 'text-emerald-700' : isActive ? 'text-slate-900 scale-102 pl-1' : 'text-slate-400'
                                }`}
                              >
                                {isDone ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0">✓</span>
                                ) : isActive ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 animate-pulse">✦</span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] shrink-0">•</span>
                                )}
                                <span>{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : error ? (
                      /* ERROR STATE */
                      <div className="space-y-4 max-w-sm">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Connection Failed</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-semibold">{error}</p>
                        <button
                          onClick={() => triggerPlannerAI()}
                          className="w-full py-3 bg-emerald-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition active:scale-95 cursor-pointer shadow-md"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      /* RENDER COMPLETED ITINERARY SCREEN */
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left w-full space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                              <Sparkles className="w-3 h-3" />
                              Custom Itinerary
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Himalayan Escape is Ready</h2>
                          </div>

                          <button
                            onClick={resetPlanner}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shrink-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Create Another Trip</span>
                          </button>
                        </div>

                        {/* Itinerary Body Content */}
                        <div className="border border-slate-150/80 bg-white rounded-3xl p-5 sm:p-6 shadow-sm font-sans space-y-4">
                          {formatItineraryMarkdown(itinerary || '')}
                        </div>

                        <div ref={resultsEndRef} />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
