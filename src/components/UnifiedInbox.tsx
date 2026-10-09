import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Send, Paperclip, Pin, Archive, Check, CheckCheck, 
  Trash2, AlertTriangle, Shield, CheckCircle, Clock, X, FileText, Image as ImageIcon, 
  Plus, Sparkles, Star, UserCheck, AlertOctagon, RefreshCw, SendHorizontal,
  ChevronDown, ChevronUp, Sliders, DollarSign, Award, ThumbsUp, ThumbsDown, Compass
} from 'lucide-react';
import { User, ChatConversation, ChatMessage } from '../types';
import { getItemSlug } from '../utils/slug';

// Future-Ready Multi-Domain Negotiation Action Configurations
const DOMAINS_DATA = {
  taxi: {
    label: "Taxi Negotiation",
    color: "amber",
    icon: Sparkles,
    traveler: [
      { id: 'reduce_fare', label: 'Can you reduce the fare? 💰', template: 'Hello, your quotation looks good. Is there any possibility of reducing the fare slightly to match my budget?' },
      { id: 'earlier_arrival', label: 'Can you arrive earlier? ⏰', template: 'Hi, my plans have adjusted slightly. Would it be possible for you to arrive earlier than the scheduled time?' },
      { id: 'bigger_vehicle', label: 'I need a bigger vehicle. 🚙', template: 'We have a larger group size than originally planned. Could you please provide a bigger vehicle to accommodate everyone comfortably?' },
      { id: 'extra_luggage', label: 'We have extra luggage. 🧳', template: 'Greetings, we will be carrying some extra luggage/bags for this journey. Will there be sufficient carrier space available?' },
      { id: 'passenger_change', label: 'Passenger count has changed. 👨‍👩‍👧', template: 'Hi, our passenger headcount has changed. Can we accommodate the revised number of travelers for this ride?' },
      { id: 'pickup_change', label: 'Change pickup location. 📍', template: 'Hello, I would like to adjust the pickup point for this journey. Can we coordinate on the new location?' },
      { id: 'drop_change', label: 'Change drop location. 📍', template: 'Hello, we need to modify our destination/drop-off point. Could you please recalculate the route and confirm?' },
      { id: 'stop_on_way', label: 'Can we stop on the way? 🛑', template: 'We would love to make a short scenic stop or restroom break along the way. Hope that is fine with the driver?' },
      { id: 'wait_30', label: 'Please wait for 30 mins. ⏳', template: 'Hi, we might need the vehicle to wait for about 30 minutes at one of our stopovers. Are waiting charges applicable?' },
      { id: 'parking_included', label: 'Is parking included? ❓', template: 'Could you please confirm if the quoted price includes all local parking fees and entrance charges?' },
      { id: 'toll_included', label: 'Are tolls included? ❓', template: 'Hello, does the quoted flat rate include all highway toll booth charges, or will they be charged separately?' },
      { id: 'night_charge', label: 'Is night charge included? ❓', template: 'Since we might be traveling during late night hours, is the night driver allowance included in this quote?' },
      { id: 'driver_allowance', label: 'Is driver allowance included? ❓', template: 'Could you please clarify if the driver’s food and lodging allowance is fully covered under the quoted price?' },
      { id: 'pay_after', label: 'Can I pay after the trip? ❓', template: 'Hello, is it possible for me to settle the payment after we successfully complete the trip, or do you require a deposit?' },
      { id: 'ac_enabled', label: 'Is vehicle AC enabled? ❓', template: 'Hi, could you please confirm if the vehicle is fully air-conditioned and if it will be active throughout the mountain route?' },
      { id: 'vehicle_details', label: 'Share vehicle details. ❓', template: 'Can you please share the registration number, vehicle model, and driver contact number for coordination?' },
    ],
    operator: [
      { id: 'final_price', label: 'Final Price ⛔', template: 'Hello, this is our absolute best final price for this route. It is calculated with minimal margins to ensure your safety and comfort.' },
      { id: 'upgraded_vehicle', label: 'Vehicle Upgraded 🚗', template: 'Good news! We have upgraded your ride to a superior segment vehicle at no additional charge for an ultra-comfortable journey.' },
      { id: 'alt_vehicle', label: 'Alternative Vehicle Available 🚙', template: 'Hello, we have an alternative vehicle category ready for your travel dates. Let us know if you would like to proceed with it.' },
      { id: 'best_fare', label: 'Best Possible Fare 💰', template: 'We have calculated the lowest possible competitive rate for this corridor, taking into account all tolls and taxes.' },
      { id: 'arrive_15', label: 'Arriving in 15 mins. ⏳', template: 'Our professional driver has dispatched and is on track to arrive at your pickup spot in approximately 15 minutes.' },
      { id: 'pickup_confirmed', label: 'Pickup Location Confirmed. 📍', template: 'We have successfully locked in your specified pickup location. The driver will map the route accordingly.' },
      { id: 'toll_included_op', label: 'Toll Included. 🛣️', template: 'Yes, we confirm that all highway toll gate charges are fully included in the flat fare. There are no hidden fees.' },
      { id: 'parking_included_op', label: 'Parking Included. 🅿️', template: 'Yes, all standard parking charges and terminal fees are completely covered under the quoted pricing.' },
      { id: 'stop_included', label: 'One Stop Included. 🍽️', template: 'We happily include one complimentary 20-minute stop along the way for meals or refreshment breaks.' },
      { id: 'waiting_charges', label: 'Waiting Charges Apply. 🛑', template: 'Please note that standard waiting charges of ₹150 per 30 minutes will apply after the initial complimentary grace period.' },
      { id: 'driver_details_later', label: 'Driver details shared after booking. 📞', template: 'We will share the driver\'s phone number and the exact vehicle registration plate immediately after your booking is officially confirmed.' },
      { id: 'booking_confirmed', label: 'Booking Confirmed. ✅', template: 'Congratulations, your ride booking is officially confirmed! Our team is preparing the vehicle for a safe trip.' },
      { id: 'unable_accept', label: 'Unable to Accept Booking. ❌', template: 'We regret to inform you that we are unable to accept this booking due to extreme peak vehicle shortages or route closures.' },
    ]
  },
  homestay: {
    label: "Homestay Enquiries",
    color: "emerald",
    icon: CheckCircle,
    traveler: [
      { id: 'homestay_checkin', label: 'Early Check-in request 🔑', template: 'Hi, would it be possible to check in a bit earlier than the standard time? We are arriving in town early.' },
      { id: 'homestay_meals', label: 'Food options query 🍽️', template: 'Could you please let us know what home-cooked meals are available, and if traditional mountain cuisine is served?' },
      { id: 'homestay_wifi', label: 'WiFi speed query 📶', template: 'Hello, could you please confirm if there is high-speed internet available at the property? I might need to take some work calls.' },
      { id: 'homestay_heater', label: 'Room heating query 🔥', template: 'Since the weather in the mountains gets chilly, is there proper room heating or electric blankets provided in the cottage?' },
    ],
    operator: [
      { id: 'homestay_avail', label: 'Rooms Available ✅', template: 'Yes, we have comfortable rooms available for your requested dates! We would be delighted to host you.' },
      { id: 'homestay_booked', label: 'Fully Booked ❌', template: 'We apologize, but we are fully booked on those specific dates. We would love to host you on alternative dates if your schedule allows.' },
      { id: 'homestay_parking', label: 'Free Parking Available 🚗', template: 'Yes, we have safe, private, and free parking available on-site for your personal vehicles.' },
      { id: 'homestay_pets', label: 'Pet Friendly Cottage 🐾', template: 'We love furry friends! Our homestay is fully pet-friendly, and there is plenty of open garden space for them.' },
    ]
  },
  package: {
    label: "Tour Packages",
    color: "sky",
    icon: Compass,
    traveler: [
      { id: 'pkg_customize', label: 'Can we customize itinerary? 🎨', template: 'Hello, we are interested in this tour package but would like to swap out a few destinations. Is the itinerary customizable?' },
      { id: 'pkg_discounts', label: 'Group discounts query 📉', template: 'Do you offer any special discounted rates for larger families or groups booking this tour package?' },
    ],
    operator: [
      { id: 'pkg_custom_confirmed', label: 'Custom Itinerary Ready ✨', template: 'We have revised the tour itinerary based on your suggestions! Please review the attached custom travel roadmap.' },
      { id: 'pkg_all_inclusive', label: 'All-Inclusive confirmed 💼', template: 'This tour package is fully all-inclusive, covering stays, meals, transportation, permit fees, and guided tours.' },
    ]
  },
  guide: {
    label: "Travel Guides",
    color: "indigo",
    icon: FileText,
    traveler: [
      { id: 'guide_lang', label: 'Language availability 🗣️', template: 'Hi, we require a guide who is fluent in our native language. Are there guides available who speak it fluently?' },
      { id: 'guide_trek', label: 'Trek difficulty level 🥾', template: 'Could you please share the physical fitness level required and the overall terrain difficulty for this guided trek?' },
    ],
    operator: [
      { id: 'guide_licensed', label: 'Certified Guides Only 📜', template: 'All of our local mountain guides are certified, fully licensed, and highly trained in high-altitude first aid and navigation.' },
      { id: 'guide_tailored', label: 'Customizable Route 🗺️', template: 'We can completely tailor the daily hiking distances and sightseeing spots to match your group\'s pace and preferences.' },
    ]
  },
  activity: {
    label: "Activities & Treks",
    color: "violet",
    icon: ImageIcon,
    traveler: [
      { id: 'act_safety', label: 'Safety gear provided? 🦺', template: 'Hello, are all the essential safety gear, harnesses, helmets, and instructors fully included in this activity booking?' },
      { id: 'act_weather', label: 'Weather refund policy 🌧️', template: 'If the activity gets cancelled due to heavy rain, landslides, or bad weather, do we get a full refund or rescheduling?' },
    ],
    operator: [
      { id: 'act_safety_certified', label: 'Safety First Certified 🛡️', template: 'We maintain international safety standards. All equipment is checked daily, and our instructors are highly certified professionals.' },
      { id: 'act_slot_locked', label: 'Slot Confirmed 🎟️', template: 'We have successfully reserved your activity time slot! Please arrive at least 15 minutes early for the safety briefing.' },
    ]
  },
  support: {
    label: "Customer Support",
    color: "rose",
    icon: Shield,
    traveler: [
      { id: 'supp_refund', label: 'Refund status inquiry 💸', template: 'Hello, I recently cancelled my booking and would like to check on the current status of my payment refund.' },
      { id: 'supp_invoice', label: 'Request official invoice 🧾', template: 'Hi, could you please send me the official GST invoice/receipt for my recent booking for tax and reimbursement purposes?' },
    ],
    operator: [
      { id: 'supp_resolved', label: 'Issue Resolved ✅', template: 'We have investigated and successfully resolved your issue. The transaction has been updated accordingly.' },
      { id: 'supp_escalated', label: 'Escalated to Management ⚠️', template: 'I have escalated your query to our senior operations desk. They will review it and get back to you with a resolution shortly.' },
    ]
  }
};

