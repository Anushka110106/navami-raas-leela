/**
 * Enhanced Reference Code Validation System
 * Integrates with Google Forms for secure payment processing
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    timestamp: number;
    userHash: string;
    checksum: string;
  };
}

export interface GoogleFormsValidationResult {
  success: boolean;
  message: string;
  data?: {
    formId: string;
    submissionTime: string;
    status: 'pending' | 'validated' | 'processed';
  };
}

/**
 * Generate user-specific hash for additional validation
 */
export const generateUserHash = (name: string, email: string, phone: string): string => {
  const userData = `${name.toLowerCase().trim()}${email.toLowerCase().trim()}${phone.trim()}`;
  let hash = 0;
  
  for (let i = 0; i < userData.length; i++) {
    const char = userData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 4);
};

/**
 * Generate checksum for reference validation
 */
export const generateChecksum = (data: string): string => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data.charCodeAt(i);
  }
  return (sum % 100).toString().padStart(2, '0');
};

/**
 * Generate secure reference number
 */
export const generateReferenceNumber = (name: string, email: string, phone: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  const userHash = generateUserHash(name, email, phone);
  const checksum = generateChecksum(`${timestamp}${random}${userHash}`);
  
  return `NRL${timestamp.slice(-6)}${random}${userHash.slice(0, 2)}${checksum}`;
};

/**
 * Validate reference number format and integrity
 */
export const validateReferenceNumber = (
  refNum: string, 
  name: string, 
  email: string, 
  phone: string
): ValidationResult => {
  // Basic format validation
  if (!refNum.startsWith('NRL') || refNum.length !== 19) {
    return {
      valid: false,
      error: 'Invalid reference code format'
    };
  }
  
  const timestamp = refNum.slice(3, 9);
  const random = refNum.slice(9, 15);
  const userHash = refNum.slice(15, 17);
  const checksum = refNum.slice(-2);
  
  // Validate timestamp (should be within reasonable range)
  const refTimestamp = parseInt(timestamp, 36);
  const currentTimestamp = Date.now();
  const oneYearAgo = currentTimestamp - (365 * 24 * 60 * 60 * 1000);
  
  if (refTimestamp < oneYearAgo || refTimestamp > currentTimestamp) {
    return {
      valid: false,
      error: 'Reference code timestamp is invalid'
    };
  }
  
  // Validate user hash and checksum
  const expectedUserHash = generateUserHash(name, email, phone);
  const calculatedChecksum = generateChecksum(`${timestamp}${random}${expectedUserHash}`);
  
  const isValid = checksum === calculatedChecksum && userHash === expectedUserHash.slice(0, 2);
  
  return {
    valid: isValid,
    error: isValid ? undefined : 'Reference code does not match your registration details',
    details: {
      timestamp: refTimestamp,
      userHash: expectedUserHash,
      checksum: calculatedChecksum
    }
  };
};

/**
 * Validate reference code against Google Forms submissions
 * This function should be called from your backend API
 */
export const validateWithGoogleForms = async (
  refNum: string,
  userDetails: { name: string; email: string; phone: string }
): Promise<GoogleFormsValidationResult> => {
  try {
    // First validate the reference code format
    const formatValidation = validateReferenceNumber(
      refNum, 
      userDetails.name, 
      userDetails.email, 
      userDetails.phone
    );
    
    if (!formatValidation.valid) {
      return {
        success: false,
        message: formatValidation.error || 'Invalid reference code format'
      };
    }
    
    // Call backend API to check Google Forms
    const response = await fetch('/api/validate-google-forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceCode: refNum,
        userDetails,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Validation service error');
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Google Forms validation error:', error);
    return {
      success: false,
      message: 'Validation service temporarily unavailable. Please try again.'
    };
  }
};

/**
 * Backend API endpoint handler for Google Forms validation
 * This should be implemented in your backend service
 */
export const handleGoogleFormsValidation = async (
  referenceCode: string,
  userDetails: { name: string; email: string; phone: string }
): Promise<GoogleFormsValidationResult> => {
  try {
    // 1. Connect to Google Sheets API or your database
    // 2. Query for the reference code in submitted forms
    // 3. Verify user details match
    // 4. Check if payment is already processed
    
    // Example implementation (replace with actual Google Sheets API calls):
    /*
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: 'your-spreadsheet-id',
      range: 'Form Responses!A:Z',
    });
    
    const rows = response.data.values;
    const matchingRow = rows?.find(row => 
      row.includes(referenceCode) && 
      row.includes(userDetails.email)
    );
    
    if (!matchingRow) {
      return {
        success: false,
        message: 'Reference code not found in registration system'
      };
    }
    */
    
    // For demo purposes, return success for valid format
    const formatValidation = validateReferenceNumber(
      referenceCode,
      userDetails.name,
      userDetails.email,
      userDetails.phone
    );
    
    return {
      success: formatValidation.valid,
      message: formatValidation.valid 
        ? 'Reference code validated successfully'
        : formatValidation.error || 'Validation failed',
      data: formatValidation.valid ? {
        formId: 'demo-form-id',
        submissionTime: new Date().toISOString(),
        status: 'validated'
      } : undefined
    };
    
  } catch (error) {
    console.error('Backend validation error:', error);
    return {
      success: false,
      message: 'Internal validation error'
    };
  }
};

/**
 * Client-side validation helper
 */
export const isValidReferenceFormat = (refNum: string): boolean => {
  return refNum.startsWith('NRL') && refNum.length === 19;
};

/**
 * Extract timestamp from reference code
 */
export const extractTimestamp = (refNum: string): number | null => {
  if (!isValidReferenceFormat(refNum)) return null;
  
  const timestamp = refNum.slice(3, 9);
  return parseInt(timestamp, 36);
};

/**
 * Check if reference code is expired
 */
export const isReferenceExpired = (refNum: string, expiryHours: number = 24): boolean => {
  const timestamp = extractTimestamp(refNum);
  if (!timestamp) return true;
  
  const now = Date.now();
  const expiryTime = timestamp + (expiryHours * 60 * 60 * 1000);
  
  return now > expiryTime;
};