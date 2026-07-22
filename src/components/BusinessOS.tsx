import React, { useState } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  Users, 
  Star, 
  TrendingUp, 
  Settings, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Camera, 
  FileText, 
  Lock, 
  ShieldCheck, 
  Eye, 
  RefreshCw, 
  Bell, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Car, 
  Utensils, 
  Compass, 
  Award, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Search, 
  Filter, 
  Check, 
  X, 
  CreditCard, 
  Trash2, 
  ChevronDown, 
  Power, 
  Zap, 
  Tag, 
  Upload, 
  Image as ImageIcon,
  Copy,
  MessageSquare,
  PhoneCall,
  Download,
  Sliders,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { businessConfigurations } from './businessConfigurations';

interface BusinessOSProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
}

// Generates next 14 calendar dates starting today
const generateNext14Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    dates.push({ iso, dayName, dayNum, monthName });
  }
  return dates;
};

// Initial Mock Data tuned for quick business operations
const INITIAL_ROOMS = [
  { 
    id: 'rm-101', 
    name: 'Deluxe Himalayan View Suite', 
    category: 'Suite', 
    basePrice: 3200, 
    weekendPrice: 3800,
    capacity: 3, 
    isAvailable: true, 
    blockedDates: ['2026-07-24', '2026-07-25'], 
    amenities: ['Mountain View', 'Private Balcony', 'High-Speed Wifi', 'Geyser', 'Room Heater'],
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600'] 
  },
  { 
    id: 'rm-102', 
    name: 'Valley View Cottage Room', 
    category: 'Cottage', 
    basePrice: 2400, 
    weekendPrice: 2800,
    capacity: 2, 
    isAvailable: true, 
    blockedDates: [], 
    amenities: ['Valley View', 'Wooden Finish', 'Geyser', 'Tea Maker'],
    photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600'] 
  },
  { 
    id: 'rm-103', 
    name: 'Family Pine Wood Duplex', 
    category: 'Duplex', 
    basePrice: 4800, 
    weekendPrice: 5500,
    capacity: 5, 
    isAvailable: false, 
    blockedDates: ['2026-07-22', '2026-07-23'], 
    amenities: ['2 King Beds', 'Fireplace', 'Mountain View', 'Geyser', 'Kitchenette'],
    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600'] 
  }
];

const INITIAL_FLEET = [
  { 
    id: 'veh-1', 
    name: 'Toyota Innova Crysta 4x4', 
    regNo: 'HP 01 AB 1234', 
    type: 'SUV / MPV', 
    capacity: 7, 
    perKmRate: 22, 
    outstationBaseFare: 3500,
    driverAssigned: 'Ramesh Kumar (+91 98160 12345)', 
    isAvailable: true, 
    serviceAreas: ['Manali - Solang Valley', 'Rohtang Pass', 'Kullu Airport Drop', 'Leh Highway Expedition'],
    blockedDates: [], 
    photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'] 
  },
  { 
    id: 'veh-2', 
    name: 'Mahindra Scorpio-N Offroad', 
    regNo: 'HP 02 CD 5678', 
    type: '4x4 Offroad SUV', 
    capacity: 6, 
    perKmRate: 25, 
    outstationBaseFare: 4000,
    driverAssigned: 'Sanjay Verma (+91 98170 54321)', 
    isAvailable: true, 
    serviceAreas: ['Spiti Valley Circuit', 'Atal Tunnel Circuit', 'Sarchu Expedition'],
    blockedDates: ['2026-07-26'], 
    photos: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'] 
  }
];

const INITIAL_TABLES = [
  { id: 'tbl-1', name: 'Table 01 - Panoramic Window Deck', capacity: 4, section: 'Main Dining', status: 'Available' },
  { id: 'tbl-2', name: 'Table 02 - Fireplace Cozy Corner', capacity: 2, section: 'Lounge', status: 'Occupied' },
  { id: 'tbl-3', name: 'Table 03 - Pine Terrace Sunset View', capacity: 6, section: 'Outdoor Terrace', status: 'Reserved' },
  { id: 'tbl-4', name: 'Table 04 - VIP Family Alcove', capacity: 8, section: 'VIP Dining', status: 'Available' }
];

const INITIAL_MENU = [
  { id: 'menu-1', name: 'Himachali Siddu with Pure Desi Ghee', category: 'Local Specialties', price: 280, isVeg: true, inStock: true },
  { id: 'menu-2', name: 'Fresh Trout Fish Curry with Red Rice', category: 'Mains', price: 540, isVeg: false, inStock: true },
  { id: 'menu-3', name: 'Rhododendron Flower Herbal Tea Pot', category: 'Beverages', price: 160, isVeg: true, inStock: true },
  { id: 'menu-4', name: 'Chha Gosht Traditional Lamb Gravy', category: 'Mains', price: 620, isVeg: false, inStock: false }
];

const INITIAL_TOURS = [
  { 
    id: 'tr-1', 
    name: 'Solang Valley Snow Trek & Zip Line', 
    duration: '1 Day', 
    pricePerAdult: 1800, 
    pricePerChild: 1200, 
    maxCapacity: 15, 
    leadGuide: 'Anil Sharma (Senior Trek Guide)', 
    isAcceptingBookings: true,
    schedule: 'Daily at 08:30 AM',
    blockedDates: ['2026-07-25'],
    photos: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=600']
  },
  { 
    id: 'tr-2', 
    name: 'Rohtang Pass Glacial Exploration & Photography', 
    duration: 'Full Day', 
    pricePerAdult: 3500, 
    pricePerChild: 2200, 
    maxCapacity: 10, 
    leadGuide: 'Priya Negi (Local Alpine Specialist)', 
    isAcceptingBookings: true,
    schedule: 'Tue, Thu, Sat at 06:00 AM',
    blockedDates: [],
    photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600']
  }
];

