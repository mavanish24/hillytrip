import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, Trash2, Archive, CheckCircle, AlertTriangle, 
  Clock, FileText, Camera, Upload, X, Edit, Sparkles, Check, 
  Loader2, ArrowUpDown, RefreshCw, Sliders, ShieldAlert, ChevronRight, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, VehicleStatus } from '../types_taxi';

interface VehicleManagerProps {
  user: any;
  onUpdateUser?: (updated: any) => void;
}

// Convert File to Base64 helper
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function VehicleManager({ user, onUpdateUser }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  
  // Grid/List toggle & Bulk action selection
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'reg' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form Field State
  const [formData, setFormData] = useState({
    id: '',
    vehicleName: '',
    vehicleType: 'SUV',
    registrationNumber: '',
    modelYear: new Date().getFullYear().toString(),
    fuelType: 'Diesel',
    transmission: 'Manual',
    colour: 'White',
    seatingCapacity: '7',
    luggageCapacity: '3',
    airConditioning: 'Yes',
    carrierAvailable: 'No',
    vehicleDescription: '',
    permitNumber: '',
    insuranceExpiry: '',
    permitExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    vehicleImages: [] as string[],
    availabilityStatus: 'available' as VehicleStatus | 'archived',
    registrationCertificateUrl: '',
    insuranceUrl: '',
    permitUrl: '',
    fitnessCertificateUrl: '',
    pollutionCertificateUrl: '',
  });

  // Photo / Doc uploading flags
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRefs = {
    registrationCertificate: useRef<HTMLInputElement>(null),
    insurance: useRef<HTMLInputElement>(null),
    permit: useRef<HTMLInputElement>(null),
    fitness: useRef<HTMLInputElement>(null),
    pollution: useRef<HTMLInputElement>(null),
  };

  // Get operator reference ID
  const operatorId = user?.id ? `op_${user.id}` : 'op_test_operator';

  // Fetch Operator Fleet
  const fetchFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/taxi-operator/vehicles?userId=${user?.id || ''}&includeArchived=true`);
      if (!res.ok) throw new Error('Could not fetch vehicle fleet.');
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to fetch vehicles.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to communicate with fleet repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, [user?.id]);

  // Form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Document Upload Handler
  const uploadDoc = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Document size exceeds the 10MB limit.');
      return;
    }

    setUploadingDoc(docType);
    setError(null);

    try {
      const base64Data = await convertToBase64(file);
      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'operator',
          base64: base64Data,
          filename: `veh_doc_${docType}_${Date.now()}_${file.name}`,
          mimeType: file.type,
          documentType: docType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload document.');

      // Update Form Data with received URL
      const urlKey = `${docType}Url` as keyof typeof formData;
      setFormData(prev => ({
        ...prev,
        [urlKey]: data.url
      }));

      setSuccess(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // Image Gallery Upload Handler
  const uploadVehicleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size exceeds the 8MB limit.');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const base64Data = convertToBase64(file);
      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'operator',
          base64: await base64Data,
          filename: `veh_img_${Date.now()}_${file.name}`,
          mimeType: file.type,
          documentType: 'vehicleImage'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image.');

      setFormData(prev => ({
        ...prev,
        vehicleImages: [...prev.vehicleImages, data.url]
      }));

      setSuccess('Vehicle image added to gallery!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload vehicle image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image from gallery
  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      vehicleImages: prev.vehicleImages.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Open Form for Adding
  const openAddForm = () => {
    setEditingVehicle(null);
    setFormData({
      id: '',
      vehicleName: '',
      vehicleType: 'SUV',
      registrationNumber: '',
      modelYear: new Date().getFullYear().toString(),
      fuelType: 'Diesel',
      transmission: 'Manual',
      colour: 'White',
      seatingCapacity: '7',
      luggageCapacity: '3',
      airConditioning: 'Yes',
      carrierAvailable: 'No',
      vehicleDescription: '',
      permitNumber: '',
      insuranceExpiry: '',
      permitExpiry: '',
      fitnessExpiry: '',
      pollutionExpiry: '',
      vehicleImages: [],
      availabilityStatus: 'available',
      registrationCertificateUrl: '',
      insuranceUrl: '',
      permitUrl: '',
      fitnessCertificateUrl: '',
      pollutionCertificateUrl: '',
    });
    setError(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      id: vehicle.id,
      vehicleName: vehicle.vehicle_name || '',
      vehicleType: vehicle.vehicle_type || 'SUV',
      registrationNumber: vehicle.registration_number || '',
      modelYear: (vehicle.model_year || new Date().getFullYear()).toString(),
      fuelType: vehicle.fuel_type || 'Diesel',
      transmission: vehicle.transmission || 'Manual',
      colour: vehicle.colour || 'White',
      seatingCapacity: (vehicle.seating_capacity || 7).toString(),
      luggageCapacity: (vehicle.luggage_capacity || 3).toString(),
      airConditioning: vehicle.air_conditioning ? 'Yes' : 'No',
      carrierAvailable: vehicle.carrier_available ? 'Yes' : 'No',
      vehicleDescription: vehicle.vehicle_description || '',
      permitNumber: vehicle.permit_number || '',
      insuranceExpiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.substring(0, 10) : '',
      permitExpiry: vehicle.permit_expiry ? vehicle.permit_expiry.substring(0, 10) : '',
      fitnessExpiry: vehicle.fitness_expiry ? vehicle.fitness_expiry.substring(0, 10) : '',
      pollutionExpiry: vehicle.pollution_expiry ? vehicle.pollution_expiry.substring(0, 10) : '',
      vehicleImages: vehicle.vehicle_images || [],
      availabilityStatus: vehicle.availability_status || 'available',
      registrationCertificateUrl: vehicle.registration_certificate_url || '',
      insuranceUrl: vehicle.insurance_url || '',
      permitUrl: vehicle.permit_url || '',
      fitnessCertificateUrl: vehicle.fitness_certificate_url || '',
      pollutionCertificateUrl: vehicle.pollution_certificate_url || '',
    });
    setError(null);
    setIsFormOpen(true);
  };

  // Submit Add/Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Frontend validations
    if (!formData.vehicleName.trim()) {
      setError('Vehicle Model Name is required.');
      setSaving(false);
      return;
    }
    if (!formData.registrationNumber.trim()) {
      setError('Registration Number is required.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        id: formData.id || undefined,
        operatorId: operatorId,
        vehicleName: formData.vehicleName.trim(),
        vehicleType: formData.vehicleType,
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        modelYear: Number(formData.modelYear),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        colour: formData.colour,
        seatingCapacity: Number(formData.seatingCapacity),
        luggageCapacity: Number(formData.luggageCapacity),
        airConditioning: formData.airConditioning === 'Yes',
        carrierAvailable: formData.carrierAvailable === 'Yes',
        vehicleDescription: formData.vehicleDescription,
        permitNumber: formData.permitNumber,
        insuranceExpiry: formData.insuranceExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        fitnessExpiry: formData.fitnessExpiry || null,
        pollutionExpiry: formData.pollutionExpiry || null,
        vehicleImages: formData.vehicleImages,
        availabilityStatus: formData.availabilityStatus,
        registrationCertificateUrl: formData.registrationCertificateUrl,
        insuranceUrl: formData.insuranceUrl,
        permitUrl: formData.permitUrl,
        fitnessCertificateUrl: formData.fitnessCertificateUrl,
        pollutionCertificateUrl: formData.pollutionCertificateUrl,
        isArchived: (formData.availabilityStatus as string) === 'archived'
      };

      const res = await fetch('/api/taxi-operator/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to preserve vehicle specifications.');
      }

      setSuccess(formData.id ? 'Vehicle details updated successfully!' : 'New vehicle added to your fleet!');
      setIsFormOpen(false);
      fetchFleet();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit vehicle records.');
    } finally {
      setSaving(false);
    }
  };

  // Update Status directly
  const updateVehicleStatus = async (id: string, status: VehicleStatus | 'archived') => {
    try {
      const res = await fetch(`/api/taxi-operator/vehicles/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operatorId })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      setSuccess(`Vehicle status updated to ${status}!`);
      fetchFleet();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Status modification rejected.');
    }
  };

  // Bulk Action Execution
  const executeBulkAction = async (action: 'archive' | 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/taxi-operator/vehicles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action, operatorId })
      });
      if (!res.ok) throw new Error('Bulk execution completed with some failures.');
      const data = await res.json();
      setSuccess(`Bulk action completed! ${data.count} vehicles updated.`);
      setSelectedIds([]);
      fetchFleet();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Bulk processing failed.');
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredVehicles.map(v => v.id);
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Expiry Compliance Checker Logic
  const getDocStatus = (expiryDateString: string | null | undefined) => {
    if (!expiryDateString) return { label: 'Missing', color: 'bg-rose-100 text-rose-800 border-rose-200', score: 0 };
    const expiry = new Date(expiryDateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Expired (${Math.abs(diffDays)}d ago)`, color: 'bg-rose-150 text-rose-800 border-rose-300 font-bold', score: 1 };
    } else if (diffDays <= 30) {
      return { label: `Expiring soon (${diffDays}d left)`, color: 'bg-amber-100 text-amber-800 border-amber-200', score: 2 };
    }
    return { label: `Active (${diffDays}d left)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', score: 3 };
  };

  // Compliance Audit Counters
  const complianceAlerts = vehicles.reduce((acc, v) => {
    const docs = [v.insurance_expiry, v.permit_expiry, v.fitness_expiry, v.pollution_expiry];
    let critical = 0;
    let warning = 0;
    
    docs.forEach(d => {
      const status = getDocStatus(d);
      if (status.score === 1 || status.score === 0) critical++;
      if (status.score === 2) warning++;
    });

    if (critical > 0) acc.critical++;
    else if (warning > 0) acc.warning++;
    return acc;
  }, { critical: 0, warning: 0 });

  // Filtering & Sorting calculations
  const filteredVehicles = vehicles
    .filter(v => {
      // Archive toggle
      const isArchived = v.is_archived || v.availability_status === 'archived';
      
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        v.vehicle_name?.toLowerCase().includes(searchLower) ||
        v.registration_number?.toLowerCase().includes(searchLower) ||
        v.vehicle_type?.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = typeFilter === 'All' || v.vehicle_type === typeFilter;

      // Status Filter
      let matchesStatus = true;
      if (statusFilter === 'Active') {
        matchesStatus = v.availability_status === 'available' && !isArchived;
      } else if (statusFilter === 'Busy') {
        matchesStatus = v.availability_status === 'busy' && !isArchived;
      } else if (statusFilter === 'Inactive') {
        matchesStatus = v.availability_status === 'inactive' && !isArchived;
      } else if (statusFilter === 'Maintenance') {
        matchesStatus = v.availability_status === 'maintenance' || v.availability_status === 'service';
      } else if (statusFilter === 'Archived') {
        matchesStatus = isArchived;
      } else if (statusFilter === 'Expiring Docs') {
        const docs = [v.insurance_expiry, v.permit_expiry, v.fitness_expiry, v.pollution_expiry];
        matchesStatus = docs.some(d => {
          const s = getDocStatus(d);
          return s.score === 1 || s.score === 2;
        });
      }

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.vehicle_name || '').localeCompare(b.vehicle_name || '');
      } else if (sortBy === 'reg') {
        comparison = (a.registration_number || '').localeCompare(b.registration_number || '');
      } else {
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      
      {/* SUCCESS / ERROR NOTIFICATIONS */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm flex items-start gap-3 shadow-sm"
          >
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm flex items-start gap-3 shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{success}</div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD STATS BANNER */}
      {!isFormOpen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 font-mono">{vehicles.filter(v => !v.is_archived).length}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Fleet</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 font-mono">{vehicles.filter(v => v.availability_status === 'available' && !v.is_archived).length}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ready/Available</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600 font-mono">{complianceAlerts.critical}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Critical Papers</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 font-mono">{complianceAlerts.warning}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Warning Alerts</div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLIANCE WARNING ADVISORY */}
      {!isFormOpen && (complianceAlerts.critical > 0 || complianceAlerts.warning > 0) && (
        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <h4 className="font-extrabold text-amber-900 uppercase tracking-widest text-[10px] mb-1">Fleet Compliance Advisory</h4>
            <p className="text-slate-600 font-medium">
              You have <strong className="text-rose-600 font-extrabold">{complianceAlerts.critical} critical</strong> and <strong className="text-amber-800 font-extrabold">{complianceAlerts.warning} warning</strong> document status alerts. Taxi bookings will be automatically suspended for vehicles with expired regulatory files. Please upload active insurance, fitness certificate or state permits immediately to stay compliant.
            </p>
          </div>
        </div>
      )}

      {/* CONDITIONAL SUB-VIEW: ADD/EDIT FORM */}
      {isFormOpen ? (
        <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Form Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                {editingVehicle ? 'Edit Fleet Vehicle Specs' : 'Register Vehicle in Fleet'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {editingVehicle ? 'Update and preserve regulatory documents & images' : 'Ensure proper verification before adding heavy vehicles.'}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Part 1: Vehicle Basic Details */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 1. Basic specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Vehicle Model Name *</label>
                  <input 
                    type="text"
                    name="vehicleName"
                    placeholder="e.g. Toyota Innova Crysta"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Vehicle Category / Type *</label>
                  <select 
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="Hatchback">Hatchback (Alto / WagonR)</option>
                    <option value="Sedan">Sedan (Dzire / Etios)</option>
                    <option value="SUV">SUV (Innova / Bolero / Scorpio)</option>
                    <option value="Luxury Traveller">Luxury Traveler (9-17 seater)</option>
                    <option value="Heavy Commercial">Heavy Commercial / Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Registration Number *</label>
                  <input 
                    type="text"
                    name="registrationNumber"
                    placeholder="e.g. WB-74-1294"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Model Year</label>
                  <input 
                    type="number"
                    name="modelYear"
                    value={formData.modelYear}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Fuel Type</label>
                  <select 
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric (EV)</option>
                    <option value="CNG">CNG / Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Transmission</label>
                  <select 
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Seating Capacity (Excl. Driver)</label>
                  <input 
                    type="number"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Luggage Capacity (Bags)</label>
                  <input 
                    type="number"
                    name="luggageCapacity"
                    value={formData.luggageCapacity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Air Conditioning (A/C)</label>
                  <select 
                    name="airConditioning"
                    value={formData.airConditioning}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="Yes">Yes, fully operational</option>
                    <option value="No">No A/C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Roof Carrier Available</label>
                  <select 
                    name="carrierAvailable"
                    value={formData.carrierAvailable}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="No">No roof luggage carrier</option>
                    <option value="Yes">Yes, carrier installed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Color</label>
                  <input 
                    type="text"
                    name="colour"
                    value={formData.colour}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Initial Availability Status</label>
                  <select 
                    name="availabilityStatus"
                    value={formData.availabilityStatus}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="available">Available for Bookings</option>
                    <option value="busy">Busy / Engaged</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Under Maintenance</option>
                    {editingVehicle && <option value="archived">Archived / Decommissioned</option>}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Internal/Public Notes or Description</label>
                <textarea 
                  name="vehicleDescription"
                  rows={2}
                  value={formData.vehicleDescription}
                  onChange={handleInputChange}
                  placeholder="Mention special permits, premium interiors, state boundary clearance etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                ></textarea>
              </div>
            </div>

            {/* Part 2: Photos Gallery */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 2. Photos Gallery
              </h4>
              
              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                {formData.vehicleImages.map((img, index) => (
                  <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 group shadow-xs">
                    <img src={img} alt="Vehicle preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                {/* Upload button card */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-blue-600 bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">Add Photo</span>
                    </>
                  )}
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadVehicleImage}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-[10px] font-medium text-slate-400">Supported formats: JPG, PNG, WEBP. Maximum file size 8MB.</p>
            </div>

            {/* Part 3: Regulatory Compliance Documents */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 3. Regulatory compliance & papers
              </h4>
              <p className="text-xs text-slate-400 font-medium mb-6">Expiry dates must match the physical documents. Upload clean scans of your vehicle registry files.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 3a. Registration Certificate */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700">Registration Certificate (RC)</span>
                    <button 
                      type="button"
                      onClick={() => docInputRefs.registrationCertificate.current?.click()}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer"
                      disabled={uploadingDoc !== null}
                    >
                      {uploadingDoc === 'registrationCertificate' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.registrationCertificateUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRefs.registrationCertificate}
                      onChange={(e) => uploadDoc(e, 'registrationCertificate')}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                  </div>
                  {formData.registrationCertificateUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] mb-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate flex-1">RC File uploaded!</span>
                      <a href={formData.registrationCertificateUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> View</a>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State Permit Number</label>
                    <input 
                      type="text"
                      name="permitNumber"
                      placeholder="e.g. NP-SK-9410-A"
                      value={formData.permitNumber}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* 3b. Vehicle Commercial Insurance */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700">Commercial Insurance</span>
                    <button 
                      type="button"
                      onClick={() => docInputRefs.insurance.current?.click()}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer"
                      disabled={uploadingDoc !== null}
                    >
                      {uploadingDoc === 'insurance' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.insuranceUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRefs.insurance}
                      onChange={(e) => uploadDoc(e, 'insurance')}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                  </div>
                  {formData.insuranceUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] mb-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate flex-1">Insurance Copy uploaded!</span>
                      <a href={formData.insuranceUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> View</a>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Insurance Expiration Date</label>
                    <input 
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-600"
                    />
                  </div>
                </div>

                {/* 3c. Commercial State / National Permit */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700">All-State Tourist Permit</span>
                    <button 
                      type="button"
                      onClick={() => docInputRefs.permit.current?.click()}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer"
                      disabled={uploadingDoc !== null}
                    >
                      {uploadingDoc === 'permit' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.permitUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRefs.permit}
                      onChange={(e) => uploadDoc(e, 'permit')}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                  </div>
                  {formData.permitUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] mb-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate flex-1">Permit Copy uploaded!</span>
                      <a href={formData.permitUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> View</a>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Permit Expiration Date</label>
                    <input 
                      type="date"
                      name="permitExpiry"
                      value={formData.permitExpiry}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-600"
                    />
                  </div>
                </div>

                {/* 3d. Fitness Certificate */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700">Fitness Certificate</span>
                    <button 
                      type="button"
                      onClick={() => docInputRefs.fitness.current?.click()}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer"
                      disabled={uploadingDoc !== null}
                    >
                      {uploadingDoc === 'fitness' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.fitnessCertificateUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRefs.fitness}
                      onChange={(e) => uploadDoc(e, 'fitness')}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                  </div>
                  {formData.fitnessCertificateUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] mb-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate flex-1">Fitness certificate uploaded!</span>
                      <a href={formData.fitnessCertificateUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> View</a>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fitness Expiration Date</label>
                    <input 
                      type="date"
                      name="fitnessExpiry"
                      value={formData.fitnessExpiry}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-600"
                    />
                  </div>
                </div>

                {/* 3e. Pollution Under Control (PUC) */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700">Pollution Certificate (PUC)</span>
                    <button 
                      type="button"
                      onClick={() => docInputRefs.pollution.current?.click()}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer"
                      disabled={uploadingDoc !== null}
                    >
                      {uploadingDoc === 'pollution' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.pollutionCertificateUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRefs.pollution}
                      onChange={(e) => uploadDoc(e, 'pollution')}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                  </div>
                  {formData.pollutionCertificateUrl && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] mb-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate flex-1">PUC certificate uploaded!</span>
                      <a href={formData.pollutionCertificateUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> View</a>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PUC Expiration Date</label>
                    <input 
                      type="date"
                      name="pollutionExpiry"
                      value={formData.pollutionExpiry}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-600"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preserving Specifications...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{editingVehicle ? 'Update Vehicle Details' : 'Register Vehicle'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* STANDARD FLEET CATALOG VIEWS */
        <>
          {/* SEARCH, SORT, FILTER & CONTROLS RAIL */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search fleet by model, reg plates or permit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                />
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-150">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-extrabold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Vehicle Types</option>
                    <option value="Hatchback">Hatchbacks</option>
                    <option value="Sedan">Sedans</option>
                    <option value="SUV">SUVs</option>
                    <option value="Luxury Traveller">Travelers</option>
                    <option value="Heavy Commercial">Heavy Commercial</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-150">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-extrabold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Ready/Available</option>
                    <option value="Busy">Busy/Engaged</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Archived">Archived</option>
                    <option value="Expiring Docs">Compliance Flags</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-150">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-[11px] font-extrabold text-slate-600 focus:outline-none"
                  >
                    <option value="created">Sort: Date Registered</option>
                    <option value="name">Sort: Model Name</option>
                    <option value="reg">Sort: Reg Number</option>
                  </select>
                </div>

                <button 
                  onClick={() => openAddForm()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Vehicle</span>
                </button>
              </div>

            </div>

            {/* BULK ACTIONS BANNER */}
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="text-xs font-bold text-blue-900">
                  {selectedIds.length} vehicles selected for batch operations
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => executeBulkAction('activate')}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                  >
                    Set Available
                  </button>
                  <button 
                    onClick={() => executeBulkAction('deactivate')}
                    className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                  >
                    Set Inactive
                  </button>
                  <button 
                    onClick={() => executeBulkAction('archive')}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 hover:text-rose-900 border border-slate-200 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive selected</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* SKELETON LOADING STATE */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4">
                  <div className="w-full aspect-video bg-slate-100 rounded-2xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="pt-4 flex justify-between">
                    <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            /* EMPTY FLEET STATE */
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-base font-black text-slate-800">No matching fleet vehicles</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
                {searchTerm || statusFilter !== 'All' || typeFilter !== 'All' 
                  ? 'Try relaxing your filter parameters or search queries to locate vehicles.'
                  : 'Start registering your transport fleet to manage reviews, routes, and active bookings.'}
              </p>
              <button 
                onClick={() => openAddForm()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Vehicle</span>
              </button>
            </div>
          ) : (
            /* GRID CATALOG OF FLEET VEHICLES */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVehicles.map((v) => {
                const isArchived = v.is_archived || v.availability_status === 'archived';
                
                // Get compliance expiry calculations
                const insuranceStatus = getDocStatus(v.insurance_expiry);
                const permitStatus = getDocStatus(v.permit_expiry);
                const fitnessStatus = getDocStatus(v.fitness_expiry);
                const pollutionStatus = getDocStatus(v.pollution_expiry);
                
                // Has any critical document error
                const isNonCompliant = [insuranceStatus, permitStatus, fitnessStatus, pollutionStatus]
                  .some(s => s.score === 1 || s.score === 0);

                return (
                  <div 
                    key={v.id} 
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                      isArchived ? 'opacity-70 border-dashed border-slate-200 bg-slate-50/50' : 
                      isNonCompliant ? 'border-rose-100' : 'border-slate-100'
                    }`}
                  >
                    {/* Vehicle Card Cover Image */}
                    <div className="relative aspect-video bg-slate-50 overflow-hidden">
                      {v.vehicle_images && v.vehicle_images.length > 0 ? (
                        <img 
                          src={v.vehicle_images[0]} 
                          alt={v.vehicle_name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100">
                          <Camera className="w-8 h-8 opacity-30" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Vehicle Photos</span>
                        </div>
                      )}
                      
                      {/* Checkbox for selection */}
                      <div className="absolute top-3 left-3 z-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(v.id)}
                          onChange={() => toggleSelectId(v.id)}
                          className="w-4.5 h-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white/90 backdrop-blur-xs"
                        />
                      </div>

                      {/* Status Tag */}
                      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                        {isArchived ? (
                          <span className="bg-slate-800/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider backdrop-blur-xs">
                            Archived
                          </span>
                        ) : isNonCompliant ? (
                          <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider backdrop-blur-xs ${
                            v.availability_status === 'available' ? 'bg-emerald-600 text-white' :
                            v.availability_status === 'busy' ? 'bg-amber-500 text-white' :
                            'bg-slate-500 text-white'
                          }`}>
                            ● {v.availability_status || 'available'}
                          </span>
                        )}
                      </div>

                      {/* Capacity Pill */}
                      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        {v.seating_capacity || 7} Seater • {v.luggage_capacity || 3} Bags
                      </div>
                    </div>

                    {/* Vehicle Description */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1">{v.vehicle_name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                            {v.vehicle_type}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-500 tracking-wider mt-1">{v.registration_number}</p>
                        
                        {v.vehicle_description && (
                          <p className="text-slate-400 text-[11px] mt-2 line-clamp-2 leading-relaxed">{v.vehicle_description}</p>
                        )}
                      </div>

                      {/* Document Compliance Panel */}
                      <div className="pt-3 border-t border-slate-50 space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono block">Document Audit Status</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex items-center justify-between p-1 bg-slate-50 rounded-md border border-slate-100">
                            <span className="text-slate-400 font-bold">Insurance:</span>
                            <span className={`font-black px-1 py-0.2 rounded ${
                              insuranceStatus.score === 3 ? 'text-emerald-700 bg-emerald-50' :
                              insuranceStatus.score === 2 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                            }`}>
                              {insuranceStatus.score === 3 ? 'OK' : insuranceStatus.score === 2 ? 'Soon' : 'Expired'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1 bg-slate-50 rounded-md border border-slate-100">
                            <span className="text-slate-400 font-bold">State Permit:</span>
                            <span className={`font-black px-1 py-0.2 rounded ${
                              permitStatus.score === 3 ? 'text-emerald-700 bg-emerald-50' :
                              permitStatus.score === 2 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                            }`}>
                              {permitStatus.score === 3 ? 'OK' : permitStatus.score === 2 ? 'Soon' : 'Expired'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1 bg-slate-50 rounded-md border border-slate-100">
                            <span className="text-slate-400 font-bold">Fitness Cert:</span>
                            <span className={`font-black px-1 py-0.2 rounded ${
                              fitnessStatus.score === 3 ? 'text-emerald-700 bg-emerald-50' :
                              fitnessStatus.score === 2 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                            }`}>
                              {fitnessStatus.score === 3 ? 'OK' : fitnessStatus.score === 2 ? 'Soon' : 'Expired'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1 bg-slate-50 rounded-md border border-slate-100">
                            <span className="text-slate-400 font-bold">Pollution:</span>
                            <span className={`font-black px-1 py-0.2 rounded ${
                              pollutionStatus.score === 3 ? 'text-emerald-700 bg-emerald-50' :
                              pollutionStatus.score === 2 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                            }`}>
                              {pollutionStatus.score === 3 ? 'OK' : pollutionStatus.score === 2 ? 'Soon' : 'Expired'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Rail */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        {isArchived ? (
                          <button 
                            onClick={() => updateVehicleStatus(v.id, 'available')}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select 
                              value={v.availability_status}
                              onChange={(e) => updateVehicleStatus(v.id, e.target.value as any)}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1 text-[10px] font-black text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="available">Available</option>
                              <option value="busy">Busy</option>
                              <option value="inactive">Inactive</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => openEditForm(v)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title="Edit Vehicle Specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {!isArchived && (
                            <button 
                              onClick={() => updateVehicleStatus(v.id, 'archived')}
                              className="p-1.5 bg-slate-50 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Archive Vehicle"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
