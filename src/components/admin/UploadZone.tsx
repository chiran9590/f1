import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Clock } from 'lucide-react';
import { MapTile } from '../../services/adminService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface UploadZoneProps {
  onUploadComplete: (tile: MapTile) => void;
  clubs: Array<{ id: string; name: string }>;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete, clubs }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedClub, setSelectedClub] = useState('');
  const { showSuccess, showError } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') && 
      file.size <= 10 * 1024 * 1024 // 10MB
    );

    if (validFiles.length !== droppedFiles.length) {
      showError('Invalid Files', 'Only image files under 10MB are allowed.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [showError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      file.size <= 10 * 1024 * 1024 // 10MB
    );

    if (validFiles.length !== selectedFiles.length) {
      showError('Invalid Files', 'Only image files under 10MB are allowed.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [showError]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadFiles = async () => {
    if (files.length === 0 || !selectedClub) {
      showError('Upload Error', 'Please select files and a club before uploading.');
      return;
    }

    setUploading(true);
    const newProgress: { [key: string]: number } = {};

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${i}`;
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          newProgress[fileKey] = progress;
          setUploadProgress({ ...newProgress });
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Create map tile record
        const tile = await adminService.createMapTile({
          club_id: selectedClub,
          file_name: file.name,
          file_url: URL.createObjectURL(file), // In production, this would be the actual URL
          file_size: file.size,
          upload_status: 'pending',
          uploaded_by: 'current-user-id' // This should come from auth context
        });

        // Update status to completed
        await adminService.updateMapTileStatus(tile.id, 'completed');
        newProgress[fileKey] = 100;
        setUploadProgress({ ...newProgress });
        
        onUploadComplete(tile);
      }

      showSuccess('Upload Complete', `${files.length} file(s) uploaded successfully.`);
      setFiles([]);
      setUploadProgress({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      showError('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (progress > 0) return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragging ? 'Drop files here' : 'Drag & Drop Tile Files'}
        </h3>
        <p className="text-gray-600 mb-4">
          or <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">browse files</label>
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <p className="text-sm text-gray-500">
          Supported formats: PNG, JPG, TIFF (Max 10MB per file)
        </p>
      </div>

      {/* Club Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Golf Club</label>
        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a club...</option>
          {clubs.map(club => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Selected Files</h4>
          <div className="space-y-3">
            {files.map((file, index) => {
              const fileKey = `${file.name}-${index}`;
              const progress = uploadProgress[fileKey] || 0;
              
              return (
                <div key={fileKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(progress)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      {progress > 0 && `${progress}%`}
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg">
                      <div 
                        className={`h-full rounded-b-lg transition-all duration-300 ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setFiles([])}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0 || !selectedClub}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} File{files.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
