/**
 * Utility functions for the registration system
 */

/**
 * Generates a cryptographically secure random token for registration links
 * @param length - Length of the token (default: 32)
 * @returns A secure random token string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a unique registration reference number
 * Format: REG-YYYYMMDD-XXXXX (e.g., REG-20260216-A1B2C)
 * @returns A unique registration reference string
 */
export function generateRegistrationReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 5 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  return `REG-${year}${month}${day}-${randomPart}`;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates mobile number format (basic validation)
 * @param mobile - Mobile number to validate
 * @returns True if mobile number is valid
 */
export function validateMobileNumber(mobile: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = mobile.replace(/[\s\-()]/g, '');
  // Check if it's 10-15 digits (with optional + prefix)
  const mobileRegex = /^\+?\d{10,15}$/;
  return mobileRegex.test(cleaned);
}

/**
 * Validates file type for document uploads
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed
 */
export function validateFileType(file: File, allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png']): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns True if file size is within limit
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Checks if a registration link has expired
 * @param expiresAt - Expiration date string
 * @returns True if link has expired
 */
export function isLinkExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Calculates expiration date based on training session date
 * Links expire 1 day before the training session
 * @param trainingDate - Training session date string
 * @returns Expiration date string
 */
export function calculateLinkExpiration(trainingDate: string): string {
  const sessionDate = new Date(trainingDate);
  const expirationDate = new Date(sessionDate);
  expirationDate.setDate(expirationDate.getDate() - 1);
  return expirationDate.toISOString();
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
