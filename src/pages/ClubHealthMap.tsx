import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Layers, Eye, EyeOff, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';
import { tileService } from '../services/tileService';
import { mapTileService } from '../services/supabaseClient';
import { MapTile, MapboxStyle } from '../types';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'tile' | 'overlay';
  source?: string;
}

const ClubHealthMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tiles, setTiles] = useState<MapTile[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [mapStyle, setMapStyle] = useState<MapboxStyle>('satellite-streets-v12');
  const { user, profile, isAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [-74.5, 40], // Default center (New York)
        zoom: 10,
        pitch: 0,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to initialize map. Please check your Mapbox token.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (!map.current) return;

    try {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
    } catch (err) {
      console.error('Failed to update map style:', err);
    }
  }, [mapStyle]);

  // Load tiles for user
  const loadTiles = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const userTiles = isAdmin
        ? await mapTileService.getMapTiles()
        : await tileService.getTilesForClient(user.id);
      setTiles(userTiles);

      // Extract unique clubs
      const clubs = [...new Set(userTiles.map(tile => tile.club_id))];
      if (clubs.length > 0 && !selectedClub) {
        setSelectedClub(clubs[0]);
      }

      // Initialize layers
      const initialLayers: MapLayer[] = userTiles.map(tile => ({
        id: tile.id,
        name: tile.tile_name,
        visible: true,
        opacity: 0.7,
        type: 'tile',
        source: tile.cloudflare_url,
      }));

      // Add overlay layers for tiles with overlays
      const overlayLayers: MapLayer[] = userTiles
        .filter(tile => tile.overlay_cloudflare_url)
        .map(tile => ({
          id: `${tile.id}-overlay`,
          name: `${tile.tile_name} (Overlay)`,
          visible: false,
          opacity: 0.6,
          type: 'overlay',
          source: tile.overlay_cloudflare_url,
        }));

      setLayers([...initialLayers, ...overlayLayers]);

      // Fit map to show all tiles
      if (userTiles.length > 0 && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        userTiles.forEach(tile => {
          if (tile.tile_bounds && tile.tile_bounds.length === 4) {
            const [west, south, east, north] = tile.tile_bounds;
            bounds.extend([west, south]);
            bounds.extend([east, north]);
          }
        });

        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tiles';
      setError(errorMessage);
      showError('Load Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tiles on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadTiles();
    }
  }, [user]);

  // Add tile layers to map
  useEffect(() => {
    if (!map.current || layers.length === 0) return;

    layers.forEach(layer => {
      if (layer.source && layer.visible) {
        // Remove existing layer if it exists
        if (map.current!.getLayer(layer.id)) {
          map.current!.removeLayer(layer.id);
        }
        if (map.current!.getSource(layer.id)) {
          map.current!.removeSource(layer.id);
        }

        // Add source
        map.current!.addSource(layer.id, {
          type: 'image',
          url: layer.source,
          coordinates: getTileCoordinates(),
        });

        // Add layer
        map.current!.addLayer({
          id: layer.id,
          type: 'raster',
          source: layer.id,
          paint: {
            'raster-opacity': layer.opacity,
          },
        });
      } else if (!layer.visible) {
        // Remove layer if not visible
        if (map.current!.getLayer(layer.id)) {
          map.current!.removeLayer(layer.id);
        }
        if (map.current!.getSource(layer.id)) {
          map.current!.removeSource(layer.id);
        }
      }
    });
  }, [layers]);

  // Get tile coordinates (placeholder - would need actual tile bounds)
  const getTileCoordinates = (): [[number, number], [number, number], [number, number], [number, number]] => {
    // This is a placeholder - in a real implementation, you'd get the actual bounds
    // from the tile data or calculate them from the tile metadata
    return [
      [-74.5, 40],
      [-74.4, 40],
      [-74.4, 40.1],
      [-74.5, 40.1],
    ];
  };

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Update layer opacity
  const updateOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));

    // Update map layer opacity
    if (map.current && map.current.getLayer(layerId)) {
      map.current.setPaintProperty(layerId, 'raster-opacity', opacity);
    }
  };

  // Filter tiles by club
  const filteredTiles = selectedClub 
    ? tiles.filter(tile => tile.club_id === selectedClub)
    : tiles;

  // Get unique clubs
  const clubs = [...new Set(tiles.map(tile => tile.club_id))];

  // Download map as image
  const downloadMap = async () => {
    if (!map.current) return;

    try {
      const canvas = map.current.getCanvas();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-map-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showSuccess('Download Complete', 'Map has been downloaded successfully');
    } catch (err) {
      showError('Download Failed', 'Failed to download map');
    }
  };

  // Refresh tiles
  const refreshTiles = () => {
    loadTiles();
    showInfo('Refreshed', 'Tile data has been refreshed');
  };

  const getHealthColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getHealthLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Stressed';
    return 'Diseased';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Club Health Map</h1>
          <p className="text-gray-600 mt-2">Visualize grass health across your golf course</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshTiles}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={downloadMap}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Map</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Map Style Selector */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Map Style:</label>
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as MapboxStyle)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="satellite-streets-v12">Satellite Streets</option>
                  <option value="satellite-v9">Satellite</option>
                  <option value="streets-v12">Streets</option>
                  <option value="outdoors-v12">Outdoors</option>
                  <option value="light-v11">Light</option>
                  <option value="dark-v11">Dark</option>
                </select>
              </div>
            </div>

            {/* Map */}
            <div 
              ref={mapContainer} 
              className="h-96 lg:h-[600px] relative"
            >
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Club Filter */}
          {clubs.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Filter by Club</h3>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Clubs</option>
                {clubs.map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
            </div>
          )}

          {/* Layer Controls */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Map Layers
            </h3>
            
            {layers.length === 0 ? (
              <p className="text-gray-500 text-sm">No layers available</p>
            ) : (
              <div className="space-y-3">
                {layers
                  .filter(layer => {
                    const tileId = layer.id.replace('-overlay', '');
                    const tile = tiles.find(t => t.id === tileId);
                    return !selectedClub || tile?.club_id === selectedClub;
                  })
                  .map(layer => (
                    <div key={layer.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleLayer(layer.id)}
                          className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                          {layer.visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                          <span className="truncate">{layer.name}</span>
                        </button>
                      </div>
                      
                      {layer.visible && (
                        <div className="pl-6">
                          <label className="text-xs text-gray-600">Opacity</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Tile Statistics */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Tile Statistics</h3>
            
            {filteredTiles.length === 0 ? (
              <p className="text-gray-500 text-sm">No tiles found</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tiles:</span>
                  <span className="font-medium">{filteredTiles.length}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 mb-1">Health Distribution:</div>
                  {['Healthy', 'Stressed', 'Diseased'].map(status => {
                    const count = filteredTiles.filter(tile => {
                      const score = tile.health_score;
                      if (status === 'Healthy') return score && score >= 80;
                      if (status === 'Stressed') return score && score >= 50 && score < 80;
                      if (status === 'Diseased') return score && score < 50;
                      return false;
                    }).length;
                    
                    return (
                      <div key={status} className="flex justify-between text-xs">
                        <span className="text-gray-600">{status}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Recent Tiles:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredTiles
                      .slice(-3)
                      .reverse()
                      .map(tile => (
                        <div key={tile.id} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="truncate pr-2">{tile.tile_name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getHealthColor(tile.health_score)}`}>
                              {getHealthLabel(tile.health_score)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubHealthMap;
