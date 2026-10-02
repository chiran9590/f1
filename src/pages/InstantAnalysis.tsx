import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/apiService';
import { tileService } from '../services/tileService';
import { InstantAnalysisResponse } from '../types';

const InstantAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<InstantAnalysisResponse | null>(null);
  const [saveToRecords, setSaveToRecords] = useState(false);
  const [error, setError] = useState<string>('');
  const [clubId, setClubId] = useState<string>('');
  const [tileName, setTileName] = useState<string>('');
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

      // Validate file size (max 50MB for ML processing)
      if (file.size > 50 * 1024 * 1024) {
        showError('File Too Large', 'File size must be less than 50MB for ML processing');
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
    if (!selectedFile || !user) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Prepare analysis request
      const analysisRequest = {
        image: selectedFile,
        club_id: clubId || undefined,
        tile_name: tileName || undefined,
      };

      // Call the real ML backend
      const response = await apiService.performInstantAnalysis(analysisRequest);

      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      const analysisResult = response.data!;
      setResult(analysisResult);

      // Optionally save to records
      if (saveToRecords) {
        try {
          await tileService.createTile({
            club_id: clubId || 'default',
            client_user_id: user.id,
            tile_name: tileName || `Instant Analysis ${new Date().toISOString()}`,
            tile_bounds: [0, 0, 0, 0], // Default bounds for instant analysis
            image: selectedFile,
          });

          showInfo('Saved to Records', 'Analysis result has been saved to your records');
        } catch (saveError) {
          console.error('Failed to save to records:', saveError);
          showError('Save Failed', 'Analysis completed but failed to save to records');
        }
      }

      showSuccess('Analysis Complete', 'Image has been analyzed successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      showError('Analysis Failed', errorMessage);
      setError(errorMessage);
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
    setClubId('');
    setTileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const reportData = {
      analysis_id: result.analysis_id,
      health_score: result.health_score,
      class_areas: result.class_areas,
      processing_time: result.processing_time,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Download Complete', 'Analysis report has been downloaded');
  };

  const getHealthStatusColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getHealthStatusLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Stressed';
    return 'Diseased';
  };

  const getHealthStatusIcon = (score: number) => {
    if (score >= 80) return '�';
    if (score >= 50) return '🟡';
    return '🔴';
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
                  Supports: JPG, PNG, WebP (Max 50MB)
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

                {/* Optional fields */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="tileName" className="block text-sm font-medium text-gray-700 mb-1">
                      Tile Name (Optional)
                    </label>
                    <input
                      id="tileName"
                      type="text"
                      value={tileName}
                      onChange={(e) => setTileName(e.target.value)}
                      placeholder="Enter a name for this analysis"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-1">
                      Club ID (Optional)
                    </label>
                    <input
                      id="clubId"
                      type="text"
                      value={clubId}
                      onChange={(e) => setClubId(e.target.value)}
                      placeholder="Enter club identifier"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
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
                {/* Health Score Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getHealthStatusColor(result.health_score)}`}>
                    {getHealthStatusIcon(result.health_score)} {getHealthStatusLabel(result.health_score)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-lg font-bold text-gray-900">{result.health_score}%</p>
                  </div>
                </div>

                {/* Class Areas Breakdown */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Health Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(result.class_areas).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay Image */}
                {result.overlay_url && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Health Map Overlay</h3>
                    <img
                      src={result.overlay_url}
                      alt="Health Map Overlay"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Processing Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Analysis Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Analysis ID: {result.analysis_id}</p>
                    <p>Processing Time: {result.processing_time.toFixed(2)}s</p>
                    <p>Completed: {new Date().toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={downloadReport}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
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
              <li>• For best results, use high-resolution images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantAnalysis;
