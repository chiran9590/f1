import { UploadResponse, PresignedUploadResponse, MetadataUploadRequest } from '../types';
import { apiService } from './apiService';

class CloudflareService {
  private readonly R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

  // Upload file to Cloudflare R2 using presigned URL
  async uploadToR2(
    file: File,
    folder: 'tiles' | 'overlays' | 'metadata' = 'tiles'
  ): Promise<UploadResponse> {
    try {
      const result = await apiService.uploadToCloudflareR2(file, folder);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.data!;
    } catch (error) {
      throw new Error(`Cloudflare R2 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get presigned URL for direct upload
  async getPresignedUploadUrl(
    fileName: string,
    folder: 'tiles' | 'overlays' | 'metadata' = 'tiles'
  ): Promise<PresignedUploadResponse> {
    try {
      const result = await apiService.getPresignedUploadUrl(fileName, folder);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get presigned URL');
      }

      return result.data!;
    } catch (error) {
      throw new Error(`Failed to get presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Save metadata to R2
  async saveMetadata(request: MetadataUploadRequest): Promise<void> {
    try {
      const result = await apiService.saveMetadata(request.tile_id, request.metadata);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save metadata');
      }
    } catch (error) {
      throw new Error(`Failed to save metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate unique file key for R2
  generateFileKey(
    folder: 'tiles' | 'overlays' | 'metadata',
    tileId: string,
    fileName: string
  ): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${tileId}_${timestamp}_${sanitizedFileName}`;
  }

  // Generate public URL for R2 object
  getPublicUrl(key: string): string {
    if (this.R2_PUBLIC_URL) {
      return `${this.R2_PUBLIC_URL}/${key}`;
    }
    
    // Fallback for development
    const baseUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-XXXXX.r2.dev';
    return `${baseUrl}/${key}`;
  }

  // Upload tile image (original)
  async uploadTileImage(tileId: string, file: File): Promise<UploadResponse> {
    try {
      const presignedResult = await this.getPresignedUploadUrl(`${tileId}_${file.name}`, 'tiles');
      
      // Upload file directly using presigned URL
      const uploadResponse = await fetch(presignedResult.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return {
        publicUrl: presignedResult.public_url,
        key: presignedResult.key,
        etag: uploadResponse.headers.get('etag') || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to upload tile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload overlay image (ML result)
  async uploadOverlayImage(tileId: string, file: File): Promise<UploadResponse> {
    try {
      const presignedResult = await this.getPresignedUploadUrl(`${tileId}_overlay.png`, 'overlays');
      
      // Upload file directly using presigned URL
      const uploadResponse = await fetch(presignedResult.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return {
        publicUrl: presignedResult.public_url,
        key: presignedResult.key,
        etag: uploadResponse.headers.get('etag') || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to upload overlay image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload metadata JSON
  async uploadMetadataJson(tileId: string, metadata: any): Promise<UploadResponse> {
    const fileName = `${tileId}_metadata.json`;
    
    try {
      const presignedResult = await this.getPresignedUploadUrl(fileName, 'metadata');
      
      // Create JSON blob
      const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json',
      });
      
      // Upload file directly using presigned URL
      const uploadResponse = await fetch(presignedResult.upload_url, {
        method: 'PUT',
        body: jsonBlob,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return {
        publicUrl: presignedResult.public_url,
        key: presignedResult.key,
        etag: uploadResponse.headers.get('etag') || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete file from R2 (if needed in the future)
  async deleteFromR2(key: string): Promise<void> {
    // This would require implementing a delete endpoint in the backend
    // For now, this is a placeholder
    console.warn(`Delete operation not implemented for key: ${key}`);
  }

  // Check if file exists (optional utility)
  async checkFileExists(key: string): Promise<boolean> {
    try {
      const publicUrl = this.getPublicUrl(key);
      const response = await fetch(publicUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get file info (size, type, etc.)
  async getFileInfo(key: string): Promise<{
    size: number;
    type: string;
    lastModified: string;
  } | null> {
    try {
      const publicUrl = this.getPublicUrl(key);
      const response = await fetch(publicUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        return null;
      }

      return {
        size: parseInt(response.headers.get('content-length') || '0'),
        type: response.headers.get('content-type') || 'unknown',
        lastModified: response.headers.get('last-modified') || new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  // Batch upload multiple files
  async uploadMultipleFiles(
    files: Array<{ file: File; folder: 'tiles' | 'overlays' | 'metadata'; tileId: string }>
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map(({ file, folder }) => 
      this.uploadToR2(file, folder).catch(error => ({
        publicUrl: '',
        key: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      }))
    );

    const results = await Promise.allSettled(uploadPromises);
    
    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          publicUrl: '',
          key: '',
          error: result.reason instanceof Error ? result.reason.message : 'Upload failed',
        };
      }
    }).filter(result => !('error' in result)) as UploadResponse[];
  }

  // Validate file before upload
  validateFile(file: File, maxSizeMB: number = 50): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Check file type for images
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file.type.includes('image') && !allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Allowed formats: JPEG, PNG, WebP',
      };
    }

    // Note: JSON validation is handled in uploadMetadataJson method
    return { valid: true };
  }
}

export const cloudflareService = new CloudflareService();
export default cloudflareService;
