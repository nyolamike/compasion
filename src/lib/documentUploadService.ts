import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

class DocumentUploadService {
  private readonly BUCKET_NAME = 'registration-documents';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  private readonly ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

  /**
   * Validate a file before upload
   */
  validateFile(file: File): ValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${(this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB`,
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = this.ALLOWED_TYPES.includes(file.type.toLowerCase());
    const isValidExtension = this.ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      return {
        isValid: false,
        error: `File type not supported. Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Upload a document to Supabase Storage
   */
  async uploadDocument(
    file: File,
    registrationId: string,
    documentType: 'nanny_approval' | 'waiver_liability'
  ): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${registrationId}/${documentType}_${timestamp}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: 'Failed to upload document. Please try again.',
        };
      }

      return {
        success: true,
        filePath: data.path,
      };
    } catch (error) {
      console.error('Unexpected upload error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload.',
      };
    }
  }

  /**
   * Get public URL for a document
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete a document from storage
   */
  async deleteDocument(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected delete error:', error);
      return false;
    }
  }

  /**
   * Ensure the storage bucket exists (for setup)
   */
  async ensureBucketExists(): Promise<boolean> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false, // Private bucket for security
          fileSizeLimit: this.MAX_FILE_SIZE,
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }

        console.log(`Created storage bucket: ${this.BUCKET_NAME}`);
      }

      return true;
    } catch (error) {
      console.error('Unexpected error ensuring bucket exists:', error);
      return false;
    }
  }
}

export const documentUploadService = new DocumentUploadService();
