import React, { useState, useEffect } from 'react';
import { Upload, Map, Users, Building, Camera, Loader2, CheckCircle, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { r2Service, UploadProgress } from '../services/r2Service';
import { useToast } from '../context/ToastContext';
import { analyzeImages } from '../services/inferenceService';

interface GolfClub {
  id: string;
  club_name: string;
  created_by?: string;
  created_at: string;
}

interface UploadSectionProps {
  activeTab: string;
}

const AdminDashboardSections: React.FC<UploadSectionProps> = ({ activeTab }) => {
  const [clubs, setClubs] = useState<GolfClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Upload Tiles state
  const [tileFiles, setTileFiles] = useState<File[]>([]);
  const [uploadingTiles, setUploadingTiles] = useState(false);
  const [tileUploadProgress, setTileUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedTiles, setUploadedTiles] = useState<string[]>([]);

  // Upload Metadata state
  const [metadataFiles, setMetadataFiles] = useState<File[]>([]);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);
  const [metadataUploadProgress, setMetadataUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedMetadata, setUploadedMetadata] = useState<string[]>([]);

  // Club Management state
  const [newClubName, setNewClubName] = useState('');
  const [newClubLocation, setNewClubLocation] = useState('');
  const [creatingClub, setCreatingClub] = useState(false);

  // Client Assignment state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [assigningClub, setAssigningClub] = useState(false);

  // Instant Analyze state
  const [analyzeFiles,setAnalyzeFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResults, setAnalyzeResults] = useState<any[]>([]);

  useEffect(() => {
    fetchClubs();
    fetchClients();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('club_name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        return;
      }
      
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('full_name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleTileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTileFiles(files);
  };

  const handleMetadataFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMetadataFiles(files);
  };

  const handleAnalyzeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      showError('Too Many Files', 'Please select up to 10 images');
      return;
    }
    setAnalyzeFiles(files);
  };

  const uploadTiles = async () => {
    if (!selectedClub || tileFiles.length === 0) {
      showError('Missing Info', 'Please select a club and files');
      return;
    }

    setUploadingTiles(true);
    const results: string[] = [];

    for (const file of tileFiles) {
      const result = await r2Service.uploadFile(
        file,
        selectedClub,
        'tiles',
        (progress) => setTileUploadProgress(progress)
      );

      if (result.success) {
        results.push(result.key);
      }
    }

    setUploadedTiles(results);
    setUploadingTiles(false);
    setTileUploadProgress(null);
    setTileFiles([]);

    if (results.length === tileFiles.length) {
      showSuccess('Upload Complete', `Successfully uploaded ${results.length} tile files`);
    } else {
      showError('Partial Upload', `${results.length}/${tileFiles.length} files uploaded`);
    }
  };

  const uploadMetadata = async () => {
    if (!selectedClub || metadataFiles.length === 0) {
      showError('Missing Info', 'Please select a club and files');
      return;
    }

    setUploadingMetadata(true);
    const results: string[] = [];

    for (const file of metadataFiles) {
      const result = await r2Service.uploadFile(
        file,
        selectedClub,
        'metadata',
        (progress) => setMetadataUploadProgress(progress)
      );

      if (result.success) {
        results.push(result.key);
      }
    }

    setUploadedMetadata(results);
    setUploadingMetadata(false);
    setMetadataUploadProgress(null);
    setMetadataFiles([]);

    if (results.length === metadataFiles.length) {
      showSuccess('Upload Complete', `Successfully uploaded ${results.length} metadata files`);
    } else {
      showError('Partial Upload', `${results.length}/${metadataFiles.length} files uploaded`);
    }
  };

  const createClub = async () => {
    if (!newClubName) {
      showError('Missing Info', 'Please enter a club name');
      return;
    }

    setCreatingClub(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .insert({
          club_name: newClubName,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      showSuccess('Success', `Club ${newClubName} has been created`);
      setNewClubName('');
      setNewClubLocation('');
      fetchClubs();
    } catch (error: any) {
      showError('Creation Failed', error.message);
    } finally {
      setCreatingClub(false);
    }
  };

  const assignClubToClient = async () => {
    if (!selectedClient || !selectedClub) {
      showError('Missing Info', 'Please select a client and club');
      return;
    }

    setAssigningClub(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ club_id: selectedClub })
        .eq('id', selectedClient);

      if (error) throw error;

      showSuccess('Assignment Complete', 'Client has been assigned to the club');
      setSelectedClient('');
      fetchClients();
    } catch (error: any) {
      showError('Assignment Failed', error.message);
    } finally {
      setAssigningClub(false);
    }
  };

  const runInstantAnalysis = async () => {
    if (analyzeFiles.length === 0) {
      showError('No Files', 'Please select images to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const results = await analyzeImages(analyzeFiles);
      setAnalyzeResults(results);
      showSuccess('Analysis Complete', 'Image analysis completed');
    } catch (error: any) {
      showError('Analysis Failed', error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Club Selector (common for upload sections) */}
      {(activeTab === 'upload-tiles' || activeTab === 'upload-metadata') && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Golf Club
          </label>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a club --</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.club_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upload Tiles Section */}
      {activeTab === 'upload-tiles' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Map className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Map Tiles</h2>
              <p className="text-sm text-gray-600">Upload tile files to Cloudflare R2 for the selected club</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.tif,.tiff"
              onChange={handleTileFileSelect}
              className="hidden"
              id="tile-upload"
            />
            <label
              htmlFor="tile-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Select Tile Files
            </label>
            <p className="mt-2 text-sm text-gray-500">
              {tileFiles.length > 0 ? `${tileFiles.length} files selected` : 'PNG, JPG, TIF supported'}
            </p>
          </div>

          {tileUploadProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium">{tileUploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${tileUploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={uploadTiles}
            disabled={uploadingTiles || !selectedClub || tileFiles.length === 0}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploadingTiles ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Tiles'
            )}
          </button>

          {uploadedTiles.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Uploaded {uploadedTiles.length} files</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Metadata Section */}
      {activeTab === 'upload-metadata' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Upload className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Metadata</h2>
              <p className="text-sm text-gray-600">Upload metadata files to Cloudflare R2 for the selected club</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              multiple
              accept=".json,.xml,.geojson"
              onChange={handleMetadataFileSelect}
              className="hidden"
              id="metadata-upload"
            />
            <label
              htmlFor="metadata-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Metadata Files
            </label>
            <p className="mt-2 text-sm text-gray-500">
              {metadataFiles.length > 0 ? `${metadataFiles.length} files selected` : 'JSON, XML, GeoJSON supported'}
            </p>
          </div>

          {metadataUploadProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium">{metadataUploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${metadataUploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={uploadMetadata}
            disabled={uploadingMetadata || !selectedClub || metadataFiles.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploadingMetadata ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Metadata'
            )}
          </button>

          {uploadedMetadata.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Uploaded {uploadedMetadata.length} files</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Club & Client Management Section */}
      {activeTab === 'club-client-management' && (
        <div className="space-y-6">
          {/* Create New Club */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Building className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New Club</h2>
                <p className="text-sm text-gray-600">Add a new golf club to the system</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Pebble Beach Golf Links"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (optional)</label>
                <input
                  type="text"
                  value={newClubLocation}
                  onChange={(e) => setNewClubLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Pebble Beach, California"
                />
              </div>
              <button
                onClick={createClub}
                disabled={creatingClub || !newClubName}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {creatingClub ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Club'
                )}
              </button>
            </div>
          </div>

          {/* Assign Client to Club */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Client to Club</h2>
                <p className="text-sm text-gray-600">Assign an existing client to a golf club</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email}) - {client.club_id ? 'Assigned' : 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Club</label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a club --</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.club_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={assignClubToClient}
                disabled={assigningClub || !selectedClient || !selectedClub}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {assigningClub ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Club'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Analyze Section */}
      {activeTab === 'instant-analyze' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Camera className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Instant Analyze</h2>
              <p className="text-sm text-gray-600">Upload 1-10 images for AI health analysis</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg"
              onChange={handleAnalyzeFileSelect}
              className="hidden"
              id="analyze-upload"
            />
            <label
              htmlFor="analyze-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Select Images
            </label>
            <p className="mt-2 text-sm text-gray-500">
              {analyzeFiles.length > 0 ? `${analyzeFiles.length} files selected` : 'PNG, JPG supported (max 10)'}
            </p>
          </div>

          <button
            onClick={runInstantAnalysis}
            disabled={analyzing || analyzeFiles.length === 0}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Run Analysis'
            )}
          </button>

          {analyzeResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyzeResults.map((result, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{result.imageName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.healthScore > 70 ? 'bg-green-100 text-green-800' :
                        result.healthScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Health: {result.healthScore}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{result.result}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardSections;
