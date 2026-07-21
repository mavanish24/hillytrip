export type BusinessFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'gallery'
  | 'document'
  | 'location'
  | 'yes_no'
  | 'price'
  | 'currency'
  | 'rating'
  | 'tags'
  | 'amenities'
  | 'languages'
  | 'vehicle_types'
  | 'room_types'
  | 'payment_methods'
  | 'bank_account'
  | 'gst_number'
  | 'pan_number'
  | 'aadhaar_number'
  | 'license_number'
  | 'coordinates';

export interface VisibilityCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value?: any;
}

export interface BusinessField {
  id: string;
  label: string;
  type: BusinessFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;
  options?: { label: string; value: string }[];
  optionsSource?: string;
  
  // Validation Rules
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
  dependsOn?: string;
  errorMessage?: string;
  
  // Conditional rendering
  visibilityConditions?: VisibilityCondition[];
}

export interface BusinessDocument {
  id: string;
  name: string;
  description: string;
  maxSizeMB?: number;
  allowedExtensions?: string[];
}

export interface BusinessSection {
  id: string;
  title: string;
  description: string;
  icon?: string; // e.g. 'building', 'file-text', 'camera', 'check-circle'
  type: 'fields' | 'documents' | 'photos' | 'review';
  fields?: BusinessField[];
  requiredDocuments?: BusinessDocument[];
  optionalDocuments?: BusinessDocument[];
}

export interface BusinessConfiguration {
  businessType: string;
  name: string;
  sections: BusinessSection[];
  workflowId?: string;
}
