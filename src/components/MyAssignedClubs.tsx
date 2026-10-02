import React, { useState } from 'react';
import { Building, MapPin, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';

interface Club {
  id: string;
  club_name: string;
  description: string;
  created_at: string;
}

interface ClubHealthmap {
  id: string;
  club_id: string;
  image_url: string;
  uploaded_at: string;
}

interface ClubWithHealthmaps extends Club {
  healthmaps?: ClubHealthmap[];
}

const MyAssignedClubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<ClubWithHealthmaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHealthmaps, setLoadingHealthmaps] = useState(false);
  const { user } = useAuth();
  const { showError } = useToast();

  React.useEffect(() => {
    fetchAssignedClubs();
  }, []);

  const fetchAssignedClubs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_assignments')
        .select(`
          clubs (
            id,
            club_name,
            description,
            created_at
          )
        `)
        .eq('client_id', user.id);

      if (error) throw error;

      const clubData = data?.map(item => {
        const club = item.clubs as any;
        return club ? {
          id: club.id,
          club_name: club.club_name,
          description: club.description,
          created_at: club.created_at
        } : null;
      }).filter(Boolean) as Club[];
      
      setClubs(clubData);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      showError('Error', 'Failed to load assigned clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubHealthmaps = async (club: Club) => {
    setLoadingHealthmaps(true);
    try {
      const { data, error } = await supabase
        .from('club_healthmaps')
        .select('*')
        .eq('club_id', club.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setSelectedClub({
        ...club,
        healthmaps: data || []
      });
    } catch (error) {
      console.error('Error fetching healthmaps:', error);
      showError('Error', 'Failed to load club healthmaps');
    } finally {
      setLoadingHealthmaps(false);
    }
  };

  const handleViewHealthmaps = (club: Club) => {
    fetchClubHealthmaps(club);
  };

  const handleBackToClubs = () => {
    setSelectedClub(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  // Show healthmaps view if a club is selected
  if (selectedClub) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToClubs}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Clubs
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedClub.club_name} Healthmaps
            </h2>
          </div>
        </div>

        {loadingHealthmaps ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedClub.healthmaps && selectedClub.healthmaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedClub.healthmaps.map((healthmap) => (
                  <div key={healthmap.id} className="border rounded-lg overflow-hidden">
                    <img
                      src={healthmap.image_url}
                      alt="Club Healthmap"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Healthmap</span>
                        <span className="text-xs text-gray-500">
                          {new Date(healthmap.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No healthmaps available</p>
                <p className="text-sm text-gray-400 mt-1">
                  This club hasn't uploaded any healthmaps yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show clubs list
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Assigned Clubs</h2>
        <div className="text-sm text-gray-500">
          {clubs.length} club{clubs.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {clubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div key={club.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-teal-600" />
                </div>
                <span className="text-xs text-gray-500">
                  Member since {new Date(club.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{club.club_name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{club.description}</p>
              
              <button
                onClick={() => handleViewHealthmaps(club)}
                className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>View Healthmaps</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No clubs assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Contact your administrator to get assigned to clubs
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAssignedClubs;
