import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Bed, Users, Square, Coins, Sparkles, Check, Image as ImageIcon, Camera, CheckCircle, ChevronDown, ChevronUp, Power } from 'lucide-react';
import { getMasterConfigLibrary } from '../data/masterConfigurationLibrary';

export interface RoomCategoryData {
  id: string;
  name: string;
  type: string; // e.g. Standard, Deluxe, Suite, Cottage, Villa, Dorm
  maxGuests: number;
  areaSqFt: number;
  bedType: string; // e.g. King, Queen, Twin, Single, Bunk
  basePrice: number;
  weekendPrice: number;
  festivalPrice: number;
  extraGuestCharge: number;
  amenities: string[];
  photos: string[];
  isAvailable: boolean;
}

interface RoomCategoryManagerProps {
  value: RoomCategoryData[];
  onChange: (newValue: RoomCategoryData[]) => void;
}

export default function RoomCategoryManager({ value = [], onChange }: RoomCategoryManagerProps) {
  const masterLib = getMasterConfigLibrary();
  const roomTypesOptions = masterLib.room_types?.options || [];
  const bedTypesOptions = masterLib.bed_types?.options || [];
  const amenitiesOptions = masterLib.amenities?.options || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state for room category configuration
  const [roomForm, setRoomForm] = useState<RoomCategoryData>({
    id: '',
    name: 'Deluxe Mountain View Suite',
    type: 'deluxe',
    maxGuests: 2,
    areaSqFt: 280,
    bedType: 'king',
    basePrice: 2500,
    weekendPrice: 3000,
    festivalPrice: 3800,
    extraGuestCharge: 500,
    amenities: ['wifi', 'hot_water', 'mountain_balcony', 'room_heater'],
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600'],
    isAvailable: true
  });

  const handleOpenAddModal = () => {
    setRoomForm({
      id: `rm-${Date.now()}`,
      name: '',
      type: 'deluxe',
      maxGuests: 2,
      areaSqFt: 250,
      bedType: 'king',
      basePrice: 2000,
      weekendPrice: 2400,
      festivalPrice: 3200,
      extraGuestCharge: 400,
      amenities: ['wifi', 'hot_water'],
      photos: [],
      isAvailable: true
    });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (index: number) => {
    setRoomForm({ ...value[index] });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleSaveRoom = () => {
    if (!roomForm.name.trim()) {
      alert('Please enter a Room Category Name (e.g. Deluxe Suite)');
      return;
    }

    const currentList = Array.isArray(value) ? [...value] : [];
    if (editingIndex !== null) {
      currentList[editingIndex] = roomForm;
    } else {
      currentList.push({
        ...roomForm,
        id: roomForm.id || `rm-${Date.now()}`
      });
    }

    onChange(currentList);
    setIsEditing(false);
  };

  const handleDeleteRoom = (index: number) => {
    const currentList = Array.isArray(value) ? [...value] : [];
    currentList.splice(index, 1);
    onChange(currentList);
  };

  const handleToggleAmenity = (amenityId: string) => {
    const current = roomForm.amenities || [];
    if (current.includes(amenityId)) {
      setRoomForm({ ...roomForm, amenities: current.filter(a => a !== amenityId) });
    } else {
      setRoomForm({ ...roomForm, amenities: [...current, amenityId] });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotoUrls: string[] = [];
    Array.from(files).forEach(file => {
      newPhotoUrls.push(URL.createObjectURL(file));
    });

    setRoomForm({
      ...roomForm,
      photos: [...(roomForm.photos || []), ...newPhotoUrls]
    });
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <Bed className="w-4 h-4 text-emerald-600" /> Room Categories Management
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Configure room types, pricing matrices, guest capacity, and facilities
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Room Category
        </button>
      </div>

      {/* List of defined Room Categories */}
      {Array.isArray(value) && value.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {value.map((room, idx) => (
            <div
              key={room.id || idx}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
                      {roomTypesOptions.find(t => t.value === room.type)?.label || room.type}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{room.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(idx)}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-indigo-600 rounded-lg text-slate-500 transition cursor-pointer"
                      title="Edit Room"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(idx)}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-red-500 rounded-lg text-slate-500 transition cursor-pointer"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div>
                    <span className="block text-slate-400 font-medium">Capacity</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> {room.maxGuests} Guests
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Room Area</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Square className="w-3 h-3 text-slate-400" /> {room.areaSqFt} sq ft
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Bed Type</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {bedTypesOptions.find(b => b.value === room.bedType)?.label || room.bedType}
                    </span>
                  </div>
                </div>

                {/* Pricing Matrix Badges */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-150 dark:border-slate-800/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400">PRICING MATRIX</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">₹{room.basePrice}/night</span>
                    <span className="text-slate-400 text-[10px]">(Wknd: ₹{room.weekendPrice})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl space-y-2">
          <Bed className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Room Categories Created Yet</p>
          <p className="text-[10px] text-slate-400">Click "+ Add Room Category" above to configure your room options</p>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Bed className="w-5 h-5 text-emerald-600" />
                {editingIndex !== null ? 'Edit Room Category' : 'Configure New Room Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Room Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Himalayan View Suite"
                  value={roomForm.name}
                  onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Room Type Dropdown */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Room Category Type
                </label>
                <select
                  value={roomForm.type}
                  onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white"
                >
                  {roomTypesOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Bed Type Dropdown */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Bed Layout Type
                </label>
                <select
                  value={roomForm.bedType}
                  onChange={e => setRoomForm({ ...roomForm, bedType: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white"
                >
                  {bedTypesOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Guests */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Maximum Guest Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={roomForm.maxGuests}
                  onChange={e => setRoomForm({ ...roomForm, maxGuests: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Room Area */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Room Area (Sq Ft)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 280"
                  value={roomForm.areaSqFt}
                  onChange={e => setRoomForm({ ...roomForm, areaSqFt: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Pricing Matrix Section Header */}
              <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  PRICING MATRIX (INR)
                </span>
              </div>

              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Base Price (Mon-Thu)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={roomForm.basePrice}
                    onChange={e => setRoomForm({ ...roomForm, basePrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Weekend Price */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Weekend Price (Fri-Sun)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={roomForm.weekendPrice}
                    onChange={e => setRoomForm({ ...roomForm, weekendPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Festival Price */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Festival / Peak Season Price
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={roomForm.festivalPrice}
                    onChange={e => setRoomForm({ ...roomForm, festivalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Extra Guest Charge */}
              <div className="space-y-1.5">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                  Extra Guest Charge
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={roomForm.extraGuestCharge}
                    onChange={e => setRoomForm({ ...roomForm, extraGuestCharge: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Room Amenities Multi-Select */}
              <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide block">
                  Select Room Facilities & Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenitiesOptions.map(amenity => {
                    const isSelected = roomForm.amenities.includes(amenity.value);
                    return (
                      <button
                        type="button"
                        key={amenity.id}
                        onClick={() => handleToggleAmenity(amenity.value)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between text-[11px] font-bold transition select-none ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-800 border-slate-950'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="truncate">{amenity.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos upload */}
              <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wide block">
                  Room Photos
                </label>
                <label className="border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer block hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                  <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Click to add photos for this room</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {roomForm.photos && roomForm.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {roomForm.photos.map((url, i) => (
                      <div key={i} className="w-16 h-12 rounded-lg overflow-hidden border relative group">
                        <img src={url} alt="room" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Toggle */}
              <div className="md:col-span-2 flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Room Category Availability</span>
                  <span className="text-[10px] text-slate-400 block">Enable or temporarily pause booking requests for this room category</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomForm({ ...roomForm, isAvailable: !roomForm.isAvailable })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                    roomForm.isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {roomForm.isAvailable ? 'Active for Booking' : 'Blocked'}
                </button>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoom}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                Save Room Category
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
