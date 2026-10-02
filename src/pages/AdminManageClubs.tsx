import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';

interface GolfClub {
  id: string;
  name: string;
  description: string;
  location: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

const AdminManageClubs: React.FC = () => {
  const [clubs, setClubs] = useState<GolfClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<GolfClub | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('golf_clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clubs:', error);
        showError('Error', 'Failed to fetch clubs');
        return;
      }

      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      showError('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
    });
    setEditingClub(null);
  };

  const openModal = (club?: GolfClub) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        name: club.name,
        description: club.description,
        location: club.location,
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Error', 'You must be logged in to perform this action');
      return;
    }

    try {
      setSubmitting(true);

      if (editingClub) {
        // Update existing club
        const { error } = await supabase
          .from('golf_clubs')
          .update({
            name: formData.name,
            description: formData.description,
            location: formData.location,
          })
          .eq('id', editingClub.id);

        if (error) {
          throw error;
        }

        showSuccess('Success', 'Club updated successfully');
      } else {
        // Create new club
        const { error } = await supabase
          .from('golf_clubs')
          .insert({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            created_by: user.id,
          });

        if (error) {
          throw error;
        }

        showSuccess('Success', 'Club created successfully');
      }

      closeModal();
      fetchClubs();
    } catch (error) {
      console.error('Error saving club:', error);
      showError('Error', 'Failed to save club');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('golf_clubs')
        .delete()
        .eq('id', clubId);

      if (error) {
        throw error;
      }

      showSuccess('Success', 'Club deleted successfully');
      fetchClubs();
    } catch (error) {
      console.error('Error deleting club:', error);
      showError('Error', 'Failed to delete club');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Clubs</h1>
          <p className="text-gray-600 mt-2">Create and manage golf clubs</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Club
        </button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <Building className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {club.location}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(club)}
                  className="text-indigo-600 hover:text-indigo-900 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClub(club.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{club.description}</p>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Created {new Date(club.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first golf club.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Club
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingClub ? 'Edit Club' : 'Create New Club'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Club Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter club name"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter club location"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter club description"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : (editingClub ? 'Update Club' : 'Create Club')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageClubs;
