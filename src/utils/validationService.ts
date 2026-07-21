import { BusinessField, BusinessSection, BusinessConfiguration } from '../types/businessOnboarding';

export interface ValidationResult {
  fieldId: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning';
}

// Map of pre-registered custom validators
const registry: Record<string, (value: any, formData: Record<string, any>) => string | boolean> = {
  pincode: (val) => /^\d{6}$/.test(String(val)) ? true : 'Please enter a valid 6-digit PIN code.',
  positive_number: (val) => (!isNaN(Number(val)) && Number(val) > 0) ? true : 'Please enter a positive number greater than 0.',
  email: (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(val)) ? true : 'Please enter a valid email address.',
  phone: (val) => /^(?:\+91|91)?[6-9]\d{9}$/.test(String(val).replace(/[\s\-]/g, '')) ? true : 'Please enter a valid 10-digit mobile number.',
  url: (val) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(String(val)) ? true : 'Please enter a valid URL.',
  pan: (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(String(val)) ? true : 'Please enter a valid 10-character PAN card number.',
  gstin: (val) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(String(val)) ? true : 'Please enter a valid 15-character GSTIN.',
  aadhaar: (val) => /^\d{12}$/.test(String(val).replace(/\s/g, '')) ? true : 'Please enter a valid 12-digit Aadhaar number.',
  ifsc: (val) => /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(val)) ? true : 'Please enter a valid 11-character IFSC code.',
  price: (val) => (!isNaN(Number(val)) && Number(val) >= 0) ? true : 'Please enter a valid non-negative price.'
};

/**
 * Register a custom validator dynamically
 */
export const registerCustomValidator = (name: string, validatorFn: (value: any, formData: Record<string, any>) => string | boolean) => {
  registry[name] = validatorFn;
};