const INITIAL_BOOKINGS = [
  { id: 'BK-9821', guestName: 'Amit Sharma', phone: '+91 98765 43210', dateIso: '2026-07-22', unit: 'Deluxe Himalayan Suite 101', status: 'Confirmed', checkInState: 'Pending', total: 6400, paymentState: 'Paid' },
  { id: 'BK-9822', guestName: 'Sneha Patel', phone: '+91 98111 22233', dateIso: '2026-07-22', unit: 'Valley View Cottage Room', status: 'Pending', checkInState: 'Pending', total: 2400, paymentState: 'Pending' },
  { id: 'BK-9823', guestName: 'Rohan Mehta', phone: '+91 97222 33344', dateIso: '2026-07-23', unit: 'Toyota Innova (Manali-Kasol)', status: 'Confirmed', checkInState: 'Checked In', total: 4500, paymentState: 'Paid' },
  { id: 'BK-9824', guestName: 'Priya Malhotra', phone: '+91 98999 11122', dateIso: '2026-07-24', unit: 'Solang Valley Snow Trek', status: 'Completed', checkInState: 'Checked Out', total: 3600, paymentState: 'Paid' }
];

const INITIAL_REVIEWS = [
  { id: 'rev-1', guestName: 'Vikram & Ananya', rating: 5, date: '18 Jul 2026', comment: 'Extremely clean rooms with stunning snow peak views. Warm Himachali hospitality and Siddu was delicious!', reply: 'Thank you Vikram! We look forward to welcoming you back during winter snowfall.', resolved: true },
  { id: 'rev-2', guestName: 'Karan Mehra', rating: 4, date: '10 Jul 2026', comment: 'Great driver and smooth cab ride from Kullu airport to Solang. Highly recommended.', reply: '', resolved: false }
];

