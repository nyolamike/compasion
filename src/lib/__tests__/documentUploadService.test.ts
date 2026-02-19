import { describe, it, expect, beforeEach } from 'vitest';
import { documentUploadService } from '../documentUploadService';

describe('DocumentUploadService', () => {
  describe('validateFile', () => {
    it('should reject files larger than 5MB', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      const result = documentUploadService.validateFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must be less than');
    });

    it('should accept PDF files', () => {
      const pdfFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const result = documentUploadService.validateFile(pdfFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept JPEG files', () => {
      const jpegFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = documentUploadService.validateFile(jpegFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept PNG files', () => {
      const pngFile = new File(['test content'], 'test.png', {
        type: 'image/png',
      });

      const result = documentUploadService.validateFile(pngFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject unsupported file types', () => {
      const docFile = new File(['test content'], 'test.doc', {
        type: 'application/msword',
      });

      const result = documentUploadService.validateFile(docFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type not supported');
    });

    it('should accept files with correct extension even if MIME type is missing', () => {
      const file = new File(['test content'], 'test.pdf', {
        type: '',
      });

      const result = documentUploadService.validateFile(file);

      expect(result.isValid).toBe(true);
    });

    it('should accept files under 5MB', () => {
      const smallFile = new File(['x'.repeat(1024 * 1024)], 'small.pdf', {
        type: 'application/pdf',
      });

      const result = documentUploadService.validateFile(smallFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getPublicUrl', () => {
    it('should generate a public URL for a file path', () => {
      const filePath = 'test-registration/nanny_approval_123456.pdf';
      const url = documentUploadService.getPublicUrl(filePath);

      expect(url).toBeTruthy();
      expect(typeof url).toBe('string');
      expect(url).toContain(filePath);
    });
  });
});
