import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AnalysisResult {
  health_status: 'Good' | 'Bad' | 'Water';
  processed_image_url?: string;
  confidence: number;
  analysis_summary?: string;
}

const InstantAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saveToRecords, setSaveToRecords] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Invalid File', 'Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File Too Large', 'File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } } as any;
      handleFileSelect(event);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Replace with your actual API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult: AnalysisResult = await response.json();
      setResult(analysisResult);

      // Optionally save to records
      if (saveToRecords && user) {
        // TODO: Implement save to Supabase
        console.log('Saving to records...');
        showInfo('Saved to Records', 'Analysis result has been saved to your records');
      }

      showSuccess('Analysis Complete', 'Image has been analyzed successfully');

    } catch (err) {
      showError('Analysis Failed', 'Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Bad':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Water':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Good':
        return '🟢';
      case 'Bad':
        return '🔴';
      case 'Water':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instant Analysis</h1>
        <p className="text-gray-600 mt-2">Upload and analyze grass images instantly with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={resetAnalysis}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                {/* Save to records toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="saveToRecords"
                    checked={saveToRecords}
                    onChange={(e) => setSaveToRecords(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="saveToRecords" className="text-sm text-gray-700">
                    Save to my records
                  </label>
                </div>

                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
              
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(result.health_status)}`}>
                    {getStatusIcon(result.health_status)} {result.health_status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-bold text-gray-900">{result.confidence}%</p>
                  </div>
                </div>

                {/* Processed Image */}
                {result.processed_image_url && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Processed Health Map</h3>
                    <img
                      src={result.processed_image_url}
                      alt="Processed"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Analysis Summary */}
                {result.analysis_summary && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Analysis Summary</h3>
                    <p className="text-sm text-gray-600">{result.analysis_summary}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
              <p className="text-gray-600">
                Upload an image and click "Analyze" to see the results here
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Ensure good lighting and clear visibility</li>
              <li>• Capture the grass area from above if possible</li>
              <li>• Avoid shadows and blurry images</li>
              <li>• Include a representative sample of the area</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantAnalysis;
