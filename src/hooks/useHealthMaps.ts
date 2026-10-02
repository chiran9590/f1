import { useState, useEffect } from 'react';
import { apiService, HealthMap } from '../services/apiService';
import { useAuth } from '../context/EnhancedAuthContext';

export const useHealthMaps = () => {
  const [healthMaps, setHealthMaps] = useState<HealthMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHealthMaps();
    }
  }, [user]);

  const fetchHealthMaps = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const maps = await apiService.getHealthMaps(user.id);
      setHealthMaps(maps);
    } catch (err) {
      setError('Failed to fetch health maps');
      console.error('Error fetching health maps:', err);
    } finally {
      setLoading(false);
    }
  };

  const createHealthMap = async (healthMapData: Omit<HealthMap, 'id' | 'created_at' | 'processed_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newMap = await apiService.createHealthMap({
        ...healthMapData,
        client_id: user.id,
      });
      
      setHealthMaps(prev => [newMap, ...prev]);
      return newMap;
    } catch (err) {
      setError('Failed to create health map');
      console.error('Error creating health map:', err);
      throw err;
    }
  };

  const deleteHealthMap = async (id: string) => {
    try {
      // Note: You'll need to implement this in your apiService
      // await apiService.deleteHealthMap(id);
      setHealthMaps(prev => prev.filter(map => map.id !== id));
    } catch (err) {
      setError('Failed to delete health map');
      console.error('Error deleting health map:', err);
      throw err;
    }
  };

  const refreshHealthMaps = () => {
    fetchHealthMaps();
  };

  return {
    healthMaps,
    loading,
    error,
    fetchHealthMaps,
    createHealthMap,
    deleteHealthMap,
    refreshHealthMaps,
  };
};
