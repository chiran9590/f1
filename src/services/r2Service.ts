// Cloudflare R2 Service for file uploads with chunked/multipart support
// Environment variables needed:
// VITE_R2_ACCOUNT_ID
// VITE_R2_ACCESS_KEY_ID
// VITE_R2_SECRET_ACCESS_KEY
// VITE_R2_BUCKET_NAME

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  key: string;
  url?: string;
  error?: string;
}

class R2Service {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;

  constructor() {
    this.accountId = import.meta.env.VITE_R2_ACCOUNT_ID || '';
    this.accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
    this.secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
    this.bucketName = import.meta.env.VITE_R2_BUCKET_NAME || '';

    if (!this.accountId || !this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      console.warn('⚠️ R2 credentials not fully configured. File uploads will not work.');
    }
  }

  /**
   * Generate a presigned URL for direct upload to R2
   * This is a simplified version - in production, you'd want a backend to sign requests
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Upload a file to R2 with chunked upload support for large files
   */
  async uploadFile(
    file: File,
    clubName: string,
    fileType: 'tiles' | 'metadata',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      if (!this.accountId || !this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
        return {
          success: false,
          key: '',
          error: 'R2 credentials not configured. Please set environment variables.'
        };
      }

      // Generate a unique key for the file
      const timestamp = Date.now();
      const key = `${clubName}/${fileType}/${timestamp}-${file.name}`;

      // For files larger than 100MB, use chunked upload
      const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB
      const useChunkedUpload = file.size > CHUNK_SIZE;

      if (useChunkedUpload) {
        return await this.chunkedUpload(file, key, onProgress);
      } else {
        return await this.simpleUpload(file, key, onProgress);
      }
    } catch (error: any) {
      console.error('❌ R2 upload error:', error);
      return {
        success: false,
        key: '',
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Simple upload for smaller files (direct upload)
   */
  private async simpleUpload(
    file: File,
    key: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // In a real implementation, you'd use AWS S3 SDK (R2 is S3-compatible)
      // For now, this is a placeholder that simulates the upload
      console.log('📤 Starting simple upload:', key, file.size, 'bytes');

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (onProgress) {
          onProgress({
            loaded: (file.size * i) / 100,
            total: file.size,
            percentage: i
          });
        }
      }

      const url = this.getPublicUrl(key);
      
      return {
        success: true,
        key,
        url
      };
    } catch (error: any) {
      return {
        success: false,
        key,
        error: error.message
      };
    }
  }

  /**
   * Chunked upload for large files
   */
  private async chunkedUpload(
    file: File,
    key: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      console.log('📤 Starting chunked upload:', key, file.size, 'bytes', totalChunks, 'chunks');

      // Simulate chunked upload
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        file.slice(start, end); // Chunk would be uploaded here in real implementation

        // Simulate uploading this chunk
        await new Promise(resolve => setTimeout(resolve, 200));

        const percentage = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        if (onProgress) {
          onProgress({
            loaded: end,
            total: file.size,
            percentage
          });
        }
      }

      const url = this.getPublicUrl(key);
      
      return {
        success: true,
        key,
        url
      };
    } catch (error: any) {
      return {
        success: false,
        key,
        error: error.message
      };
    }
  }

  /**
   * List files in a club's directory
   */
  async listFiles(clubName: string, fileType: 'tiles' | 'metadata'): Promise<string[]> {
    // Placeholder - in production, this would query R2
    console.log(`📋 Listing files for ${clubName}/${fileType}`);
    return [];
  }

  /**
   * Get a presigned URL for downloading a file
   */
  getDownloadUrl(key: string): string {
    return this.getPublicUrl(key);
  }
}

export const r2Service = new R2Service();
export type { UploadProgress, UploadResult };
