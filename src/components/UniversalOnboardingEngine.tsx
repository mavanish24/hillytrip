import React, { useState, useEffect } from 'react';
import { 
  Building, 
  FileText, 
  Camera, 
  CheckCircle, 
  UploadCloud, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Check, 
  Info,
  FileCheck,
  FolderOpen,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessConfiguration, BusinessField } from '../types/businessOnboarding';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { isFieldVisible, validateField, validateOnboarding } from '../utils/validationService';
import { WorkflowEngine } from '../utils/workflowEngine';

interface UniversalOnboardingEngineProps {
  configuration: BusinessConfiguration;
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  selectedBusinessType: string;
}

// Icon mapper helper based on configuration strings
const getSectionIcon = (iconName?: string) => {
  switch (iconName) {
    case 'building': return Building;
    case 'file-text': return FileText;
    case 'camera': return Camera;
    case 'check-circle': return CheckCircle;
    default: return FolderOpen;
  }
};

export default function UniversalOnboardingEngine({
  configuration,
  user,
  onUpdateUser,
  navigate,
  selectedBusinessType
}: UniversalOnboardingEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Track field validation errors dynamically
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Read sections from configuration
  const sections = configuration.sections;
  const currentSection = sections[currentStepIndex];

  // Initialize dynamic form states based on all businessFields across all sections
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    configuration.sections.forEach(sec => {
      if (sec.type === 'fields' && sec.fields) {
        sec.fields.forEach(field => {
          initial[field.id] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
      }
    });
    return initial;
  });

  // Track document upload states dynamically
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, { filename: string; size: string; uploadedAt: string }>>({});

  // Track photo upload states dynamically
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; filename: string; size: string; preview: string }[]>([]);

  // Sync state if configuration changes
  useEffect(() => {
    const initial: Record<string, any> = {};
    configuration.sections.forEach(sec => {
      if (sec.type === 'fields' && sec.fields) {
        sec.fields.forEach(field => {
          initial[field.id] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
      }
    });
    setFormData(initial);
    setValidationErrors({});
    setCurrentStepIndex(0);
    setUploadedDocuments({});
    setUploadedPhotos([]);
    setIsSubmitted(false);
    setError(null);
    setSuccess(null);
  }, [configuration]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => {
      const nextData = { ...prev, [fieldId]: value };

      // Perform live validation on the modified field
      let targetField: BusinessField | undefined;
      for (const sec of configuration.sections) {
        if (sec.type === 'fields' && sec.fields) {
          targetField = sec.fields.find(f => f.id === fieldId);
          if (targetField) break;
        }
      }

      if (targetField) {
        const result = validateField(targetField, value, nextData);
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          [fieldId]: result.isValid ? '' : result.message
        }));
      }

      return nextData;
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 15 * 1024 * 1024; // 15MB limit
    if (file.size > maxSize) {
      setError('File size exceeds the 15MB limit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await convertToBase64(file);
      
      setUploadedDocuments(prev => ({
        ...prev,
        [docId]: {
          filename: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }));

      setSuccess(`Document "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedDocuments(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      filename: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file)
    }));

    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    setSuccess(`${files.length} photo(s) added successfully!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemovePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const validateCurrentSection = (): boolean => {
    setError(null);
    if (!currentSection) return true;

    if (currentSection.type === 'fields') {
      if (currentSection.fields) {
        let hasErrors = false;
        const newErrors = { ...validationErrors };

        for (const field of currentSection.fields) {
          // Skip validation if the field is currently hidden by visibility conditions
          if (!isFieldVisible(field, formData)) {
            continue;
          }
          const result = validateField(field, formData[field.id], formData);
          if (!result.isValid) {
            newErrors[field.id] = result.message;
            hasErrors = true;
          } else {
            newErrors[field.id] = '';
          }
        }

        setValidationErrors(newErrors);

        if (hasErrors) {
          setError('Please correct the validation errors in this section before continuing.');
          return false;
        }
      }
    } else if (currentSection.type === 'documents') {
      if (currentSection.requiredDocuments) {
        for (const doc of currentSection.requiredDocuments) {
          if (!uploadedDocuments[doc.id]) {
            setError(`Please upload the required document: ${doc.name}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentStepIndex < sections.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) return;

    // Validate the entire onboarding form end-to-end
    const allResults = validateOnboarding(configuration, formData);
    const hasOnboardingErrors = allResults.some(r => !r.isValid);
    if (hasOnboardingErrors) {
      const newErrors = { ...validationErrors };
      allResults.forEach(r => {
        if (!r.isValid) {
          newErrors[r.fieldId] = r.message;
        }
      });
      setValidationErrors(newErrors);
      setError('Please correct the validation errors across all sections before final submission.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock API latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (user) {
        // Start the workflow engine dynamically based on configuration's workflowId
        const initialWorkflowState = WorkflowEngine.start(configuration.workflowId || 'homestay_verification');

        const onboardingPayload = {
          businessType: selectedBusinessType,
          businessName: configuration.name,
          formData,
          documents: uploadedDocuments,
          photos: uploadedPhotos.map(p => ({ filename: p.filename, size: p.size })),
          submittedAt: new Date().toISOString(),
          status: 'Pending',
          workflowState: initialWorkflowState
        };

        const updatedDetails = {
          ...user.partnerDetails,
          [selectedBusinessType]: onboardingPayload
        };

        onUpdateUser({
          ...user,
          partnerDetails: updatedDetails,
          currentBusinessType: selectedBusinessType
        });
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl" />

          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-200 dark:border-emerald-900/30">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-[10px] tracking-widest font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
            Application Received
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Verification Initiated
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
            Thank you for registering your <strong>{configuration.name}</strong> agency with HillyTrip! Our verification desk will audit your profile parameters and credentials within 24-48 business hours.
          </p>

          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 my-6 text-left space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span className="font-medium">Business Type:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{configuration.name}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span className="font-medium">Reference Code:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                HT-{selectedBusinessType.toUpperCase().substring(0, 4)}-{Math.floor(100000 + Math.random() * 900000)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span className="font-medium">Onboarding Mode:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Section-Based Dynamic Engine</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition cursor-pointer"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-900/10"
            >
              Update Application
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 font-sans">
      {/* Progress indicators matching current sections config */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest block">
              {configuration.name} Onboarding Flow
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Universal Dynamic Engine
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-3 py-1 rounded-full">
            Section {currentStepIndex + 1} of {sections.length}
          </span>
        </div>

        {/* Dynamic sections indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2">
          {sections.map((sec, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const SecIcon = getSectionIcon(sec.icon);
            return (
              <div key={sec.id} className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
                <div className="flex items-center gap-1.5 truncate px-0.5">
                  <SecIcon className={`w-3 h-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-[9px] font-black block truncate tracking-wide uppercase ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {sec.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-10 shadow-lg relative">
        
        {/* Error / Success Banners */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-2.5 text-xs font-bold mb-6"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-start gap-2.5 text-xs font-bold mb-6"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic section rendering */}
        <div className="min-h-[250px]">
          {currentSection && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  {React.createElement(getSectionIcon(currentSection.icon), { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{currentSection.title}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 leading-relaxed">{currentSection.description}</p>
                </div>
              </div>

              {/* A. Render FIELDS type section */}
              {currentSection.type === 'fields' && (
                <div>
                  {currentSection.fields && currentSection.fields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {currentSection.fields
                        .filter(field => isFieldVisible(field, formData))
                        .map(field => {
                          const isFullWidth = [
                            'textarea', 
                            'gallery', 
                            'location', 
                            'bank_account', 
                            'vehicle_types', 
                            'room_types', 
                            'payment_methods'
                          ].includes(field.type);
                          return (
                            <div key={field.id} className={isFullWidth ? 'md:col-span-2' : 'md:col-span-1'}>
                              <DynamicFieldRenderer
                                field={field}
                                value={formData[field.id]}
                                onChange={(val) => handleInputChange(field.id, val)}
                                error={validationErrors[field.id]}
                                formData={formData}
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    /* Elegant placeholder if fields array is empty as configured */
                    <div className="py-10 text-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                        <Info className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto px-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Empty Form Configuration</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          This section represents fields architecture on an empty configuration level. Future developers can configure <code>BusinessFields</code> inside this section in <code>businessConfigurations.ts</code>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. Render DOCUMENTS type section */}
              {currentSection.type === 'documents' && (
                <div>
                  {(currentSection.requiredDocuments && currentSection.requiredDocuments.length > 0) || (currentSection.optionalDocuments && currentSection.optionalDocuments.length > 0) ? (
                    <div className="space-y-4">
                      {currentSection.requiredDocuments && currentSection.requiredDocuments.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentSection.requiredDocuments.map(doc => {
                            const isUploaded = !!uploadedDocuments[doc.id];
                            return (
                              <div key={doc.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg border">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.name}</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{doc.description}</p>
                                  </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                                  {isUploaded ? (
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold">
                                        <Check className="w-4 h-4" />
                                        <span>Uploaded</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFile(doc.id)}
                                        className="text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-extrabold uppercase tracking-wider cursor-pointer select-none transition">
                                      <UploadCloud className="w-3.5 h-3.5" /> Upload File
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, doc.id)}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Elegant placeholder if documents configurations are empty */
                    <div className="py-10 text-center space-y-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto px-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Required Certificates</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Currently, no verification documents are requested for this section in the template file. Future developers can register document handlers under this section.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* C. Render PHOTOS type section */}
              {currentSection.type === 'photos' && (
                <div className="space-y-5">
                  {/* Photo upload zone */}
                  <div className="border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-2xl p-8 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition duration-200 relative">
                    <label className="cursor-pointer block space-y-3">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto border">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Click or Drag images to upload</span>
                        <span className="text-[10px] text-slate-400 block">Supports JPG, PNG, WEBP (Max 15MB each)</span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>

                  {/* Thumbnail gallery */}
                  {uploadedPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <AnimatePresence>
                        {uploadedPhotos.map(photo => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-video bg-slate-50 dark:bg-slate-950"
                          >
                            <img
                              src={photo.preview}
                              alt={photo.filename}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {/* Hover overlay control */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-between p-2">
                              <span className="text-[8px] text-white font-mono truncate">{photo.filename}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="self-end p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      No photos uploaded yet. You can proceed with empty config uploads.
                    </div>
                  )}
                </div>
              )}

              {/* D. Render REVIEW type section */}
              {currentSection.type === 'review' && (
                <div className="space-y-5">
                  {/* Dynamic review listing based on previous sections content */}
                  <div className="space-y-4">
                    {sections.map(sec => {
                      if (sec.type === 'fields' && sec.fields) {
                        const visibleFields = sec.fields.filter(field => isFieldVisible(field, formData));
                        return (
                          <div key={sec.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                              <Building className="w-4 h-4 text-indigo-500" />
                              <span>{sec.title}</span>
                            </div>
                            {visibleFields.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {visibleFields.map(field => {
                                  const rawVal = formData[field.id];
                                  let displayVal = <span className="text-slate-400 italic font-medium">N/A</span>;
                                  
                                  if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                                    if (Array.isArray(rawVal)) {
                                      displayVal = <span className="font-bold text-slate-800 dark:text-slate-200">{rawVal.join(', ').toUpperCase()}</span>;
                                    } else if (typeof rawVal === 'object') {
                                      if (field.type === 'bank_account') {
                                        displayVal = (
                                          <div className="text-xs space-y-0.5 text-slate-700 dark:text-slate-300">
                                            <div>A/C: <span className="font-mono font-bold">{rawVal.accountNumber}</span></div>
                                            <div>IFSC: <span className="font-mono font-bold">{rawVal.ifscCode}</span></div>
                                            <div>Bank: <span className="font-bold">{rawVal.bankName}</span></div>
                                          </div>
                                        );
                                      } else if (field.type === 'location') {
                                        displayVal = (
                                          <div className="text-xs space-y-0.5 text-slate-700 dark:text-slate-300">
                                            <div className="font-bold">{rawVal.address}</div>
                                            <div className="font-mono text-[10px]">({rawVal.latitude}, {rawVal.longitude})</div>
                                          </div>
                                        );
                                      } else {
                                        displayVal = <span className="font-bold text-slate-800 dark:text-slate-200">{JSON.stringify(rawVal)}</span>;
                                      }
                                    } else if (typeof rawVal === 'boolean') {
                                      displayVal = <span className="font-bold text-slate-800 dark:text-slate-200">{rawVal ? 'YES' : 'NO'}</span>;
                                    } else {
                                      displayVal = <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{String(rawVal)}</span>;
                                    }
                                  }

                                  return (
                                    <div key={field.id} className="space-y-0.5">
                                      <span className="text-[10px] text-slate-400 uppercase font-medium">{field.label}</span>
                                      <div className="text-xs text-slate-800 dark:text-slate-200">
                                        {displayVal}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No business parameters filled in this configuration flow.</p>
                            )}
                          </div>
                        );
                      }

                      if (sec.type === 'documents') {
                        return (
                          <div key={sec.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                              <FileText className="w-4 h-4 text-indigo-500" />
                              <span>{sec.title}</span>
                            </div>
                            {sec.requiredDocuments && sec.requiredDocuments.length > 0 ? (
                              <div className="space-y-2">
                                {sec.requiredDocuments.map(doc => {
                                  const fileMeta = uploadedDocuments[doc.id];
                                  return (
                                    <div key={doc.id} className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">{doc.name}:</span>
                                      {fileMeta ? (
                                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[200px]">
                                          {fileMeta.filename} ({fileMeta.size})
                                        </span>
                                      ) : (
                                        <span className="text-red-500 font-bold">Missing required file</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No supplementary certificates required.</p>
                            )}
                          </div>
                        );
                      }

                      if (sec.type === 'photos') {
                        return (
                          <div key={sec.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                              <Camera className="w-4 h-4 text-indigo-500" />
                              <span>{sec.title}</span>
                            </div>
                            {uploadedPhotos.length > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                {uploadedPhotos.map(photo => (
                                  <div key={photo.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden w-12 h-12 shrink-0">
                                    <img src={photo.preview} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                                  </div>
                                ))}
                                <span className="text-[11px] text-slate-500 font-bold ml-1">({uploadedPhotos.length} photos uploaded)</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No image files uploaded.</p>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  {/* Declaration Signature */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 accent-indigo-600"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">I certify the accuracy of these details</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          By completing this onboarding, I agree to HillyTrip's partner circle rules, regulatory clearances, safety disclosures, and local operator terms.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer select-none ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStepIndex === sections.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer select-none shadow-md shadow-emerald-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Complete & Submit'} <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer select-none shadow-md shadow-indigo-950/10 active:scale-95"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