// Common Regular Expressions for validation
const REGEX_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(?:\+91|91)?[6-9]\d{9}$/, // Indian 10-digit mobile layout with optional +91/91
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
  aadhaar: /^\d{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
  pincode: /^\d{6}$/,
  time12: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(?:AM|PM|am|pm)$/,
  time24: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

/**
 * Evaluates whether a field is visible based on visibility conditions.
 * If hidden, it skips validation.
 */
export const isFieldVisible = (field: BusinessField, data: Record<string, any>): boolean => {
  if (!field.visibilityConditions || field.visibilityConditions.length === 0) {
    return true;
  }
  return field.visibilityConditions.every(cond => {
    const targetValue = data[cond.fieldId];
    if (cond.operator === 'equals') {
      return targetValue === cond.value;
    }
    if (cond.operator === 'not_equals') {
      return targetValue !== cond.value;
    }
    if (cond.operator === 'contains') {
      return Array.isArray(targetValue)
        ? targetValue.includes(cond.value)
        : String(targetValue).includes(String(cond.value));
    }
    if (cond.operator === 'not_empty') {
      return targetValue !== undefined && targetValue !== null && targetValue !== '';
    }
    return true;
  });
};

/**
 * Validates a single field value against its configuration constraints
 */
export const validateField = (
  field: BusinessField,
  value: any,
  formData: Record<string, any>
): ValidationResult => {
  const result = (isValid: boolean, defaultMsg: string): ValidationResult => ({
    fieldId: field.id,
    isValid,
    message: isValid ? '' : (field.errorMessage || defaultMsg),
    severity: 'error'
  });

  // Check if field is visible. If not visible, always valid.
  if (!isFieldVisible(field, formData)) {
    return result(true, '');
  }

  // Check dependsOn dependency
  if (field.dependsOn) {
    const dependentValue = formData[field.dependsOn];
    if (dependentValue === undefined || dependentValue === null || dependentValue === '') {
      return result(false, `Depends on the field "${field.dependsOn}" being filled first.`);
    }
  }

  // Check required
  const isEmpty = value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0);

  if (field.required && isEmpty) {
    return result(false, `${field.label} is required.`);
  }

  // If empty and not required, it is valid
  if (isEmpty) {
    return result(true, '');
  }

  // Validation based on type / format
  switch (field.type) {
    case 'email':
      if (!REGEX_PATTERNS.email.test(String(value))) {
        return result(false, `Please enter a valid email address.`);
      }
      break;

    case 'phone':
      if (!REGEX_PATTERNS.phone.test(String(value).replace(/[\s\-]/g, ''))) {
        return result(false, `Please enter a valid 10-digit phone number.`);
      }
      break;

    case 'url':
      if (!REGEX_PATTERNS.url.test(String(value))) {
        return result(false, `Please enter a valid URL (e.g. https://example.com).`);
      }
      break;

    case 'pan_number':
      if (!REGEX_PATTERNS.pan.test(String(value))) {
        return result(false, `Please enter a valid 10-character PAN number.`);
      }
      break;

    case 'gst_number':
      if (!REGEX_PATTERNS.gstin.test(String(value))) {
        return result(false, `Please enter a valid 15-character GSTIN.`);
      }
      break;

    case 'aadhaar_number':
      if (!REGEX_PATTERNS.aadhaar.test(String(value).replace(/\s/g, ''))) {
        return result(false, `Please enter a valid 12-digit Aadhaar number.`);
      }
      break;

    case 'bank_account': {
      const bank = value || {};
      if (!bank.accountNumber || !bank.ifscCode || !bank.bankName) {
        return result(false, 'Please complete all bank account fields.');
      }
      if (!/^\d{9,18}$/.test(String(bank.accountNumber))) {
        return result(false, 'Please enter a valid 9 to 18 digit account number.');
      }
      if (!REGEX_PATTERNS.ifsc.test(String(bank.ifscCode))) {
        return result(false, 'Please enter a valid 11-digit IFSC code.');
      }
      break;
    }

    case 'location': {
      const loc = value || {};
      if (!loc.address) {
        return result(false, 'Please specify an address.');
      }
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        return result(false, 'Please enter valid GPS coordinates (latitude -90 to 90, longitude -180 to 180).');
      }
      break;
    }

    case 'coordinates': {
      const parts = String(value).split(',');
      if (parts.length !== 2) {
        return result(false, 'Coordinates must be comma-separated: Latitude, Longitude.');
      }
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        return result(false, 'Please enter valid coordinates (latitude -90 to 90, longitude -180 to 180).');
      }
      break;
    }

    case 'number':
    case 'price':
    case 'currency': {
      const num = Number(value);
      if (isNaN(num)) {
        return result(false, 'Please enter a valid number.');
      }
      break;
    }

    case 'time':
      if (!REGEX_PATTERNS.time12.test(String(value)) && !REGEX_PATTERNS.time24.test(String(value))) {
        return result(false, 'Please enter a valid time (HH:MM or HH:MM AM/PM).');
      }
      break;
  }

  // Length constraints
  if (field.minLength !== undefined && String(value).length < field.minLength) {
    return result(false, `Minimum length is ${field.minLength} characters.`);
  }

  if (field.maxLength !== undefined && String(value).length > field.maxLength) {
    return result(false, `Maximum length is ${field.maxLength} characters.`);
  }

  // Numeric range constraints
  if (field.min !== undefined && Number(value) < field.min) {
    return result(false, `Minimum value allowed is ${field.min}.`);
  }

  if (field.max !== undefined && Number(value) > field.max) {
    return result(false, `Maximum value allowed is ${field.max}.`);
  }

  // Custom regex pattern
  if (field.pattern) {
    try {
      const rx = new RegExp(field.pattern);
      if (!rx.test(String(value))) {
        return result(false, `Format is invalid.`);
      }
    } catch (e) {
      console.error(`Invalid RegExp pattern in field ${field.id}:`, field.pattern);
    }
  }

  // Custom registered validators
  if (field.customValidator) {
    const validatorFn = registry[field.customValidator];
    if (validatorFn) {
      const validationResponse = validatorFn(value, formData);
      if (typeof validationResponse === 'string') {
        return result(false, validationResponse);
      } else if (!validationResponse) {
        return result(false, `Custom validation failed.`);
      }
    }
  }

  return result(true, '');
};

/**
 * Validates a complete form section (list of fields)
 */
export const validateSection = (
  section: BusinessSection,
  formData: Record<string, any>
): ValidationResult[] => {
  if (section.type !== 'fields' || !section.fields) {
    return [];
  }
  return section.fields.map(field => validateField(field, formData[field.id], formData));
};

/**
 * Validates an entire onboarding configuration's form fields
 */
export const validateOnboarding = (
  configuration: BusinessConfiguration,
  formData: Record<string, any>
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  for (const section of configuration.sections) {
    if (section.type === 'fields' && section.fields) {
      results.push(...validateSection(section, formData));
    }
  }
  return results;
};