export default function BusinessOS({
  user,
  onUpdateUser,
  navigate,
  setNotification
}: BusinessOSProps) {

  // Current active business type
  const [activeBusinessType, setActiveBusinessType] = useState<string>(() => {
    if (user?.currentBusinessType) return user.currentBusinessType;
    if (user?.businessType) return user.businessType === 'cab' ? 'taxi_operator' : user.businessType;
    return 'homestay';
  });

  // Business global status toggle (🟢 Accepting Bookings / 🔴 Closed)
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Today at 09:42 AM');

  // Next 14 days calendar generator
  const next14Days = generateNext14Days();

  // Entities State
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [tours, setTours] = useState(INITIAL_TOURS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  // Booking Preferences State
  const [bookingPreferences, setBookingPreferences] = useState({
    method: 'both', // 'direct_booking' | 'message_before_booking' | 'both' | 'booking_request' | 'temporarily_closed'
    autoAccept: false,
    requireApproval: true,
    minAdvanceBooking: '2_hours',
    maxAdvanceBooking: '90_days',
    instantBooking: true,
    messageBeforeBooking: true,
  });

  // Closed Marketplace Business Metrics
  const [businessMetrics, setBusinessMetrics] = useState({
    totalEnquiries: 48,
    conversionRate: '72%',
    avgResponseTime: '8 mins',
    quoteAcceptanceRate: '84%',
    bookingAcceptanceRate: '96%',
    missedEnquiries: 1,
    cancelledRequests: 1,
    completedBookings: 142
  });
  const [pricingRules, setPricingRules] = useState({
    basePrice: 3200,
    weekendSurgePct: 20,
    festivalSurgePct: 35,
    extraGuestFee: 800,
    perKmRate: 22,
    minFare: 500,
    nightCharge: 400,
    outstationRate: 3500,
    menuDiscountPct: 10,
    happyHourActive: false,
    adultTourPrice: 1800,
    childTourPrice: 1200
  });

  // Modal States
  const [activeCalendarModal, setActiveCalendarModal] = useState<{ type: 'room' | 'fleet' | 'tour', id: string, name: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCap, setNewItemCap] = useState('');

  // Business Config info
  const config = businessConfigurations[activeBusinessType] || businessConfigurations.homestay;

  // Switch Business Type
  const handleSwitchBusinessType = (newType: string) => {
    setActiveBusinessType(newType);
    onUpdateUser({
      ...user,
      currentBusinessType: newType
    });
    setNotification({
      type: 'success',
      message: `Switched Control Center to [${businessConfigurations[newType]?.name || newType}]`
    });
  };

  // 1-Click Availability Toggle
  const toggleItemAvailability = (type: 'room' | 'fleet' | 'tour' | 'menu', id: string) => {
    if (type === 'room') {
      setRooms(rooms.map(r => r.id === id ? { ...r, isAvailable: !r.isAvailable } : r));
    } else if (type === 'fleet') {
      setFleet(fleet.map(f => f.id === id ? { ...f, isAvailable: !f.isAvailable } : f));
    } else if (type === 'tour') {
      setTours(tours.map(t => t.id === id ? { ...t, isAcceptingBookings: !t.isAcceptingBookings } : t));
    } else if (type === 'menu') {
      setMenu(menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m));
    }

    setLastUpdatedTime(`Just now at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setNotification({
      type: 'success',
      message: `Updated availability status!`
    });
  };

  // Inline Price Change
  const handleInlinePriceChange = (type: 'room' | 'roomWeekend' | 'fleet' | 'tourAdult' | 'tourChild' | 'menu', id: string, val: string) => {
    const num = parseFloat(val) || 0;
    if (type === 'room') {
      setRooms(rooms.map(r => r.id === id ? { ...r, basePrice: num } : r));
    } else if (type === 'roomWeekend') {
      setRooms(rooms.map(r => r.id === id ? { ...r, weekendPrice: num } : r));
    } else if (type === 'fleet') {
      setFleet(fleet.map(f => f.id === id ? { ...f, perKmRate: num } : f));
    } else if (type === 'tourAdult') {
      setTours(tours.map(t => t.id === id ? { ...t, pricePerAdult: num } : t));
    } else if (type === 'tourChild') {
      setTours(tours.map(t => t.id === id ? { ...t, pricePerChild: num } : t));
    } else if (type === 'menu') {
      setMenu(menu.map(m => m.id === id ? { ...m, price: num } : m));
    }
  };

  // Date Block Toggle inside Calendar Popup
  const toggleDateBlock = (type: 'room' | 'fleet' | 'tour', itemId: string, dateIso: string) => {
    if (type === 'room') {
      setRooms(rooms.map(r => {
        if (r.id === itemId) {
          const isBlocked = r.blockedDates.includes(dateIso);
          const next = isBlocked ? r.blockedDates.filter(d => d !== dateIso) : [...r.blockedDates, dateIso];
          return { ...r, blockedDates: next };
        }
        return r;
      }));
    } else if (type === 'fleet') {
      setFleet(fleet.map(f => {
        if (f.id === itemId) {
          const isBlocked = f.blockedDates.includes(dateIso);
          const next = isBlocked ? f.blockedDates.filter(d => d !== dateIso) : [...f.blockedDates, dateIso];
          return { ...f, blockedDates: next };
        }
        return f;
      }));
    } else if (type === 'tour') {
      setTours(tours.map(t => {
        if (t.id === itemId) {
          const isBlocked = t.blockedDates.includes(dateIso);
          const next = isBlocked ? t.blockedDates.filter(d => d !== dateIso) : [...t.blockedDates, dateIso];
          return { ...t, blockedDates: next };
        }
        return t;
      }));
    }

    setLastUpdatedTime(`Just now at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  // Duplicate Item
  const handleDuplicateItem = (type: 'room' | 'fleet' | 'tour', id: string) => {
    if (type === 'room') {
      const item = rooms.find(r => r.id === id);
      if (item) {
        setRooms([...rooms, { ...item, id: 'rm-' + Date.now().toString().slice(-4), name: `${item.name} (Copy)` }]);
      }
    } else if (type === 'fleet') {
      const item = fleet.find(f => f.id === id);
      if (item) {
        setFleet([...fleet, { ...item, id: 'veh-' + Date.now().toString().slice(-4), name: `${item.name} (Copy)` }]);
      }
    } else if (type === 'tour') {
      const item = tours.find(t => t.id === id);
      if (item) {
        setTours([...tours, { ...item, id: 'tr-' + Date.now().toString().slice(-4), name: `${item.name} (Copy)` }]);
      }
    }
    setNotification({ type: 'success', message: 'Item duplicated successfully' });
  };

  // Delete Item
  const handleDeleteItem = (type: 'room' | 'fleet' | 'tour' | 'menu', id: string) => {
    if (type === 'room') setRooms(rooms.filter(r => r.id !== id));
    if (type === 'fleet') setFleet(fleet.filter(f => f.id !== id));
    if (type === 'tour') setTours(tours.filter(t => t.id !== id));
    if (type === 'menu') setMenu(menu.filter(m => m.id !== id));
    setNotification({ type: 'success', message: 'Item removed from control center' });
  };

  // Create New Item
  const handleAddItemSubmit = () => {
    if (!newItemName.trim()) return;
    const priceNum = parseFloat(newItemPrice) || 2000;
    const capNum = parseInt(newItemCap) || 2;

    if (activeBusinessType === 'homestay' || activeBusinessType === 'hotel') {
      setRooms([
        ...rooms,
        {
          id: 'rm-' + Date.now().toString().slice(-4),
          name: newItemName,
          category: newItemCategory || 'Deluxe Room',
          basePrice: priceNum,
          weekendPrice: Math.round(priceNum * 1.2),
          capacity: capNum,
          isAvailable: true,
          blockedDates: [],
          amenities: ['Mountain View', 'Geyser', 'Wifi'],
          photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600']
        }
      ]);
    } else if (activeBusinessType === 'taxi_operator') {
      setFleet([
        ...fleet,
        {
          id: 'veh-' + Date.now().toString().slice(-4),
          name: newItemName,
          regNo: 'HP ' + Math.floor(10 + Math.random() * 89) + ' AB ' + Math.floor(1000 + Math.random() * 8999),
          type: newItemCategory || 'SUV 4x4',
          capacity: capNum || 6,
          perKmRate: priceNum || 22,
          outstationBaseFare: 3500,
          driverAssigned: 'Ramesh Kumar (+91 98160 12345)',
          isAvailable: true,
          serviceAreas: ['Local & Outstation Tour'],
          blockedDates: [],
          photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600']
        }
      ]);
    } else if (activeBusinessType === 'restaurant') {
      if (newItemCategory === 'Table') {
        setTables([
          ...tables,
          { id: 'tbl-' + Date.now().toString().slice(-4), name: newItemName, capacity: capNum || 4, section: 'Main Dining', status: 'Available' }
        ]);
      } else {
        setMenu([
          ...menu,
          { id: 'menu-' + Date.now().toString().slice(-4), name: newItemName, category: newItemCategory || 'Specialties', price: priceNum, isVeg: true, inStock: true }
        ]);
      }
    } else {
      setTours([
        ...tours,
        {
          id: 'tr-' + Date.now().toString().slice(-4),
          name: newItemName,
          duration: '1 Day',
          pricePerAdult: priceNum,
          pricePerChild: Math.round(priceNum * 0.6),
          maxCapacity: capNum || 10,
          leadGuide: 'Anil Sharma',
          isAcceptingBookings: true,
          schedule: 'Daily at 08:00 AM',
          blockedDates: [],
          photos: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=600']
        }
      ]);
    }

    setNewItemName('');
    setNewItemCategory('');
    setNewItemPrice('');
    setNewItemCap('');
    setShowAddModal(false);
    setNotification({ type: 'success', message: `Added "${newItemName}" to Business Control Center!` });
  };

  // Booking Check In / Check Out toggle
  const handleBookingStatusChange = (bookingId: string, nextState: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, checkInState: nextState } : b));
    setNotification({ type: 'success', message: `Booking ${bookingId} set to ${nextState}` });
  };

  // Save Review Reply
  const handleSaveReviewReply = (revId: string) => {
    setReviews(reviews.map(r => r.id === revId ? { ...r, reply: replyText, resolved: true } : r));
    setEditingReplyId(null);
    setReplyText('');
    setNotification({ type: 'success', message: 'Reply posted & review marked resolved!' });
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen rounded-3xl border border-slate-800 shadow-2xl font-sans p-3 sm:p-5 md:p-6 space-y-6">
      
      {/* ========================================================= */}
      {/* 1. GLOBAL HEADER & CONTROL PANEL STATUS */}
      {/* ========================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-emerald-400/30 shrink-0">
            {config.name.substring(0, 1)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user?.partnerDetails?.[activeBusinessType]?.formData?.registered_name || 
                 user?.partnerDetails?.[activeBusinessType]?.formData?.hotel_name || 
                 `HillyTrip ${config.name}`}
              </h1>

              {/* Verified Badge */}
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner</span>
              </span>

              {/* Health Score */}
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-sky-400" />
                <span>98% Business Health</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
              <span className="text-emerald-400 font-bold uppercase">{config.name} Workspace</span>
              <span>•</span>
              <span className="text-slate-300">Last updated: <strong className="text-white">{lastUpdatedTime}</strong></span>
            </div>
          </div>
        </div>

        {/* Global Action Header Right: Status Switcher + Business Profile Button + Workspace Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
          
          {/* 🟢/🔴 ONE-CLICK GLOBAL STATUS TOGGLE */}
          <button
            onClick={() => {
              const next = !isStoreOpen;
              setIsStoreOpen(next);
              setLastUpdatedTime(`Just now at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
              setNotification({
                type: 'success',
                message: next ? '🟢 Business status updated: ACCEPTING BOOKINGS' : '🔴 Business status updated: CLOSED'
              });
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition cursor-pointer shadow-md ${
              isStoreOpen 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isStoreOpen ? '🟢 ACCEPTING BOOKINGS' : '🔴 CLOSED / PAUSED'}</span>
          </button>

          {/* Business Profile & Settings Modal Button */}
          <button
            onClick={() => setShowSetupModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Business Setup</span>
          </button>

          {/* Workspace Type Selector */}
          <select
            value={activeBusinessType}
            onChange={(e) => handleSwitchBusinessType(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-black px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="homestay">🏡 Homestay Control</option>
            <option value="hotel">🏨 Hotel Control</option>
            <option value="taxi_operator">🚗 Taxi Operator</option>
            <option value="tour_operator">🏔️ Tour Operator</option>
            <option value="restaurant">🍽️ Restaurant Control</option>
            <option value="guide">🧭 Local Guide</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TODAY'S SUMMARY METRICS HUB */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Today's Bookings</div>
          <div className="text-xl font-black text-white">4 Active</div>
          <div className="text-[10px] text-emerald-400 font-bold">+2 vs Yesterday</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Today's Revenue</div>
          <div className="text-xl font-black text-emerald-400">₹12,800</div>
          <div className="text-[10px] text-slate-400 font-bold">100% Guaranteed</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Enquiries</div>
          <div className="text-xl font-black text-sky-400">{businessMetrics.totalEnquiries}</div>
          <div className="text-[10px] text-sky-400 font-bold">On-Platform</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Conversion Rate</div>
          <div className="text-xl font-black text-emerald-400">{businessMetrics.conversionRate}</div>
          <div className="text-[10px] text-emerald-400 font-bold">Top 10% Host</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Response</div>
          <div className="text-xl font-black text-teal-400">{businessMetrics.avgResponseTime}</div>
          <div className="text-[10px] text-teal-400 font-bold">Superfast</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quote Accept</div>
          <div className="text-xl font-black text-amber-400">{businessMetrics.quoteAcceptanceRate}</div>
          <div className="text-[10px] text-amber-400 font-bold">High Trust</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking Accept</div>
          <div className="text-xl font-black text-purple-400">{businessMetrics.bookingAcceptanceRate}</div>
          <div className="text-[10px] text-purple-400 font-bold">Preferred Host</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completed</div>
          <div className="text-xl font-black text-indigo-400">{businessMetrics.completedBookings}</div>
          <div className="text-[10px] text-indigo-400 font-bold">0 Missed Today</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2B. BOOKING PREFERENCES & CLOSED MARKETPLACE CONTROLS */}
      {/* ========================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-black text-white">Booking Preferences &amp; Closed Marketplace Control</h2>
              <p className="text-xs text-slate-400">Configure how travelers contact and book your business on HillyTrip</p>
            </div>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Platform Protected</span>
          </span>
        </div>

        {/* 5 Primary Booking Method Radio Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              id: 'direct_booking',
              title: 'Direct Booking',
              desc: 'Travelers can book directly with instant payment',
              badge: 'Instant'
            },
            {
              id: 'message_before_booking',
              title: 'Message Before Booking',
              desc: 'Travelers must message you before completing payment',
              badge: 'Consultative'
            },
            {
              id: 'both',
              title: 'Both Options',
              desc: 'Show both [Book Now] and [Message Business] CTA buttons',
              badge: 'Recommended'
            },
            {
              id: 'booking_request',
              title: 'Booking Request',
              desc: 'Manual approval required before guest payment',
              badge: 'Approval Required'
            },
            {
              id: 'temporarily_closed',
              title: 'Temporarily Closed',
              desc: 'Pause all incoming bookings without deleting listing',
              badge: 'Paused'
            }
          ].map((pref) => (
            <div
              key={pref.id}
              onClick={() => {
                setBookingPreferences({ ...bookingPreferences, method: pref.id });
                setNotification({ type: 'success', message: `Booking preference updated to: ${pref.title}` });
              }}
              className={`p-4 rounded-xl border transition cursor-pointer space-y-2 flex flex-col justify-between ${
                bookingPreferences.method === pref.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs">{pref.title}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    bookingPreferences.method === pref.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pref.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{pref.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <Check className={`w-3 h-3 ${bookingPreferences.method === pref.id ? 'opacity-100' : 'opacity-0'}`} />
                <span>{bookingPreferences.method === pref.id ? 'Active Preference' : 'Select'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Booking Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Auto-Accept Bookings</label>
              <input
                type="checkbox"
                checked={bookingPreferences.autoAccept}
                onChange={(e) => setBookingPreferences({ ...bookingPreferences, autoAccept: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400">Automatically confirm instant payments</p>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Require Host Approval</label>
              <input
                type="checkbox"
                checked={bookingPreferences.requireApproval}
                onChange={(e) => setBookingPreferences({ ...bookingPreferences, requireApproval: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400">Review guest requests before accepting</p>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Min Advance Booking</label>
            <select
              value={bookingPreferences.minAdvanceBooking}
              onChange={(e) => setBookingPreferences({ ...bookingPreferences, minAdvanceBooking: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="no_min">No Minimum</option>
              <option value="2_hours">2 Hours Notice</option>
              <option value="12_hours">12 Hours Notice</option>
              <option value="1_day">1 Day Notice</option>
              <option value="2_days">2 Days Notice</option>
            </select>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Max Advance Booking</label>
            <select
              value={bookingPreferences.maxAdvanceBooking}
              onChange={(e) => setBookingPreferences({ ...bookingPreferences, maxAdvanceBooking: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="30_days">30 Days Ahead</option>
              <option value="60_days">60 Days Ahead</option>
              <option value="90_days">90 Days Ahead</option>
              <option value="180_days">180 Days Ahead</option>
              <option value="365_days">365 Days Ahead</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK ACTIONS BAR (Tailored by Business Type) */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <h2 className="text-base font-black text-white">Daily Operational Launchpad</h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeBusinessType === 'homestay' || activeBusinessType === 'hotel' ? '+ Add Room' :
               activeBusinessType === 'taxi_operator' ? '+ Add Vehicle' :
               activeBusinessType === 'restaurant' ? '+ Add Item / Table' :
               '+ Add Tour / Package'}
            </span>
          </button>
        </div>

        {/* Quick Action Large Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {(activeBusinessType === 'homestay' || activeBusinessType === 'hotel') && (
            <>
              <button onClick={() => setShowAddModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-emerald-400">+ Add Room</div>
                <div className="text-[10px] text-slate-400">New room listing</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('pricing-rules-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-amber-400">⚡ Change Price</div>
                <div className="text-[10px] text-slate-400">Surge &amp; weekend rates</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-sky-400">📅 Block Dates</div>
                <div className="text-[10px] text-slate-400">In-item calendar</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-teal-300">🖼️ Upload Photos</div>
                <div className="text-[10px] text-slate-400">Gallery update</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('recent-bookings-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-purple-400">📋 View Bookings</div>
                <div className="text-[10px] text-slate-400">Check-in list</div>
              </button>

              <button onClick={() => setShowSetupModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-pink-400">🏢 Room Categories</div>
                <div className="text-[10px] text-slate-400">Suite, Cottage, Duplex</div>
              </button>
            </>
          )}

          {activeBusinessType === 'taxi_operator' && (
            <>
              <button onClick={() => setShowAddModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-emerald-400">+ Add Taxi</div>
                <div className="text-[10px] text-slate-400">New cab vehicle</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-sky-400">👨‍✈️ Assign Driver</div>
                <div className="text-[10px] text-slate-400">Driver allocation</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('pricing-rules-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-amber-400">💬 Set Quote / Fare</div>
                <div className="text-[10px] text-slate-400">Per KM &amp; outstation</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-rose-400">🛑 Block Vehicle</div>
                <div className="text-[10px] text-slate-400">Maintenance lock</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('recent-bookings-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-purple-400">🚕 Cab Bookings</div>
                <div className="text-[10px] text-slate-400">Trips today</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('payments-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-teal-300">💳 View Payments</div>
                <div className="text-[10px] text-slate-400">Driver settlements</div>
              </button>
            </>
          )}

          {activeBusinessType === 'restaurant' && (
            <>
              <button onClick={() => setShowAddModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-emerald-400">+ Add Table</div>
                <div className="text-[10px] text-slate-400">Floor seating</div>
              </button>

              <button onClick={() => setShowAddModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-sky-400">+ Add Menu Item</div>
                <div className="text-[10px] text-slate-400">Dishes &amp; Drinks</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-amber-400">⚡ Menu Price</div>
                <div className="text-[10px] text-slate-400">Direct inline rate</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('pricing-rules-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-teal-300">🏷️ Offers &amp; Deals</div>
                <div className="text-[10px] text-slate-400">Discounts &amp; Thalis</div>
              </button>

              <button onClick={() => setShowSetupModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-purple-400">⏰ Working Hours</div>
                <div className="text-[10px] text-slate-400">Opening &amp; closing</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('recent-bookings-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-pink-400">📅 Reservations</div>
                <div className="text-[10px] text-slate-400">Table bookings</div>
              </button>
            </>
          )}

          {(activeBusinessType === 'tour_operator' || activeBusinessType === 'guide') && (
            <>
              <button onClick={() => setShowAddModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-emerald-400">+ Add Tour</div>
                <div className="text-[10px] text-slate-400">New trek package</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-sky-400">📅 Add Departure</div>
                <div className="text-[10px] text-slate-400">In-tour calendar</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('business-items-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-amber-400">👨‍🦯 Assign Guide</div>
                <div className="text-[10px] text-slate-400">Guide allocation</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('pricing-rules-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-teal-300">⚡ Change Price</div>
                <div className="text-[10px] text-slate-400">Adult &amp; Child rates</div>
              </button>

              <button onClick={() => setShowSetupModal(true)} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-purple-400">📜 Certificates</div>
                <div className="text-[10px] text-slate-400">Govt Badges</div>
              </button>

              <button onClick={() => {
                const el = document.getElementById('recent-bookings-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="bg-slate-900/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 text-left space-y-1 transition cursor-pointer">
                <div className="text-xs font-black text-pink-400">🎟️ Tour Bookings</div>
                <div className="text-[10px] text-slate-400">Headcounts</div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. BUSINESS ITEMS (CARDS WITH DIRECT INLINE CONTROLS) */}
      {/* ========================================================= */}
      <div id="business-items-section" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              <span>
                {activeBusinessType === 'homestay' || activeBusinessType === 'hotel' ? 'Rooms & Units' :
                 activeBusinessType === 'taxi_operator' ? 'Vehicle Fleet' :
                 activeBusinessType === 'restaurant' ? 'Tables & Menu Dishes' :
                 'Tours & Packages'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Edit prices, availability, calendars, and details directly without leaving this page.</p>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
            1-Click Interactive Cards
          </span>
        </div>

        {/* HOMESTAY / HOTEL ROOM CARDS */}
        {(activeBusinessType === 'homestay' || activeBusinessType === 'hotel') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between space-y-3 hover:border-slate-700 transition">
                
                {/* Room Image Header */}
                <div className="relative h-44 bg-slate-950">
                  <img src={room.photos[0]} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-slate-200 border border-slate-800">
                    {room.category} • {room.capacity} Guests
                  </div>

                  {/* 1-Click Availability Toggle Button */}
                  <button
                    onClick={() => toggleItemAvailability('room', room.id)}
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 transition cursor-pointer border ${
                      room.isAvailable 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400' 
                        : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{room.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm text-white">{room.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{room.amenities.join(' • ')}</p>
                  </div>

                  {/* Inline Editable Prices */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Direct Price Tuning</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Base Rate (₹)</label>
                        <input
                          type="number"
                          value={room.basePrice}
                          onChange={(e) => handleInlinePriceChange('room', room.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Weekend Rate (₹)</label>
                        <input
                          type="number"
                          value={room.weekendPrice}
                          onChange={(e) => handleInlinePriceChange('roomWeekend', room.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Direct Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <button
                      onClick={() => setActiveCalendarModal({ type: 'room', id: room.id, name: room.name })}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Calendar ({room.blockedDates.length} Locks)</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateItem('room', room.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-slate-700"
                      title="Duplicate Room"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem('room', room.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-rose-500/30"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAXI VEHICLE CARDS */}
        {activeBusinessType === 'taxi_operator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fleet.map(veh => (
              <div key={veh.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between space-y-3 p-4 hover:border-slate-700 transition">
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={veh.photos[0]} alt={veh.name} className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h3 className="font-black text-sm text-white">{veh.name}</h3>
                      <div className="text-xs text-emerald-400 font-mono font-bold mt-0.5">{veh.regNo} ({veh.type})</div>
                      <p className="text-[11px] text-slate-400">Capacity: {veh.capacity} Passengers</p>
                    </div>
                  </div>

                  {/* 1-Click Status Switcher */}
                  <button
                    onClick={() => toggleItemAvailability('fleet', veh.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1.5 transition cursor-pointer border shrink-0 ${
                      veh.isAvailable 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                        : 'bg-rose-600 text-white border-rose-500'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{veh.isAvailable ? 'ACTIVE' : 'OFF DUTY'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">Per KM Fare (₹)</label>
                    <input
                      type="number"
                      value={veh.perKmRate}
                      onChange={(e) => handleInlinePriceChange('fleet', veh.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">Assigned Driver</label>
                    <div className="text-xs text-sky-400 font-bold truncate mt-1.5">{veh.driverAssigned.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Card Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveCalendarModal({ type: 'fleet', id: veh.id, name: veh.name })}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vehicle Calendar</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateItem('fleet', veh.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem('fleet', veh.id)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESTAURANT TABLES & MENU CARDS */}
        {activeBusinessType === 'restaurant' && (
          <div className="space-y-4">
            
            {/* TABLES SEATING MAP */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">Live Dining Tables Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tables.map(tbl => (
                  <div key={tbl.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <div className="text-xs font-black text-white">{tbl.name}</div>
                    <div className="text-[10px] text-slate-400">{tbl.capacity} Seats • {tbl.section}</div>

                    <div className="flex gap-1 pt-1">
                      {['Available', 'Occupied', 'Reserved'].map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            setTables(tables.map(t => t.id === tbl.id ? { ...t, status: st } : t));
                            setNotification({ type: 'success', message: `${tbl.name} status: ${st}` });
                          }}
                          className={`flex-1 text-[9px] font-black py-1 rounded-md transition cursor-pointer border ${
                            tbl.status === st 
                              ? st === 'Available' ? 'bg-emerald-600 text-white border-emerald-500' :
                                st === 'Occupied' ? 'bg-rose-600 text-white border-rose-500' :
                                'bg-amber-600 text-white border-amber-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {st.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MENU ITEMS DISHES */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Menu Dishes &amp; Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {menu.map(dish => (
                  <div key={dish.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-xs text-white block">{dish.name}</span>
                        <span className="text-[10px] text-slate-400">{dish.category}</span>
                      </div>

                      <button
                        onClick={() => toggleItemAvailability('menu', dish.id)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          dish.inStock ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {dish.inStock ? 'IN STOCK' : 'SOLD OUT'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold">Price: ₹</span>
                      <input
                        type="number"
                        value={dish.price}
                        onChange={(e) => handleInlinePriceChange('menu', dish.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-black text-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOUR OPERATOR & GUIDE CARDS */}
        {(activeBusinessType === 'tour_operator' || activeBusinessType === 'guide') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tours.map(tr => (
              <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3 hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={tr.photos[0]} alt={tr.name} className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h3 className="font-black text-sm text-white">{tr.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{tr.duration} • Guide: {tr.leadGuide}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleItemAvailability('tour', tr.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1.5 transition cursor-pointer border shrink-0 ${
                      tr.isAcceptingBookings 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                        : 'bg-rose-600 text-white border-rose-500'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{tr.isAcceptingBookings ? 'ACCEPTING' : 'STOPPED'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">Adult Price (₹)</label>
                    <input
                      type="number"
                      value={tr.pricePerAdult}
                      onChange={(e) => handleInlinePriceChange('tourAdult', tr.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">Child Price (₹)</label>
                    <input
                      type="number"
                      value={tr.pricePerChild}
                      onChange={(e) => handleInlinePriceChange('tourChild', tr.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500 mt-1"
                    />
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveCalendarModal({ type: 'tour', id: tr.id, name: tr.name })}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Departure Calendar</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateItem('tour', tr.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem('tour', tr.id)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold p-2 rounded-xl transition cursor-pointer border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. QUICK PRICING PANEL */}
      {/* ========================================================= */}
      <div id="pricing-rules-panel" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">Quick Pricing &amp; Surge Rules Panel</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">1-Click Live Adjustment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(activeBusinessType === 'homestay' || activeBusinessType === 'hotel') && (
            <>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Weekend Surge (%)</label>
                <input
                  type="number"
                  value={pricingRules.weekendSurgePct}
                  onChange={(e) => setPricingRules({ ...pricingRules, weekendSurgePct: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Festival Surge (%)</label>
                <input
                  type="number"
                  value={pricingRules.festivalSurgePct}
                  onChange={(e) => setPricingRules({ ...pricingRules, festivalSurgePct: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-rose-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Extra Guest Fee (₹)</label>
                <input
                  type="number"
                  value={pricingRules.extraGuestFee}
                  onChange={(e) => setPricingRules({ ...pricingRules, extraGuestFee: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Save Pricing Rules</div>
                  <div className="text-[10px] text-slate-400">Apply to all active units</div>
                </div>
                <button
                  onClick={() => setNotification({ type: 'success', message: 'Pricing rules updated live across all listings!' })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </>
          )}

          {activeBusinessType === 'taxi_operator' && (
            <>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Base Per KM Rate (₹)</label>
                <input
                  type="number"
                  value={pricingRules.perKmRate}
                  onChange={(e) => setPricingRules({ ...pricingRules, perKmRate: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Minimum Fare (₹)</label>
                <input
                  type="number"
                  value={pricingRules.minFare}
                  onChange={(e) => setPricingRules({ ...pricingRules, minFare: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-sky-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Outstation Flat (₹)</label>
                <input
                  type="number"
                  value={pricingRules.outstationRate}
                  onChange={(e) => setPricingRules({ ...pricingRules, outstationRate: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-purple-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Save Cab Rates</div>
                  <div className="text-[10px] text-slate-400">Live for fare quotes</div>
                </div>
                <button
                  onClick={() => setNotification({ type: 'success', message: 'Taxi fare rules updated live!' })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </>
          )}

          {activeBusinessType === 'restaurant' && (
            <>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Thali Discount (%)</label>
                <input
                  type="number"
                  value={pricingRules.menuDiscountPct}
                  onChange={(e) => setPricingRules({ ...pricingRules, menuDiscountPct: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-2">
                <div>
                  <div className="text-xs font-bold text-white">Happy Hour Special</div>
                  <div className="text-[10px] text-slate-400">15% off beverages 4 PM - 7 PM</div>
                </div>
                <button
                  onClick={() => {
                    const next = !pricingRules.happyHourActive;
                    setPricingRules({ ...pricingRules, happyHourActive: next });
                    setNotification({ type: 'success', message: next ? 'Happy Hour Activated!' : 'Happy Hour Deactivated' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                    pricingRules.happyHourActive ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {pricingRules.happyHourActive ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            </>
          )}

          {(activeBusinessType === 'tour_operator' || activeBusinessType === 'guide') && (
            <>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Adult Base Rate (₹)</label>
                <input
                  type="number"
                  value={pricingRules.adultTourPrice}
                  onChange={(e) => setPricingRules({ ...pricingRules, adultTourPrice: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Child Rate (₹)</label>
                <input
                  type="number"
                  value={pricingRules.childTourPrice}
                  onChange={(e) => setPricingRules({ ...pricingRules, childTourPrice: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-sky-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-2">
                <div>
                  <div className="text-xs font-bold text-white">Save Tour Rates</div>
                  <div className="text-[10px] text-slate-400">Updates default trek prices</div>
                </div>
                <button
                  onClick={() => setNotification({ type: 'success', message: 'Tour rates updated live!' })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. RECENT BOOKINGS & RESERVATIONS (WITH 1-CLICK ACTIONS) */}
      {/* ========================================================= */}
      <div id="recent-bookings-section" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-black text-white">Recent Bookings &amp; Guests</h2>
          </div>
          <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
            Direct Check-In &amp; WhatsApp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(bk => (
            <div key={bk.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{bk.guestName}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{bk.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{bk.phone} • {bk.unit}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">₹{bk.total}</div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">{bk.paymentState}</div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  bk.checkInState === 'Checked In' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  bk.checkInState === 'Checked Out' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {bk.checkInState}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleBookingStatusChange(bk.id, bk.checkInState === 'Checked In' ? 'Checked Out' : 'Checked In')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    {bk.checkInState === 'Checked In' ? 'Check Out' : 'Check In'}
                  </button>

                  <button
                    onClick={() => {
                      window.location.hash = '#/messages';
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Message Guest</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. RECENT REVIEWS & FEEDBACK */}
      {/* ========================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-black text-white">Recent Guest Reviews &amp; Feedback</h2>
          </div>
          <span className="text-xs text-amber-400 font-bold font-mono">4.9 ★ Rating Average</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-sm text-white">{rev.guestName}</span>
                  <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                    {'★'.repeat(rev.rating)}
                    <span className="text-[10px] text-slate-400 font-mono ml-2">{rev.date}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  rev.resolved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {rev.resolved ? 'RESOLVED' : 'PENDING REPLY'}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                "{rev.comment}"
              </p>

              {rev.reply ? (
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="text-[10px] font-black text-emerald-400 uppercase">Your Official Reply:</div>
                  <p className="text-slate-200">{rev.reply}</p>
                </div>
              ) : (
                editingReplyId === rev.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response to the guest..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingReplyId(null)} className="text-xs font-bold text-slate-400 px-3 py-1">Cancel</button>
                      <button onClick={() => handleSaveReviewReply(rev.id)} className="bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg">Post Reply</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingReplyId(rev.id);
                      setReplyText('');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    + Reply to Guest Review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. PAYMENTS & SETTLEMENTS */}
      {/* ========================================================= */}
      <div id="payments-section" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-white">Bank Settlements &amp; Revenue</h2>
          </div>
          <span className="text-xs text-emerald-400 font-bold font-mono">Direct Bank Transfer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase">Today's Settlement</div>
            <div className="text-2xl font-black text-emerald-400">₹8,800</div>
            <div className="text-[10px] text-slate-400">Scheduled for 6:00 PM today</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase">Pending Payout</div>
            <div className="text-2xl font-black text-sky-400">₹4,000</div>
            <div className="text-[10px] text-slate-400">Awaiting guest check-out</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase">Last Payment</div>
              <div className="text-lg font-black text-white">₹16,400 • 20 Jul 2026</div>
            </div>

            <button
              onClick={() => setNotification({ type: 'success', message: 'Invoice PDF generated & downloaded!' })}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Tax Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EMBEDDED ITEM CALENDAR MODAL (14-30 DAY LOCK POPUP) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {activeCalendarModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base text-white">Item Calendar &amp; Date Blocking</h3>
                  <p className="text-xs text-slate-400">{activeCalendarModal.name}</p>
                </div>
                <button
                  onClick={() => setActiveCalendarModal(null)}
                  className="bg-slate-800 text-slate-300 p-2 rounded-xl hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-300 font-medium">Click on any date to lock or unlock availability:</div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
                  {next14Days.map(d => {
                    let isBlocked = false;
                    if (activeCalendarModal.type === 'room') {
                      const r = rooms.find(item => item.id === activeCalendarModal.id);
                      isBlocked = r?.blockedDates.includes(d.iso) || false;
                    } else if (activeCalendarModal.type === 'fleet') {
                      const f = fleet.find(item => item.id === activeCalendarModal.id);
                      isBlocked = f?.blockedDates.includes(d.iso) || false;
                    } else if (activeCalendarModal.type === 'tour') {
                      const t = tours.find(item => item.id === activeCalendarModal.id);
                      isBlocked = t?.blockedDates.includes(d.iso) || false;
                    }

                    return (
                      <button
                        key={d.iso}
                        onClick={() => toggleDateBlock(activeCalendarModal.type, activeCalendarModal.id, d.iso)}
                        className={`p-2.5 rounded-xl text-center border transition cursor-pointer ${
                          isBlocked 
                            ? 'bg-rose-950 text-rose-400 border-rose-700 font-black' 
                            : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{d.dayName}</div>
                        <div className="text-sm font-black">{d.dayNum}</div>
                        <div className="text-[9px] mt-0.5 font-bold">
                          {isBlocked ? 'LOCKED' : 'FREE'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActiveCalendarModal(null)}
                  className="bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADD ITEM MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-base text-white">Add New Listing / Unit</h3>
                <button onClick={() => setShowAddModal(false)} className="bg-slate-800 text-slate-300 p-2 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Name / Title</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Mountain View Deluxe Suite 202"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category / Type</label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="e.g. Suite, SUV 4x4, Main Dining, Trek"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="2500"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Capacity</label>
                    <input
                      type="number"
                      value={newItemCap}
                      onChange={(e) => setNewItemCap(e.target.value)}
                      placeholder="2"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold px-4 py-2">Cancel</button>
                <button onClick={handleAddItemSubmit} className="bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl">Create Listing</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* RARE BUSINESS SETUP & DOCUMENTS MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Business Setup &amp; Verification Vault</span>
                  </h3>
                  <p className="text-xs text-slate-400">Legal, GST, Bank Details, and Permissions</p>
                </div>
                <button onClick={() => setShowSetupModal(false)} className="bg-slate-800 text-slate-300 p-2 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-black text-white text-xs flex justify-between">
                    <span>GST &amp; Govt Registration</span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="text-slate-400 font-mono">GSTIN: 02ABCDE1234F1Z5</div>
                  <div className="text-slate-400 font-mono">Tourism Reg No: HP-T-992102-2025</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-black text-white text-xs flex justify-between">
                    <span>Settlement Bank Account</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="text-slate-400 font-mono">HDFC Bank Ltd • A/C: ******4918</div>
                  <div className="text-slate-400 font-mono">IFSC Code: HDFC0000123</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-black text-white text-xs">Staff &amp; Operator Permissions</div>
                  <div className="text-slate-400">2 Staff accounts linked with limited access.</div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button onClick={() => setShowSetupModal(false)} className="bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl">Close Setup Vault</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
