import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CreditCard, 
  Star, 
  Tag, 
  Plus, 
  X, 
  Check, 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  Globe, 
  Languages as LangIcon, 
  Compass, 
  HelpCircle, 
  Info, 
  Calendar, 
  Clock, 
  Coins, 
  Lock, 
  Shield, 
  Trash2, 
  Camera, 
  Car, 
  Bed, 
  CheckCircle,
  Hash
} from 'lucide-react';
import { BusinessField } from '../types/businessOnboarding';
import { masterData } from '../data/masterData';
import { validateField } from '../utils/validationService';
import RoomCategoryManager from './RoomCategoryManager';

interface DynamicFieldRendererProps {
  field: BusinessField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  formData?: Record<string, any>;
}

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
  formData
}: DynamicFieldRendererProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(''); // For tags input
  const [showHelp, setShowHelp] = useState(false);

  // Validate value changes against validation rules dynamically using validationService
  useEffect(() => {
    const result = validateField(field, value, formData || {});
    if (!result.isValid) {
      // If empty but required, only show internal error once user interacts or if specifically asked
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        setInternalError(null);
      } else {
        setInternalError(result.message || null);
      }
    } else {
      setInternalError(null);
    }
  }, [value, field, formData]);

  // Handle multiple image uploading
  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentList = Array.isArray(value) ? value : [];
    const newList = [...currentList];
    
    Array.from(files).forEach(file => {
      newList.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        preview: URL.createObjectURL(file),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    });
    onChange(newList);
  };

  // Handle remove dynamic gallery item
  const handleRemoveGalleryItem = (id: string) => {
    const currentList = Array.isArray(value) ? value : [];
    onChange(currentList.filter((item: any) => item.id !== id));
  };

  // Handle tags entry
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputValue.trim().replace(/,$/, '');
      if (trimmed) {
        const currentTags = Array.isArray(value) ? value : [];
        if (!currentTags.includes(trimmed)) {
          onChange([...currentTags, trimmed]);
        }
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(value) ? value : [];
    onChange(currentTags.filter((t: string) => t !== tagToRemove));
  };

  // Helper to resolve options dynamically from MasterData
  const getFieldOptions = () => {
    const source = field.optionsSource || 
      (field.type === 'amenities' ? 'amenities' :
       field.type === 'languages' ? 'languages' :
       field.type === 'vehicle_types' ? 'vehicle_types' :
       field.type === 'room_types' ? 'room_types' :
       field.type === 'payment_methods' ? 'payment_methods' : undefined);

    if (source) {
      return (masterData[source] || [])
        .filter(opt => opt.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(opt => ({
          id: opt.id,
          label: opt.label,
          value: opt.value,
          icon: opt.icon,
          desc: opt.description || '',
          description: opt.description
        }));
    }
    
    return (field.options || []).map((opt, idx) => ({
      id: opt.value,
      label: opt.label,
      value: opt.value,
      sortOrder: idx,
      isActive: true,
      icon: undefined,
      desc: '',
      description: undefined
    }));
  };

  const currentOptions = getFieldOptions();

  // Map picker simulation helper
  const handleGPSLocationMock = () => {
    // Generate simulated Himalayan coordinates
    const lat = (27.03 + Math.random() * 0.1).toFixed(6);
    const lng = (88.26 + Math.random() * 0.1).toFixed(6);
    onChange({
      latitude: lat,
      longitude: lng,
      address: 'Near Chowrasta Mall, Darjeeling, West Bengal',
      altitude: '2,042 meters'
    });
  };

  return (
    <div className="space-y-2 w-full font-sans">
      {/* Label and Info line */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
          {field.label}
          {field.required && <span className="text-red-500 font-black">*</span>}
        </label>
        
        {field.helpText && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-slate-400 hover:text-indigo-500 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expandable Help Text banner */}
      {showHelp && field.helpText && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-2.5 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
          <span>{field.helpText}</span>
        </div>
      )}

      {/* RENDERING UI MODULE BASED ON FIELD TYPE */}
      <div className="relative">
        
        {/* 1. Standard text / inputs */}
        {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'url' || field.type === 'date' || field.type === 'time' || field.type === 'number') && (
          <div className="relative flex items-center">
            {field.type === 'email' && <Globe className="absolute left-3.5 w-4 h-4 text-slate-400" />}
            {field.type === 'phone' && <Compass className="absolute left-3.5 w-4 h-4 text-slate-400" />}
            {field.type === 'date' && <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />}
            {field.type === 'time' && <Clock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />}
            {field.type === 'number' && <Hash className="absolute left-3.5 w-4 h-4 text-slate-400" />}
            
            <input
              type={field.type === 'phone' ? 'tel' : field.type}
              required={field.required}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                internalError || error ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-600/25'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-slate-800 dark:text-white transition duration-200 ${
                ['email', 'phone', 'date', 'time', 'number'].includes(field.type) ? 'pl-11' : ''
              }`}
            />
          </div>
        )}

        {/* 2. Textarea */}
        {field.type === 'textarea' && (
          <textarea
            required={field.required}
            placeholder={field.placeholder || `Enter description...`}
            value={value !== undefined ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white transition duration-200 min-h-[110px]"
          />
        )}

        {/* 3. Checkbox */}
        {field.type === 'checkbox' && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 rounded"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {field.placeholder || `I agree to ${field.label}`}
            </span>
          </label>
        )}

        {/* 4. Switch / Yes_No */}
        {(field.type === 'switch' || field.type === 'yes_no') && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(!value)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                value ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {value ? 'Yes / Enabled' : 'No / Disabled'}
            </span>
          </div>
        )}

        {/* 5. Radio Buttons */}
        {field.type === 'radio' && (
          <div className="flex flex-wrap gap-4 pt-1">
            {currentOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="accent-indigo-600"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* 6. Custom Select Dropdown */}
        {field.type === 'select' && (
          <select
            required={field.required}
            value={value !== undefined ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white transition duration-200 cursor-pointer"
          >
            <option value="">{field.placeholder || 'Select Option'}</option>
            {currentOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {/* 7. Multiselect Pill System */}
        {field.type === 'multiselect' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[44px]">
              {currentOptions.map(opt => {
                const selectedList = Array.isArray(value) ? value : [];
                const isSelected = selectedList.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      if (isSelected) {
                        onChange(selectedList.filter((item: string) => item !== opt.value));
                      } else {
                        onChange([...selectedList, opt.value]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-800'
                        : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400">Tap options to toggle selections</p>
          </div>
        )}

        {/* 8. Single Image Box Upload */}
        {field.type === 'image' && (
          <div className="border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition">
            {value ? (
              <div className="relative max-w-xs mx-auto">
                <img src={value} alt="Preview" referrerPolicy="no-referrer" className="w-full rounded-lg h-32 object-cover border" />
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-1.5">
                <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mx-auto border">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Upload picture</span>
                  <span className="text-[9px] text-slate-400">PNG or JPG files</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => onChange(reader.result as string);
                    }
                  }}
                />
              </label>
            )}
          </div>
        )}

        {/* 9. Dynamic Photo Gallery Upload */}
        {field.type === 'gallery' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-6 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition">
              <label className="cursor-pointer block space-y-2">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mx-auto border">
                  <UploadCloud className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Click to upload multiple photos</span>
                  <span className="text-[9px] text-slate-400">Photos will display in carousel gallery</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImages}
                />
              </label>
            </div>

            {Array.isArray(value) && value.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {value.map((item: any) => (
                  <div key={item.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video group">
                    <img src={item.preview} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(item.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. Document Certificate Upload Component */}
        {field.type === 'document' && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between">
            {value ? (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span className="truncate max-w-[200px]">{value.filename || 'Uploaded File'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-wider cursor-pointer select-none transition shadow-sm">
                <UploadCloud className="w-4 h-4" /> Upload Document Proof
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange({
                        filename: file.name,
                        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                        uploadedAt: new Date().toLocaleTimeString()
                      });
                    }
                  }}
                />
              </label>
            )}
          </div>
        )}

        {/* 11. GPS Map Location Simulator Component */}
        {field.type === 'location' && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Map GPS Integrator</span>
              <button
                type="button"
                onClick={handleGPSLocationMock}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-850 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition"
              >
                Auto-Detect Pin GPS
              </button>
            </div>

            {value ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-150 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{value.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-1.5 font-mono">
                  <div>LAT: <span className="font-bold text-slate-700 dark:text-slate-300">{value.latitude}</span></div>
                  <div>LNG: <span className="font-bold text-slate-700 dark:text-slate-300">{value.longitude}</span></div>
                  <div>ALT: <span className="font-bold text-slate-700 dark:text-slate-300">{value.altitude}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <MapPin className="w-5 h-5 text-slate-300" />
                <span>No Coordinates registered yet. Click "Auto-Detect Pin GPS" to bind locations.</span>
              </div>
            )}
          </div>
        )}

        {/* 12. Pricing / Currencies Inputs */}
        {(field.type === 'price' || field.type === 'currency') && (
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 text-sm font-extrabold flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-500" /> ₹
            </span>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white transition duration-200"
            />
            <span className="absolute right-3.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 border px-2 py-0.5 rounded">INR</span>
          </div>
        )}

        {/* Percentage Input */}
        {field.type === 'percentage' && (
          <div className="relative flex items-center">
            <input
              type="number"
              min={0}
              max={100}
              placeholder={field.placeholder || "30"}
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white transition duration-200 pr-12 font-bold"
            />
            <span className="absolute right-3.5 text-xs font-black text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-lg">
              %
            </span>
          </div>
        )}

        {/* Room Categories Manager Component */}
        {field.type === 'room_categories' && (
          <RoomCategoryManager
            value={value || []}
            onChange={(val) => onChange(val)}
          />
        )}

        {/* 13. Dynamic Rating system (Stars) */}
        {field.type === 'rating' && (
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map(starNum => {
              const active = value >= starNum;
              return (
                <button
                  type="button"
                  key={starNum}
                  onClick={() => onChange(starNum)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star className={`w-6 h-6 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              );
            })}
            {value > 0 && (
              <span className="text-xs font-bold text-slate-500 ml-1.5">{value} / 5 Stars Selected</span>
            )}
          </div>
        )}

        {/* 14. Dynamic Custom Tag Inputs */}
        {field.type === 'tags' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[44px]">
              {Array.isArray(value) && value.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-850 rounded-lg text-[10px] font-black uppercase tracking-wider"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-indigo-400 hover:text-indigo-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                placeholder="Type tag and press enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-transparent border-none text-xs focus:outline-none placeholder-slate-400 min-w-[120px] flex-1 py-0.5 text-slate-800 dark:text-white"
              />
            </div>
            <p className="text-[9px] text-slate-400">Type a keyword and press Enter or Comma (,) to register tag.</p>
          </div>
        )}

        {/* 15. Standard Amenities (Wi-Fi, Heating, Hot Water etc) */}
        {field.type === 'amenities' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {currentOptions.map(amenity => {
              const selectedList = Array.isArray(value) ? value : [];
              const isSelected = selectedList.includes(amenity.id);
              return (
                <button
                  type="button"
                  key={amenity.id}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedList.filter((x: string) => x !== amenity.id));
                    } else {
                      onChange([...selectedList, amenity.id]);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition select-none ${
                    isSelected
                      ? 'bg-slate-900 border-slate-950 text-white dark:bg-slate-800 dark:border-slate-750'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-base">{amenity.icon}</span>
                  <span>{amenity.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 16. Languages spoken interactive list */}
        {field.type === 'languages' && (
          <div className="flex flex-wrap gap-2 pt-1">
            {currentOptions.map(lang => {
              const selectedList = Array.isArray(value) ? value : [];
              const isSelected = selectedList.includes(lang.id);
              return (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedList.filter((x: string) => x !== lang.id));
                    } else {
                      onChange([...selectedList, lang.id]);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition uppercase tracking-wide select-none ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <LangIcon className="w-3.5 h-3.5" />
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 17. Vehicle Types selection boxes */}
        {field.type === 'vehicle_types' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {currentOptions.map(v => {
              const selectedList = Array.isArray(value) ? value : [];
              const isSelected = selectedList.includes(v.id);
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedList.filter((x: string) => x !== v.id));
                    } else {
                      onChange([...selectedList, v.id]);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-slate-900 border-slate-950 text-white dark:bg-slate-800 dark:border-slate-750'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold uppercase tracking-wide block">{v.label}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{v.desc}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 18. Room types selection boxes */}
        {field.type === 'room_types' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {currentOptions.map(r => {
              const selectedList = Array.isArray(value) ? value : [];
              const isSelected = selectedList.includes(r.id);
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedList.filter((x: string) => x !== r.id));
                    } else {
                      onChange([...selectedList, r.id]);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-slate-900 border-slate-950 text-white dark:bg-slate-800 dark:border-slate-750'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold uppercase tracking-wide block">{r.label}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{r.desc}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 19. Payment Methods Selection */}
        {field.type === 'payment_methods' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {currentOptions.map(p => {
              const selectedList = Array.isArray(value) ? value : [];
              const isSelected = selectedList.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedList.filter((x: string) => x !== p.id));
                    } else {
                      onChange([...selectedList, p.id]);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-slate-900 border-slate-950 text-white dark:bg-slate-800 dark:border-slate-750'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold uppercase tracking-wide block">{p.label}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{p.desc}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 20. Bank details double inputs */}
        {field.type === 'bank_account' && (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Account Number</span>
                <input
                  type="text"
                  placeholder="e.g. 5010023412563"
                  value={value?.accountNumber || ''}
                  onChange={(e) => onChange({ ...value, accountNumber: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Bank IFSC Code</span>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000123"
                  value={value?.ifscCode || ''}
                  onChange={(e) => onChange({ ...value, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white uppercase"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Beneficiary Name</span>
                <input
                  type="text"
                  placeholder="e.g. Darjeeling Tours Pvt Ltd"
                  value={value?.beneficiaryName || ''}
                  onChange={(e) => onChange({ ...value, beneficiaryName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Bank Name</span>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank Ltd"
                  value={value?.bankName || ''}
                  onChange={(e) => onChange({ ...value, bankName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 21. Regulatory inputs: GST Number */}
        {field.type === 'gst_number' && (
          <div className="relative flex items-center">
            <Shield className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required={field.required}
              placeholder="e.g. 19AAAAA1111A1Z1"
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white uppercase font-mono tracking-wider"
            />
          </div>
        )}

        {/* 22. Regulatory inputs: PAN Number */}
        {field.type === 'pan_number' && (
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required={field.required}
              placeholder="e.g. ABCDE1234F"
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white uppercase font-mono tracking-wider"
            />
          </div>
        )}

        {/* 23. Regulatory inputs: Aadhaar Number */}
        {field.type === 'aadhaar_number' && (
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required={field.required}
              placeholder="e.g. 1234 5678 9012"
              value={value !== undefined ? value : ''}
              onChange={(e) => {
                // Formatting numbers with spaces
                const numeric = e.target.value.replace(/\D/g, '').substring(0, 12);
                const grouped = numeric.match(/.{1,4}/g)?.join(' ') || numeric;
                onChange(grouped);
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white font-mono tracking-widest"
            />
          </div>
        )}

        {/* 24. Regulatory inputs: License Number */}
        {field.type === 'license_number' && (
          <div className="relative flex items-center">
            <FileText className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required={field.required}
              placeholder="e.g. WB-19-202300452"
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white font-mono uppercase tracking-wide"
            />
          </div>
        )}

        {/* 25. Coordinates */}
        {field.type === 'coordinates' && (
          <div className="relative flex items-center">
            <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required={field.required}
              placeholder="e.g. 27.036007, 88.262674"
              value={value !== undefined ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/25 text-slate-800 dark:text-white font-mono tracking-wider"
            />
          </div>
        )}

      </div>

      {/* Validation status / errors representation */}
      {internalError ? (
        <span className="text-[10px] font-bold text-red-500 block leading-tight">
          ⚠️ {internalError}
        </span>
      ) : error ? (
        <span className="text-[10px] font-bold text-red-500 block leading-tight">
          ⚠️ {error}
        </span>
      ) : value !== undefined && value !== '' && !internalError ? (
        <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider select-none">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span>Verified Field Format</span>
        </div>
      ) : null}
    </div>
  );
}
