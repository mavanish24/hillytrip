import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Calendar, AlertTriangle, MessageSquare, Clock, 
  CheckCircle2, XCircle, Plus, Send, Paperclip, Shield, 
  ArrowRight, User, FileText, X, ChevronRight, CornerDownRight, Loader2
} from 'lucide-react';

interface SupportCase {
  id: string;
  bookingId: string;
  bookingType: string;
  serviceName: string;
  travelerId: string;
  travelerName: string;
  operatorId: string;
  operatorName: string;
  reason: string;
  description: string;
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'Under Review' | 'Waiting for Traveller' | 'Waiting for Operator' | 'Resolved' | 'Closed' | 'Rejected';
  attachments: { url: string; type: string; name: string }[];
  assignedAdmin: string | null;
  createdBy: string;
  createdByName: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    action: string;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  refundRequested?: boolean;
}

interface BookingSupportDisputeCenterProps {
  currentUser: any;
  bookings: any[];
  preSelectedBookingId?: string | null;
  onCloseForm?: () => void;
  onOpenChat?: (booking: any) => void;
}

export default function BookingSupportDisputeCenter({ 
  currentUser, 
  bookings, 
  preSelectedBookingId = null,
  onCloseForm,
  onOpenChat
}: BookingSupportDisputeCenterProps) {
  
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(!!preSelectedBookingId);
  const [selectedBookingId, setSelectedBookingId] = useState(preSelectedBookingId || '');
  const [reason, setReason] = useState('Driver did not arrive');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [attachments, setAttachments] = useState<{ url: string; type: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Case Detail View State
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [replyText, setReplyText] = useState('');
  const [updatingCase, setUpdatingCase] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [adminAssignName, setAdminAssignName] = useState('');

  // User details derived
  const userEmail = currentUser?.email || currentUser?.id || '';
  const userName = currentUser?.name || currentUser?.customerName || 'Anonymous User';
  const roles = currentUser?.roles || [currentUser?.role || 'traveler'];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isOperator = roles.includes('partner') || roles.includes('operator');
  const currentRole = isAdmin ? 'admin' : isOperator ? 'operator' : 'traveler';

  const supportReasons = [
    'Driver did not arrive',
    'Traveller did not arrive',
    'Vehicle issue',
    'Pickup issue',
    'Booking cancellation',
    'Refund Requested',
    'Wrong information',
    'Behaviour issue',
    'Communication issue',
    'Other'
  ];

  const caseStatuses = [
    'Open',
    'Under Review',
    'Waiting for Traveller',
    'Waiting for Operator',
    'Resolved',
    'Closed',
    'Rejected'
  ];

  useEffect(() => {
    fetchCases();
  }, [currentUser]);

  useEffect(() => {
    if (preSelectedBookingId) {
      setSelectedBookingId(preSelectedBookingId);
      setShowCreateForm(true);
    }
  }, [preSelectedBookingId]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        userId: userEmail,
        role: currentRole
      });
      const res = await fetch(`/api/support-cases?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCases(data.cases || []);
        }
      } else {
        setError('Failed to fetch support cases from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Error syncing data with support systems.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert('Please select a booking.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/support-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          reason,
          description,
          priority,
          attachments,
          createdBy: userEmail,
          createdByName: userName,
          userRole: currentRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(`Support Case #${data.case.id} filed successfully! Our support agents have been notified.`);
          setDescription('');
          setAttachments([]);
          // Re-fetch
          await fetchCases();
          // Hide form after a small delay or instantly
          setTimeout(() => {
            setShowCreateForm(false);
            if (onCloseForm) onCloseForm();
          }, 2000);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to file support case.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit case.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCase = async (updatePayload: {
    status?: string;
    assignedAdmin?: string;
    replyText?: string;
    actionNote?: string;
  }) => {
    if (!selectedCase) return;
    setUpdatingCase(true);

    try {
      const res = await fetch(`/api/support-cases/${selectedCase.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatePayload,
          userEmail,
          userName,
          userRole: currentRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedCase(data.case);
          // Update in local cases list
          setCases(prev => prev.map(c => c.id === data.case.id ? data.case : c));
          setReplyText('');
          setAdminNote('');
        }
      } else {
        alert('Failed to execute case update.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error updating support case.');
    } finally {
      setUpdatingCase(false);
    }
  };

  // Drag and Drop files handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setUploading(true);
    // Simulate Supabase/Cloud Storage upload
    setTimeout(() => {
      const newAttachments = Array.from(files).map(file => {
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        return {
          name: file.name,
          type: isPdf ? 'pdf' : 'image',
          url: isPdf 
            ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
            : URL.createObjectURL(file)
        };
      });
      setAttachments(prev => [...prev, ...newAttachments]);
      setUploading(false);
    }, 800);
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Filter application
  const filteredCases = cases.filter(c => {
    // Status
    if (statusFilter !== 'all' && c.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    // Priority
    if (priorityFilter !== 'all' && c.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    // Date Range
    if (startDate) {
      const start = new Date(startDate).getTime();
      if (new Date(c.createdAt).getTime() < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000);
      if (new Date(c.createdAt).getTime() > end) return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        c.id?.toLowerCase().includes(q) ||
        c.bookingId?.toLowerCase().includes(q) ||
        c.travelerName?.toLowerCase().includes(q) ||
        c.operatorName?.toLowerCase().includes(q) ||
        c.reason?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    const base = "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ";
    switch (status) {
      case 'Open':
        return <span className={base + "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400"}>Open</span>;
      case 'Under Review':
        return <span className={base + "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400"}>Under Review</span>;
      case 'Waiting for Traveller':
        return <span className={base + "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-400"}>Wait Traveler</span>;
      case 'Waiting for Operator':
        return <span className={base + "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/40 dark:border-pink-900 dark:text-pink-400"}>Wait Operator</span>;
      case 'Resolved':
        return <span className={base + "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400"}>Resolved</span>;
      case 'Closed':
        return <span className={base + "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400"}>Closed</span>;
      case 'Rejected':
        return <span className={base + "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400"}>Rejected</span>;
      default:
        return <span className={base + "bg-slate-100 border-slate-200 text-slate-700"}>{status}</span>;
    }
  };

  // Render Priority Badge
  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'Urgent':
        return (
          <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-extrabold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 block"></span> Urgent
          </span>
        );
      case 'High':
        return (
          <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-extrabold">
            <span className="w-2 h-2 rounded-full bg-orange-500 block"></span> High
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block"></span> Normal
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Booking Support & Dispute Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Resolve booking complaints, request cancellations, report vehicle or driver issues transparently.
          </p>
        </div>
        
        {!showCreateForm && currentRole !== 'admin' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            File Support Dispute
          </button>
        )}
      </div>

      {/* SUCCESS / ERROR MESSAGES */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* CREATE DISPUTE FORM PANEL */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-850 space-y-5 animate-scale-up">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              File Booking-Linked Dispute Case
            </h3>
            <button 
              onClick={() => { setShowCreateForm(false); if (onCloseForm) onCloseForm(); }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Select Booking */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Select Booking Instance</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500"
                  disabled={!!preSelectedBookingId}
                >
                  <option value="">-- Choose Booking --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      #{b.id.substring(0, 8)} - {b.serviceName || b.homestayName || b.cabDriverName || 'Service'} ({b.checkInDate || b.travelDate})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Cases must be tied to a valid registered Booking ID.</p>
              </div>

              {/* Support Reason */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Issue Category / Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-800 dark:text-white"
                >
                  {supportReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {reason === 'Refund Requested' && (
                  <p className="text-[10px] text-amber-600 font-semibold">★ Tagged for payment/refund review processing.</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Severity / Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal', 'High', 'Urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 rounded-xl font-bold border text-center transition cursor-pointer ${
                        priority === p 
                          ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Detailed Complaint Narrative</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the incident clearly. Please provide dates, times, driver name or homestay host behavior if applicable..."
                rows={4}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Attachments Drag & Drop */}
            <div className="space-y-2">
              <label className="font-extrabold text-slate-700 dark:text-slate-300">Evidentiary Attachments (Images, PDFs)</label>
              
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50/25' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  multiple 
                  accept="image/*,application/pdf"
                  className="hidden" 
                />
                <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Drag & drop files here, or <span className="text-emerald-600 underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span></p>
                <p className="text-[10px] text-slate-400 mt-1">Accepts PNG, JPG, JPEG, and PDF documents (Max size 5MB each)</p>
              </div>

              {/* Attachments list */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); if (onCloseForm) onCloseForm(); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-750 text-white font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'File Complaint & Dispute'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* FILTER CONTROLS PANEL */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by support Case ID, Booking ID, Traveller or Operator Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-xs text-slate-800 dark:text-white"
            />
          </div>

          {/* Filters triggers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              {caseStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300"
            />

          </div>
        </div>

        {/* Filters Clear option */}
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || startDate || endDate) && (
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Found <strong>{filteredCases.length}</strong> matching support tickets</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* CASES DISPLAY GRID */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-slate-500 italic text-xs">Syncing case files & conversation streams...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Shield className="w-8 h-8 text-slate-350 mx-auto" />
          <h4 className="font-black text-slate-800 dark:text-white text-sm">No Active Disputes Located</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Everything is quiet. No active dispute files or complaints are registered under this search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map(c => (
            <div 
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 transition cursor-pointer flex flex-col justify-between text-xs space-y-3 shadow-3xs hover:shadow-2xs"
            >
              <div className="space-y-2">
                {/* Header line */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded-md">
                      #{c.id.substring(0, 12)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Booking: #{c.bookingId.substring(0,8)}
                    </span>
                  </div>
                  {getStatusBadge(c.status)}
                </div>

                {/* Dispute Reason */}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{c.reason}</h4>
                  <p className="text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
                </div>
              </div>

              {/* Footer details line */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 flex justify-between items-center text-[10.5px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-slate-400">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[120px] font-medium text-slate-600 dark:text-slate-400">
                      By: {c.createdByName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getPriorityBadge(c.priority)}
                  {c.assignedAdmin ? (
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold px-1.5 py-0.5 rounded-md">
                      🧑‍💼 {c.assignedAdmin}
                    </span>
                  ) : (
                    <span className="text-[9px] text-rose-500 font-bold">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-scale-up text-left text-xs">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-rose-400 bg-rose-950 px-2 py-0.5 rounded">SUPPORT RECORD</span>
                  <span className="font-mono text-slate-400 text-[10px]">Booking: #{selectedCase.bookingId}</span>
                </div>
                <h3 className="text-base font-black mt-1">Dispute: #{selectedCase.id} Details</h3>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-black p-2 rounded-xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Booking</span>
                    <strong className="text-slate-900 dark:text-white text-[12px]">{selectedCase.serviceName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Traveller</span>
                    <strong className="text-slate-800 dark:text-slate-300">{selectedCase.travelerName} ({selectedCase.travelerId})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Operator / Provider</span>
                    <strong className="text-slate-800 dark:text-slate-300">{selectedCase.operatorName}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedCase.status)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                      <div className="mt-0.5 flex justify-end">{getPriorityBadge(selectedCase.priority)}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Admin</span>
                    <strong className="text-slate-800 dark:text-slate-300">
                      {selectedCase.assignedAdmin ? `🧑‍💼 ${selectedCase.assignedAdmin}` : 'Not assigned yet'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Created Timestamp</span>
                    <strong className="text-slate-800 dark:text-slate-300 font-mono">
                      {new Date(selectedCase.createdAt).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Dispute Narrative Description */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Complaint description</h4>
                <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/50 p-3.5 rounded-xl text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedCase.description}
                </div>
              </div>

              {/* Attachments Display */}
              {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Evidence Documentation</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.attachments.map((file, i) => (
                      <a
                        key={i}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-emerald-600 hover:underline hover:bg-slate-200 dark:hover:bg-slate-850 font-bold text-[10.5px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{file.name} ({file.type.toUpperCase()})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Case History Timeline */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Dispute Case Timeline & Actions
                </h4>
                
                <div className="relative pl-6 border-l-2 border-emerald-500 dark:border-emerald-900 ml-3 space-y-4 py-2">
                  {selectedCase.timeline?.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* marker Dot */}
                      <span className="absolute -left-[31px] top-1 bg-white dark:bg-slate-900 border-2 border-emerald-500 w-4 h-4 rounded-full flex items-center justify-center">
                        <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full" />
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-black text-slate-700 dark:text-slate-300">
                            {evt.action}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            • By: <strong className="text-slate-600 dark:text-slate-300">{evt.actor}</strong>
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-350 italic pl-1 text-[11.5px] mt-0.5">
                          "{evt.note}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Reply Form */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Post Reply Message
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type support reply or update detail. Sent messages automatically index into the Booking Chat thread..."
                    disabled={updatingCase}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && replyText.trim()) {
                        handleUpdateCase({ replyText });
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (replyText.trim()) handleUpdateCase({ replyText });
                    }}
                    disabled={updatingCase || !replyText.trim()}
                    className="bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingCase ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  ⚠️ Note: Your support replies integrate with the platform's Universal Communication Engine (UCE) for complete conversational integrity.
                </p>
              </div>

              {/* ADMIN ACTION CONTROLLERS BOX */}
              {currentRole === 'admin' && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-850 space-y-4 mt-4">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Shield className="w-4 h-4 text-rose-500" />
                    <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-300">Admin Control Console</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                    {/* Status modification */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase tracking-wide block">Alter Support Status</label>
                      <select
                        value={selectedCase.status}
                        onChange={(e) => handleUpdateCase({ status: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white"
                      >
                        {caseStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Admin Assignment */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase tracking-wide block">Assign Representative Admin</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Admin Name / Email"
                          value={adminAssignName}
                          onChange={(e) => setAdminAssignName(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 p-2 rounded-lg text-white outline-none"
                        />
                        <button
                          onClick={() => {
                            if (adminAssignName.trim()) {
                              handleUpdateCase({ assignedAdmin: adminAssignName });
                              setAdminAssignName('');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg font-bold transition"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Modifiers */}
                  <div className="space-y-2">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wide block text-[10px]">Backoffice Direct Commands</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateCase({ status: 'Under Review', actionNote: 'Case put under active backoffice administrative review.' })}
                        className="bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-bold transition cursor-pointer"
                      >
                        🔍 Under Review
                      </button>
                      <button
                        onClick={() => handleUpdateCase({ status: 'Waiting for Operator', actionNote: 'Information requested from Taxi Operator/Partner.' })}
                        className="bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-bold transition cursor-pointer"
                      >
                        ✉ Query Operator
                      </button>
                      <button
                        onClick={() => handleUpdateCase({ status: 'Resolved', actionNote: 'Issue successfully resolved. Settlement completed.' })}
                        className="bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg text-white font-bold transition cursor-pointer"
                      >
                        ✓ Resolve Dispute
                      </button>
                      <button
                        onClick={() => handleUpdateCase({ status: 'Closed', actionNote: 'Case files closed permanently.' })}
                        className="bg-slate-700 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg text-white font-bold transition cursor-pointer"
                      >
                        ✖ Close Case
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center">
              {onOpenChat && (
                <button
                  onClick={() => {
                    const bookingMatch = bookings.find(b => b.id === selectedCase.bookingId);
                    if (bookingMatch) {
                      onOpenChat(bookingMatch);
                      setSelectedCase(null);
                    } else {
                      // Attempt to create a standard format object
                      onOpenChat({
                        id: selectedCase.bookingId,
                        leadType: selectedCase.bookingType,
                        serviceName: selectedCase.serviceName,
                        assignedPartnerId: selectedCase.operatorId
                      });
                      setSelectedCase(null);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Jump to Chat Thread
                </button>
              )}
              <button
                onClick={() => setSelectedCase(null)}
                className="bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 font-extrabold px-4 py-2 rounded-xl transition cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
