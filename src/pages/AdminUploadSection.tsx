import React, { useState, useEffect, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';

interface MapUpload {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  status: 'completed' | 'failed' | 'uploading';
}

const AdminUploadSection: React.FC = () => {
  const [uploads, setUploads] = useState<MapUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('map_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching uploads:', error);
        showError('Error', 'Failed to fetch uploads');
        return;
      }

      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      showError('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/png', 'image/jpeg', 'image/tiff'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        showError('Invalid File', `${file.name} is not a valid file type. Only PNG, JPG, and TIFF files are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        showError('File Too Large', `${file.name} exceeds the 10MB size limit.`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || selectedFiles.length === 0) return;

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        // Create upload record with 'uploading' status
        const { data: uploadRecord, error: insertError } = await supabase
          .from('map_uploads')
          .insert({
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
            status: 'uploading',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating upload record:', insertError);
          continue;
        }

        try {
          // Upload file to Supabase Storage
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('map-uploads')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('map-uploads')
            .getPublicUrl(fileName);

          // Update upload record with success
          await supabase
            .from('map_uploads')
            .update({
              file_url: publicUrl,
              status: 'completed',
            })
            .eq('id', uploadRecord.id);

        } catch (error) {
          console.error('Error uploading file:', error);
          
          // Update upload record with failure
          await supabase
            .from('map_uploads')
            .update({
              status: 'failed',
            })
            .eq('id', uploadRecord.id);
        }
      }

      showSuccess('Upload Complete', `${selectedFiles.length} file(s) uploaded successfully`);
      setSelectedFiles([]);
      fetchUploads();
    } catch (error) {
      console.error('Error uploading files:', error);
      showError('Upload Error', 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'uploading':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Section</h1>
        <p className="text-gray-600 mt-2">Upload golf map images and manage file uploads</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop files here' : 'Upload Map Files'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Supported formats: PNG, JPG, TIFF (Max file size: 10MB)
          </p>
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.tiff"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 cursor-pointer"
          >
            <Upload className="w-5 h-5 mr-2" />
            Select Files
          </label>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <File className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {uploads.map((upload) => (
            <div key={upload.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    {getStatusIcon(upload.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{upload.file_name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(upload.file_size)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(upload.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(upload.status)}`}>
                    {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                  </span>
                  {upload.status === 'completed' && upload.file_url && (
                    <a
                      href={upload.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {uploads.length === 0 && (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads yet</h3>
            <p className="text-gray-500">Upload your first golf map file to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUploadSection;
