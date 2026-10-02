import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAuth } from '../context/EnhancedAuthContext';
import { r2Service } from '../services/r2Service';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// Set Mapbox access token (you'll need to add this to .env)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

interface GolfCourseMapProps {
  clubId?: string;
}

const GolfCourseMap: React.FC<GolfCourseMapProps> = ({ clubId: propClubId }) => {
  const { profile } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(15);
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);

  const clubId = propClubId || profile?.club_id;

  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      setError('No club assigned. Please contact an administrator.');
      return;
    }

    if (!mapboxgl.accessToken) {
      setLoading(false);
      setError('Mapbox access token not configured. Please add VITE_MAPBOX_ACCESS_TOKEN to .env');
      return;
    }

    if (!mapContainer.current) return;

    // Initialize map
    const initializeMap = async () => {
      try {
        setLoading(true);

        // Fetch club info to get club_name for R2 path
        const { data: clubData } = await supabase
          .from('clubs')
          .select('club_name')
          .eq('id', clubId)
          .single();

        const clubName = clubData?.club_name || 'unknown';
        
        // Fetch tiles for this club from R2
        await r2Service.listFiles(clubName, 'tiles');
        
        // For now, we'll use a placeholder tile source
        // In production, this would use the actual tiles from R2
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-122.4194, 37.7749], // Default to San Francisco (will be updated based on club)
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
        });

        mapInstance.on('load', () => {
          setLoading(false);
          
          // Add a tile layer for the golf course
          // In production, this would use the tiles fetched from R2
          if (mapInstance.getSource('golf-tiles')) {
            return;
          }

          // Placeholder: Add a sample tile layer
          // This would be replaced with actual R2 tiles
          mapInstance.addSource('golf-tiles', {
            type: 'raster',
            tiles: [
              // Placeholder tile URL pattern - replace with actual R2 URLs
              `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
            ],
            tileSize: 256,
          });

          mapInstance.addLayer({
            id: 'golf-tiles-layer',
            type: 'raster',
            source: 'golf-tiles',
            minzoom: 0,
            maxzoom: 22,
          });
        });

        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
          setError('Failed to load map');
          setLoading(false);
        });

        // Update zoom state when map zoom changes
        mapInstance.on('zoom', () => {
          setZoom(mapInstance.getZoom());
        });

        // Update bearing state when map rotates
        mapInstance.on('rotate', () => {
          setBearing(mapInstance.getBearing());
        });

        // Update pitch state when map tilts
        mapInstance.on('pitch', () => {
          setPitch(mapInstance.getPitch());
        });

        map.current = mapInstance;

        // Cleanup
        return () => {
          mapInstance.remove();
        };
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Failed to initialize map');
        setLoading(false);
      }
    };

    initializeMap();
  }, [clubId]);

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (map.current) {
      map.current.resetNorth();
      map.current.setPitch(0);
      map.current.setZoom(15);
    }
  };

  if (!clubId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <MapPin className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Club Assigned</h3>
        <p className="text-gray-600 text-center">
          You haven't been assigned to a golf club yet. Please contact an administrator to get access to the golf course map.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h3>
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <span className="text-gray-600">Loading map for {clubId}...</span>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Map controls */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleReset}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Reset view"
          >
            <RotateCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Zoom indicator */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-10">
          <span className="text-sm font-medium text-gray-700">
            Zoom: {Math.round(zoom)}
          </span>
        </div>
      )}

      {/* Club name indicator */}
      {!loading && !error && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10">
          <span className="text-sm font-medium text-gray-900">
            {clubId}
          </span>
        </div>
      )}
    </div>
  );
};

export default GolfCourseMap;