interface UnifiedInboxProps {
  currentUser: User;
  onClose?: () => void;
}

export default function UnifiedInbox({ currentUser, onClose }: UnifiedInboxProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    return localStorage.getItem('hillytrip_active_chat_conv_id') || null;
  });

  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem('hillytrip_active_chat_conv_id', activeConvId);
    } else {
      localStorage.removeItem('hillytrip_active_chat_conv_id');
    }
  }, [activeConvId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived' | 'pinned' | 'reported'>('all');
  
  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<{ url: string; type: string; name: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick replies definition (derived from role)
  const isOwnerOrPartner = currentUser.role === 'partner' || (currentUser.roles && currentUser.roles.includes('partner'));
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || (currentUser.roles && (currentUser.roles.includes('admin') || currentUser.roles.includes('super_admin')));

  // Smart Learning System State: track action usage frequencies
  const [actionUsageCounts, setActionUsageCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(`hillytrip_action_usage_${currentUser.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Future-ready dynamic domain selector state (taxi, homestay, guide, package, activity, support)
  const [activeDomain, setActiveDomain] = useState<'taxi' | 'homestay' | 'guide' | 'package' | 'activity' | 'support'>('taxi');
  
  // Negotiation view mode: let admin/users test both sides easily
  const [negotiationRole, setNegotiationRole] = useState<'traveler' | 'operator'>('traveler');

  // Toggle state to collapse or expand full categories lists
  const [isNegotiationPanelExpanded, setIsNegotiationPanelExpanded] = useState(false);

  // Sync active domain and role automatically when active chat changes
  useEffect(() => {
    if (activeConv) {
      const type = activeConv.listing_type || 'taxi';
      if (['taxi', 'homestay', 'guide', 'package', 'activity', 'support'].includes(type)) {
        setActiveDomain(type as any);
      } else {
        const name = (activeConv.listingName || '').toLowerCase();
        if (name.includes('taxi') || name.includes('ride') || name.includes('cab') || name.includes('route')) {
          setActiveDomain('taxi');
        } else {
          setActiveDomain('homestay');
        }
      }
    }
  }, [activeConvId, activeConv]);

  useEffect(() => {
    setNegotiationRole(isOwnerOrPartner ? 'operator' : 'traveler');
  }, [currentUser, isOwnerOrPartner]);

  // Handle template selection & track usage frequency
  const handleSelectAction = (template: string, actionId: string) => {
    setNewMessageText(template);
    
    // Focus the textarea input field
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);

    // Increment count in learning engine
    const updated = {
      ...actionUsageCounts,
      [actionId]: (actionUsageCounts[actionId] || 0) + 1
    };
    setActionUsageCounts(updated);
    try {
      localStorage.setItem(`hillytrip_action_usage_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to sort actions by usage count (Learning System requirement)
  const getSortedActions = (actions: { id: string; label: string; template: string }[]) => {
    return [...actions].sort((a, b) => {
      const countA = actionUsageCounts[a.id] || 0;
      const countB = actionUsageCounts[b.id] || 0;
      return countB - countA; // Desending order (most used first)
    });
  };

  // Helper to detect last received message for AI recommended responses
  const lastReceivedMsg = [...messages]
    .reverse()
    .find(m => m.sender_id !== currentUser.id && !m.is_deleted);

  const parseTripInfoCard = (messageText: string) => {
    if (messageText && messageText.startsWith('{') && messageText.endsWith('}')) {
      try {
        const parsed = JSON.parse(messageText);
        if (parsed && parsed.isTripInfoCard) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  };

  const parseEnquiryCard = (messageText: string) => {
    if (messageText && messageText.startsWith('{') && messageText.endsWith('}')) {
      try {
        const parsed = JSON.parse(messageText);
        if (parsed && (parsed.isEnquiryCard || parsed.category)) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  };

  const getLatestTripCard = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parsed = parseTripInfoCard(messages[i].message);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  };

  // Helper to extract recommended replies dynamically
  const getContextualRecommendations = () => {
    if (!lastReceivedMsg) return [];
    const text = lastReceivedMsg.message.toLowerCase();
    const suggestions: { label: string; template: string }[] = [];

    if (negotiationRole === 'operator') {
      // Operator responding to Traveler
      if (text.includes('reduce') || text.includes('fare') || text.includes('price') || text.includes('discount') || text.includes('budget') || text.includes('cheap') || text.includes('cost') || text.includes('negotiate') || text.includes('less')) {
        suggestions.push(
          { label: '💰 Best Possible Fare', template: 'We have calculated the lowest possible competitive rate for this corridor, taking into account all tolls and taxes. This is our best possible fare.' },
          { label: '⛔ Final Price', template: 'Hello, this is our absolute best final price for this route. It is calculated with minimal margins to ensure driver safety and high quality.' },
          { label: '📉 Reduce ₹200', template: 'To help you make this trip, we can offer a special goodwill discount of ₹200 off the original quote.' },
          { label: '🚗 Upgrade Vehicle', template: 'We cannot reduce the fare further, but we can upgrade you to a superior segment vehicle at no extra charge!' }
        );
      } else if (text.includes('arrive') || text.includes('early') || text.includes('time') || text.includes('clock') || text.includes('hour') || text.includes('when')) {
        suggestions.push(
          { label: '⏳ Arriving in 15 mins.', template: 'Our professional driver has dispatched and is on track to arrive at your pickup spot in approximately 15 minutes.' },
          { label: '📍 Pickup Confirmed', template: 'We have successfully locked in your specified pickup location. The driver will map the route and arrive exactly on time.' }
        );
      } else if (text.includes('luggage') || text.includes('bag') || text.includes('carrier') || text.includes('suitcase')) {
        suggestions.push(
          { label: '🧳 Carrier Included', template: 'Yes, our vehicle is equipped with a roof luggage carrier which is fully free to use. All your extra bags will be secure.' },
          { label: '🚙 Bigger Alternative', template: 'Greetings, we have an alternative bigger SUV vehicle category ready if you wish to accommodate extra luggage comfortably.' }
        );
      } else if (text.includes('stop') || text.includes('way') || text.includes('break') || text.includes('halt')) {
        suggestions.push(
          { label: '🍽️ One Stop Included', template: 'We happily include one complimentary 20-minute stop along the way for meals or refreshment breaks.' },
          { label: '🛑 Waiting Charges', template: 'Please note that standard waiting charges of ₹150 per 30 minutes will apply after the initial complimentary grace period.' }
        );
      } else if (text.includes('toll') || text.includes('parking') || text.includes('charge')) {
        suggestions.push(
          { label: '🛣️ Toll Included', template: 'Yes, we confirm that all highway toll gate charges and terminal parkings are fully included in the flat fare.' },
          { label: '⚠️ Toll Excluded', template: 'Please note that state border permits and toll booth charges are not included in the flat rate and can be paid directly.' }
        );
      } else if (text.includes('vehicle') || text.includes('car') || text.includes('cab') || text.includes('details')) {
        suggestions.push(
          { label: '📞 Details Shared Later', template: 'We will share the driver\'s phone number and the exact vehicle registration plate immediately after your booking is officially confirmed.' },
          { label: '✅ Booking Confirmed', template: 'Congratulations, your ride booking is officially confirmed! Our team is preparing the vehicle for a safe trip.' }
        );
      }
    } else {
      // Traveler responding to Operator
      if (text.includes('fare') || text.includes('price') || text.includes('quote') || text.includes('rate') || text.includes('cost') || text.includes('charge')) {
        suggestions.push(
          { label: '💰 Can you reduce fare?', template: 'Hello, your quotation looks good. Is there any possibility of reducing the fare slightly to help me book instantly?' },
          { label: '✅ Confirm Booking', template: 'The price looks fair and competitive. I am ready to confirm the booking. Please guide me on next steps.' },
          { label: '❓ Tolls Included?', template: 'Could you please confirm if this flat rate fully includes all highway toll booth charges and airport/station parking fees?' }
        );
      } else if (text.includes('driver') || text.includes('dispatch') || text.includes('arrive') || text.includes('wait')) {
        suggestions.push(
          { label: '📍 At Pickup Point', template: 'Great, I am waiting at the designated pickup point. Please ask the driver to ring me upon arrival.' },
          { label: '⏳ Delay: Wait 10 mins', template: 'I might be delayed by about 10 minutes due to unexpected delays. Could you please request the driver to wait for me?' }
        );
      } else if (text.includes('confirm') || text.includes('booked') || text.includes('lock')) {
        suggestions.push(
          { label: '🎉 Looking Forward', template: 'Wonderful! Thank you for the confirmation. Looking forward to a safe and comfortable journey with your team.' },
          { label: '🧾 Request Invoice', template: 'Thank you! Could you please share the formal invoice and driver contact sheet for my records?' }
        );
      }
    }

    return suggestions;
  };


  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messaging/conversations?userId=${encodeURIComponent(currentUser.id)}&role=${encodeURIComponent(currentUser.role)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations);
          // Auto select first conversation if none selected and conversations exist
          if (!activeConvId && data.conversations.length > 0) {
            setActiveConvId(data.conversations[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messaging/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          // Mark conversation messages as seen
          await fetch(`/api/messaging/conversations/${convId}/seen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  // Poll for new messages & conversation list updates (Realtime feel)
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConvId) {
        fetchMessages(activeConvId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  // Fetch messages whenever active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  // Scroll to bottom when message list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || newMessageText.trim();
    if (!finalMsg && !uploadPreview) return;
    if (!activeConvId) return;

    try {
      const payload = {
        conversationId: activeConvId,
        senderId: currentUser.id,
        message: finalMsg || `Sent an attachment: ${uploadPreview?.name}`,
        attachmentUrl: uploadPreview ? uploadPreview.url : undefined,
        attachmentType: uploadPreview ? uploadPreview.type : undefined
      };

      const res = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(prev => [...prev, data.message]);
          setNewMessageText('');
          setUploadPreview(null);
          fetchConversations(); // refresh sidebar list
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // File Upload Handlers
  const processFile = async (file: File) => {
    setUploading(true);
    try {
      // Read file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const payload = {
          base64: base64String,
          filename: file.name,
          mimeType: file.type
        };

        const res = await fetch('/api/messaging/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUploadPreview({
              url: data.url,
              type: file.type.startsWith('image/') ? 'image' : 'pdf',
              name: file.name
            });
          }
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload file:', err);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Thread controls
  const handlePinConversation = async (id: string, currentPin: boolean) => {
    try {
      const res = await fetch(`/api/messaging/conversations/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPin })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveConversation = async (id: string, currentArchive: boolean) => {
    try {
      const res = await fetch(`/api/messaging/conversations/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !currentArchive })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveConversation = async (id: string, currentResolve: boolean) => {
    try {
      const res = await fetch(`/api/messaging/conversations/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: !currentResolve })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportConversation = async (id: string, currentReport: boolean) => {
    try {
      const res = await fetch(`/api/messaging/conversations/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReported: !currentReport, reportedBy: currentUser.id })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin exclusive actions
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message content for moderation?')) return;
    try {
      const res = await fetch(`/api/messaging/messages/${msgId}/delete`, {
        method: 'POST'
      });
      if (res.ok) {
        if (activeConvId) {
          fetchMessages(activeConvId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters logic
  const filteredConversations = conversations.filter(c => {
    // 1. Search filter
    const matchesSearch = 
      c.listingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.last_message.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Tab filter
    if (activeTab === 'pinned') return c.is_pinned;
    if (activeTab === 'archived') return c.is_archived;
    if (activeTab === 'unread') return c.unread_count > 0;
    if (activeTab === 'reported') return c.is_reported;
    
    // Default 'all' tab does not show archived by default
    return !c.is_archived;
  });


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xl" id="hillytrip-unified-inbox-dashboard">
      {/* HEADER BAR */}
      <div className="bg-white border-b border-slate-150 px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-slate-900 font-extrabold text-base tracking-tight flex items-center gap-2">
              HillyTrip Live Inbox
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                {currentUser.role} View
              </span>
            </h2>
            <p className="text-slate-500 text-xs">Direct communication with travelers & mountain homestays</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchConversations}
            title="Refresh conversations"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* CORE GRID CONTENT */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* LEFT SIDEBAR: CONVERSATION LIST */}
        <div className="w-80 sm:w-96 bg-white border-r border-slate-150 flex flex-col shrink-0">
          {/* SEARCH BOX */}
          <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search hosts, listings, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* TAB SELECTOR */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'unread', 'pinned', 'archived', ...(isAdmin ? ['reported'] : [])] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shrink-0 transition ${
                    activeTab === tab 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* CONVERSATION SCROLL AREA */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 opacity-40 mx-auto mb-2 stroke-1.5" />
                <span className="text-xs font-bold text-slate-600 block">No Chats Found</span>
                <p className="text-[10px] mt-0.5">Start an enquiry from any mountain homestay page!</p>
              </div>
            ) : (
              filteredConversations.map(c => {
                const isActive = c.id === activeConvId;
                const isUnread = c.unread_count > 0;
                
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition flex gap-3 relative ${
                      isActive ? 'bg-emerald-50/20 border-l-3 border-emerald-600' : ''
                    } ${isUnread ? 'bg-slate-50/50' : ''}`}
                  >
                    {/* AVATAR & METRICS */}
                    <div className="relative w-11 h-11 rounded-full border border-slate-200 overflow-hidden shrink-0">
                      <img 
                        src={c.otherParticipant.avatar} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Active"></span>
                    </div>

                    {/* METADATA */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs truncate max-w-[130px]">
                          {c.otherParticipant.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 truncate">
                          🏠 {c.listingName}
                        </span>
                        <span className="text-[8px] uppercase font-black text-slate-400">
                          {c.otherParticipant.role}
                        </span>
                      </div>

                      <p className={`text-[11px] mt-1.5 truncate ${isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                        {c.last_message || 'No messages yet'}
                      </p>
                    </div>

                    {/* RIGHT BADGES & STATUSES */}
                    <div className="flex flex-col items-end justify-between shrink-0 pl-1">
                      <div className="flex items-center gap-1">
                        {c.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        {c.is_resolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                        {c.is_reported && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                      </div>

                      {isUnread && (
                        <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT WINDOW */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden min-w-0 relative">
            {/* DRAG AND DROP OVERLAY */}
            {dragActive && (
              <div 
                className="absolute inset-0 bg-emerald-600/10 border-4 border-dashed border-emerald-500 z-50 flex flex-col items-center justify-center p-6 text-emerald-800 animate-pulse"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Paperclip className="w-12 h-12 mb-2 stroke-1.5" />
                <span className="text-sm font-extrabold">Drop your file to attach</span>
                <p className="text-xs">Images and PDF attachments supported</p>
              </div>
            )}

            {/* CHAT HEADER */}
            <div className="bg-white border-b border-slate-150 px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0">
                  <img 
                    src={activeConv.otherParticipant.avatar} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-slate-950 font-extrabold text-xs tracking-tight flex items-center gap-2">
                    {activeConv.otherParticipant.name}
                    <span className="px-1.5 py-0.2 text-[8px] uppercase font-black tracking-wider rounded bg-slate-100 text-slate-500">
                      {activeConv.otherParticipant.role}
                    </span>
                  </h3>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span>Online via HillyTrip</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-emerald-700">🏠 {activeConv.listingName}</span>
                  </div>
                </div>
              </div>

              {/* ACTION TOOLBAR */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => handlePinConversation(activeConv.id, activeConv.is_pinned)}
                  title={activeConv.is_pinned ? "Unpin chat" : "Pin chat"}
                  className={`p-2 rounded-lg transition ${activeConv.is_pinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchiveConversation(activeConv.id, activeConv.is_archived)}
                  title={activeConv.is_archived ? "Unarchive chat" : "Archive chat"}
                  className={`p-2 rounded-lg transition ${activeConv.is_archived ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleResolveConversation(activeConv.id, activeConv.is_resolved)}
                  title={activeConv.is_resolved ? "Reopen issue" : "Mark as resolved"}
                  className={`p-2 rounded-lg transition ${activeConv.is_resolved ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReportConversation(activeConv.id, activeConv.is_reported)}
                  title={activeConv.is_reported ? "Clear report" : "Report user / chat"}
                  className={`p-2 rounded-lg transition ${activeConv.is_reported ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>

              {/* REPORT AN ISSUE SUPPORT ENTRY POINT */}
              <button
                onClick={() => {
                  if (activeConv && activeConv.listing_id) {
                    localStorage.setItem('hillytrip_support_preselected_booking_id', activeConv.listing_id);
                    localStorage.setItem('hillytrip_booking_engine_active_tab', 'support');
                    window.location.hash = '#/profile?tab=bookings';
                    if (onClose) onClose();
                  } else {
                    alert('No associated booking linked to this conversation.');
                  }
                }}
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-extrabold text-[11px] px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-3xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Report an Issue
              </button>
            </div>

            {/* STICKY DIRECT BOOKING CTA BANNER IN CHAT */}
            {activeConv && activeConv.listing_id && (
              <div className="bg-emerald-600 text-white px-6 py-2.5 flex items-center justify-between shrink-0 shadow-xs border-b border-emerald-700">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span className="truncate">Ready to confirm your dates at {activeConv.listingName || 'this business'}?</span>
                </div>
                <button
                  onClick={() => {
                    const type = activeConv.listing_type || 'homestay';
                    const slugOrId = activeConv.listing_slug || getItemSlug(activeConv.listingName) || activeConv.listing_id;
                    if (type === 'homestay') {
                      window.location.hash = `#/homestay/${slugOrId}`;
                    } else if (type === 'taxi') {
                      window.location.hash = `#/taxi/${slugOrId}`;
                    } else if (type === 'tour' || type === 'package') {
                      window.location.hash = `#/package/${slugOrId}`;
                    } else {
                      window.location.hash = `#/business/${slugOrId}`;
                    }
                    if (onClose) onClose();
                  }}
                  className="bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                >
                  <span>Book Now</span>
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              </div>
            )}

            {/* PINNED TRIP DETAILS PANEL */}
            {(() => {
              const latestTrip = getLatestTripCard();
              if (!latestTrip) return null;
              const isActive = latestTrip.status === 'active';
              return (
                <div className="bg-slate-900 border-b border-slate-800 px-6 py-4.5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden shrink-0 shadow-md">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] uppercase font-black px-3 py-0.5 tracking-wider font-sans">
                    📌 Pinned Latest Ride Info
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚕</span>
                    <div className="text-xs">
                      <div className="font-extrabold flex items-center gap-2 text-white">
                        <span>Driver: {latestTrip.driverName}</span>
                        <a href={`tel:${latestTrip.driverMobile}`} className="text-emerald-400 font-mono hover:underline font-bold">
                          ({latestTrip.driverMobile})
                        </a>
                      </div>
                      <div className="text-slate-400 mt-1">
                        Vehicle: <span className="font-semibold text-slate-200">{latestTrip.vehicleType}</span> {latestTrip.vehicleModel ? `• ${latestTrip.vehicleModel}` : ''} • Reg: <span className="font-mono text-slate-200 uppercase bg-white/10 px-1.5 py-0.2 rounded text-[10px]">{latestTrip.vehicleReg}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-right sm:text-left sm:border-l sm:border-slate-800 sm:pl-4">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Scheduled Pickup</div>
                    <div className="font-black text-emerald-400 mt-0.5 text-sm">{latestTrip.pickupTime}</div>
                  </div>
                </div>
              );
            })()}

            {/* CHAT THREAD VIEW */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-50"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-12 h-12 stroke-1.5 mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No messages in this chat thread</p>
                  <p className="text-[10px] mt-0.5">Send a quick enquiry or message below to start chatting.</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isOwn = m.sender_id === currentUser.id;
                  const tripCard = parseTripInfoCard(m.message);
                  const enquiryCard = parseEnquiryCard(m.message);
                  
                  return (
                    <div 
                      key={m.id || idx} 
                      className={`flex gap-3 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 mt-1">
                          <img src={activeConv.otherParticipant.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Content Bubble */}
                      <div className="space-y-1 text-left w-full">
                        {enquiryCard ? (
                          /* Render Structured Pre-Booking Enquiry Card */
                          <div className="p-4 sm:p-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-900 dark:text-white space-y-3 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-900/50 pb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                                <span>📋</span>
                                <span>Enquiry: {enquiryCard.category || 'General'}</span>
                              </span>

                              <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Pre-Booking Enquiry
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-[11px]">
                              {enquiryCard.checkIn && (
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Check-in</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{enquiryCard.checkIn}</span>
                                </div>
                              )}
                              {enquiryCard.checkOut && (
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Check-out</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{enquiryCard.checkOut}</span>
                                </div>
                              )}
                              {enquiryCard.guests && (
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Guests</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{enquiryCard.guests} Persons</span>
                                </div>
                              )}
                              {enquiryCard.selectedRoom && (
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Selected Option</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">{enquiryCard.selectedRoom}</span>
                                </div>
                              )}
                            </div>

                            <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs leading-relaxed text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap">
                              {enquiryCard.message}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                              <span>Sent via HillyTrip Pre-Booking Desk</span>
                              <button
                                onClick={() => {
                                  const type = activeConv.listing_type || 'homestay';
                                  const slugOrId = activeConv.listing_slug || getItemSlug(activeConv.listingName) || activeConv.listing_id;
                                  if (type === 'homestay') window.location.hash = `#/homestay/${slugOrId}`;
                                  else if (type === 'taxi') window.location.hash = `#/taxi/${slugOrId}`;
                                  else if (type === 'tour') window.location.hash = `#/package/${slugOrId}`;
                                  else window.location.hash = `#/business/${slugOrId}`;
                                }}
                                className="text-emerald-600 dark:text-emerald-400 font-black hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Direct Booking Page →</span>
                              </button>
                            </div>
                          </div>
                        ) : tripCard ? (
                          /* Render System-generated Trip Information Card */
                          <div className={`p-5 rounded-3xl border text-left ${
                            tripCard.status === 'active' 
                              ? 'bg-slate-900 border-slate-850 text-white shadow-xl' 
                              : 'bg-slate-100 border-slate-250 text-slate-500 opacity-60'
                          } min-w-[280px] max-w-sm space-y-3.5 text-xs relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 text-[8px] uppercase font-black px-3 py-1 rounded-bl-xl tracking-wider ${
                              tripCard.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-300 text-slate-600'
                            }`}>
                              {tripCard.status === 'active' ? '★ Active details' : 'Superseded (v' + tripCard.version + ')'}
                            </div>
                            <div className="flex items-center gap-2 font-black text-xs text-white">
                              <span>🚖</span>
                              <span>{tripCard.status === 'active' ? 'Confirmed Ride Details' : 'Previous Trip Version'}</span>
                            </div>
                            <div className="space-y-2.5 border-t border-white/10 pt-3 text-[11px]">
                              <div>
                                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">👤 Assigned Driver</span>
                                <span className="font-extrabold text-white text-xs">{tripCard.driverName}</span>
                                <a href={`tel:${tripCard.driverMobile}`} className="ml-2 text-emerald-400 hover:underline font-mono font-bold">
                                  📞 {tripCard.driverMobile}
                                </a>
                              </div>
                              <div>
                                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">🚙 Vehicle specifications</span>
                                <span className="text-slate-200 font-semibold">{tripCard.vehicleType} {tripCard.vehicleModel ? `• ${tripCard.vehicleModel}` : ''}</span>
                                <div className="font-mono text-[9px] font-black text-slate-300 bg-white/10 px-2 py-0.5 rounded inline-block ml-2 uppercase tracking-wide">
                                  {tripCard.vehicleReg}
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">📍 Pickup location & meeting spot</span>
                                <div className="text-slate-200 font-medium">{tripCard.pickupLocation}</div>
                                {tripCard.meetingPoint && (
                                  <div className="mt-1 italic text-slate-400">Meeting: {tripCard.meetingPoint}</div>
                                )}
                              </div>
                              <div className="pt-1 font-mono text-[10px] text-emerald-400 font-black flex items-center gap-1.5 border-t border-white/5">
                                🕘 Scheduled Pickup: {tripCard.pickupTime}
                              </div>
                            </div>
                            {tripCard.notes && (
                              <div className="text-[10px] bg-white/5 p-2.5 rounded-2xl italic text-slate-300 border border-white/5 leading-relaxed">
                                {tripCard.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Standard Message Container */
                          <div 
                            className={`p-3.5 rounded-2xl relative text-left ${
                              isOwn 
                                ? 'bg-emerald-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-200/85 rounded-tl-none'
                            }`}
                          >
                            {/* Deleted indicator */}
                            {m.is_deleted ? (
                              <span className="italic text-xs opacity-60 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                This message was moderated and deleted by HillyTrip Desk
                              </span>
                            ) : (
                              <>
                                <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{m.message}</p>
                                
                                {/* Attachment layout */}
                                {m.attachment_url && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    {m.attachment_type === 'image' ? (
                                      <div className="rounded-lg overflow-hidden max-w-xs border border-black/10">
                                        <img 
                                          src={m.attachment_url} 
                                          alt="Uploaded media" 
                                          className="w-full h-auto object-cover max-h-60" 
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    ) : (
                                      <a 
                                        href={m.attachment_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
                                          isOwn ? 'bg-emerald-700/60 hover:bg-emerald-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-250'
                                        }`}
                                      >
                                        <FileText className="w-4 h-4 text-rose-500" />
                                        <span className="truncate max-w-[180px]">Attached PDF</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Admin controls for deleting message */}
                            {isAdmin && !m.is_deleted && (
                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 text-white rounded transition text-[9px] font-bold"
                                title="Delete/Moderate message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Message Meta Info */}
                        <div className={`flex items-center gap-1.5 text-[9px] font-mono text-slate-400 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span>
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                          {isOwn && (
                            <span className="flex items-center gap-0.5" title={m.is_seen ? `Seen at ${m.seen_at ? new Date(m.seen_at).toLocaleTimeString() : ''}` : 'Sent'}>
                              {m.is_seen ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-500 stroke-2" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 stroke-2" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* SMART NEGOTIATION CONSOLE */}
            <div className="bg-white border-t border-slate-150 shrink-0 space-y-2 pb-1.5">
              {/* TOP PANEL: Contextual Suggestions (Based on message detection) */}
              {(() => {
                const suggestions = getContextualRecommendations();
                if (suggestions.length === 0) return null;
                return (
                  <div className="px-6 py-2 bg-gradient-to-r from-teal-50/60 via-emerald-50/50 to-amber-50/50 border-b border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span>AI Suggested Replies</span>
                        <span className="text-[10px] font-normal text-slate-500">(Based on last message received)</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono font-medium">Smart Match</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectAction(item.template, item.label)}
                          className="px-3 py-1.5 bg-white/90 hover:bg-emerald-50 hover:text-emerald-900 border border-emerald-150 hover:border-emerald-300 text-[11px] font-medium text-slate-700 rounded-lg shrink-0 shadow-sm transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* MAIN SHORTCUTS & ACTION BAR */}
              <div className="px-6 py-2 flex items-center justify-between gap-4">
                {/* Shortcuts row (top 5 sorted actions) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    Shortcuts:
                  </span>
                  {getSortedActions(DOMAINS_DATA[activeDomain][negotiationRole]).slice(0, 5).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleSelectAction(action.template, action.id)}
                      className="px-3 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-200 text-[11px] font-medium text-slate-600 rounded-full shrink-0 transition flex items-center gap-1 shadow-xs"
                    >
                      {action.label}
                      {actionUsageCounts[action.id] > 0 && (
                        <span className="ml-1 text-[8px] bg-slate-250 text-slate-700 px-1 rounded-full font-mono font-semibold">
                          {actionUsageCounts[action.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => setIsNegotiationPanelExpanded(!isNegotiationPanelExpanded)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border ${
                    isNegotiationPanelExpanded 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                      : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isNegotiationPanelExpanded ? 'Collapse' : 'All Templates'}</span>
                  {isNegotiationPanelExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* EXPANDED CATEGORIZED CONSOLE */}
              {isNegotiationPanelExpanded && (
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  {/* Dynamic Tab Selector (Supporting multiple domains) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Future-Ready Domains
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Auto-selected for active listing)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {Object.entries(DOMAINS_DATA).map(([key, dom]) => {
                        const Icon = dom.icon;
                        const isSelected = activeDomain === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveDomain(key as any)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 border transition ${
                              isSelected 
                                ? `bg-${dom.color}-500 border-${dom.color}-600 text-white shadow-xs` 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            style={{
                              backgroundColor: isSelected ? (
                                key === 'taxi' ? '#f59e0b' : 
                                key === 'homestay' ? '#10b981' : 
                                key === 'package' ? '#0ea5e9' : 
                                key === 'guide' ? '#6366f1' : 
                                key === 'activity' ? '#8b5cf6' : '#f43f5e'
                              ) : undefined,
                              borderColor: isSelected ? (
                                key === 'taxi' ? '#d97706' : 
                                key === 'homestay' ? '#059669' : 
                                key === 'package' ? '#0284c7' : 
                                key === 'guide' ? '#4f46e5' : 
                                key === 'activity' ? '#7c3aed' : '#e11d48'
                              ) : undefined,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-semibold truncate max-w-full">{dom.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Perspective / Role Toggle */}
                  <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      Perspective / Persona:
                    </span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setNegotiationRole('traveler')}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                          negotiationRole === 'traveler'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        👨‍👩‍👧 Traveller
                      </button>
                      <button
                        onClick={() => setNegotiationRole('operator')}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                          negotiationRole === 'operator'
                            ? 'bg-white text-amber-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🚕 Operator / Partner
                      </button>
                    </div>
                  </div>

                  {/* Sorted Actions Directory */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      Predefined Professional Messages (Click to Load)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {getSortedActions(DOMAINS_DATA[activeDomain][negotiationRole]).map((action) => {
                        const usage = actionUsageCounts[action.id] || 0;
                        return (
                          <button
                            key={action.id}
                            onClick={() => handleSelectAction(action.template, action.id)}
                            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition group relative shadow-xs flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                                {action.label}
                              </span>
                              {usage > 0 && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-md font-mono shrink-0">
                                  Used: {usage}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                              {action.template}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MESSAGE COMPOSER */}
            <div className="bg-white px-6 py-4 border-t border-slate-150 shrink-0 space-y-3">
              {/* Attachment preview panel */}
              {uploadPreview && (
                <div className="p-2.5 bg-slate-50 border border-slate-250 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {uploadPreview.type === 'image' ? (
                      <div className="w-9 h-9 rounded bg-slate-200 overflow-hidden border border-slate-300">
                        <img src={uploadPreview.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded bg-red-50 border border-red-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-xs">{uploadPreview.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{uploadPreview.type} attachment</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUploadPreview(null)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3">
                {/* File Upload trigger */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file (Image/PDF)"
                  disabled={uploading}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="animate-spin border-2 border-slate-500 border-t-transparent rounded-full w-4 h-4 block"></span>
                  ) : (
                    <Paperclip className="w-4.5 h-4.5" />
                  )}
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {/* Text area */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl pl-4 pr-12 py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 resize-none min-h-[44px] max-h-24 scrollbar-thin"
                    style={{ height: 'auto' }}
                  />
                  {/* character counter */}
                  <span className="absolute right-3 bottom-1.5 text-[9px] font-mono text-slate-400">
                    {newMessageText.length}
                  </span>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessageText.trim() && !uploadPreview}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition cursor-pointer shrink-0 shadow-sm"
                >
                  <SendHorizontal className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
            <MessageSquare className="w-16 h-16 stroke-1.5 mb-2 opacity-30 text-emerald-600 animate-bounce" />
            <span className="text-sm font-extrabold text-slate-700">Welcome to HillyTrip Messaging</span>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Please select a chat thread from the left list to read messages and reply instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
