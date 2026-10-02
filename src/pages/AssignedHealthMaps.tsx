import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/EnhancedAuthContext';

interface HealthMap {
  id: string;
  club_name: string;
  location: string;
  image_url: string;
  health_status: 'Good' | 'Bad' | 'Water';
  processed_at: string;
  created_at: string;
}

const AssignedHealthMaps: React.FC = () => {
  const [healthMaps, setHealthMaps] = useState<HealthMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Good' | 'Bad' | 'Water'>('All');
  const [selectedMap, setSelectedMap] = useState<HealthMap | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchHealthMaps();
  }, [user]);

  const fetchHealthMaps = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_healthmaps')
        .select('*')
        .eq('client_id', user.id)
        .order('processed_at', { ascending: false });

      if (error) throw error;
      setHealthMaps(data || []);
    } catch (error) {
      console.error('Error fetching health maps:', error);
    } finally {
      setLoading(false);
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

  const filteredMaps = healthMaps.filter(map => {
    const matchesSearch = map.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         map.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || map.health_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Assigned Health Maps</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Health Maps</h1>
          <p className="text-gray-600 mt-2">View and manage your assigned club health maps</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by club name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Good">Good</option>
            <option value="Bad">Bad</option>
            <option value="Water">Water</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredMaps.length} of {healthMaps.length} health maps
      </div>

      {/* Health Maps Grid */}
      {filteredMaps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No health maps found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your filters or search terms'
              : 'You haven\'t been assigned any health maps yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaps.map((map) => (
            <div key={map.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {map.image_url ? (
                  <img
                    src={map.image_url}
                    alt={map.club_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(map.health_status)}`}>
                    {getStatusIcon(map.health_status)} {map.health_status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{map.club_name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{map.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(map.processed_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMap(map)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMap.club_name}</h2>
                <button
                  onClick={() => setSelectedMap(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Original Image</h3>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    {selectedMap.image_url ? (
                      <img
                        src={selectedMap.image_url}
                        alt="Original"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500">No image available</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Processed Health Map</h3>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <span className="text-gray-500">Processed map will appear here</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Analysis Summary</h3>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedMap.health_status)}`}>
                    {getStatusIcon(selectedMap.health_status)} {selectedMap.health_status}
                  </span>
                  <span className="text-sm text-gray-600">
                    Processed on {new Date(selectedMap.processed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedHealthMaps;
