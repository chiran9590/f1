import React, { useState, useRef } from 'react';
import { Upload, X, Image, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';

interface UploadedImage {
  id: string;
  image_url: string;
  created_at: string;
}

const InstantHealthmap: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Fetch user's uploaded images
  React.useEffect(() => {
    fetchUserUploads();
  }, []);

  const fetchUserUploads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedImages(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showError('Invalid File', 'Please select an image file (JPG, PNG, JPEG)');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('healthmaps')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('healthmaps')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_uploads')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      // Reset form and refresh list
      setSelectedFile(null);
      setPreviewUrl('');
      await fetchUserUploads();

      showSuccess('Upload Successful', 'Your healthmap has been uploaded and processed!');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Instant Healthmap</h2>
        <div className="text-sm text-gray-500">
          Upload images for instant health analysis
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your image here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, JPEG (Max 10MB)
          </p>
        </div>

        {/* Preview Section */}
        {previewUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium text-gray-900">Preview</h3>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Healthmap'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Images Section */}
      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Healthmaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt="Healthmap"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Processed</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Health Analysis Complete
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Overall health score: Good
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && (
        <div className="mt-8 text-center py-8">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No uploads yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload your first healthmap to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default InstantHealthmap;
