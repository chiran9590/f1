import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { GolfClub } from '../../services/adminService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface ClubCardProps {
  club: GolfClub;
  onClubUpdated: () => void;
  onClubDeleted: () => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onClubUpdated, onClubDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: club.name,
    description: club.description || '',
    location: club.location || ''
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminService.updateGolfClub(club.id, editForm);
      setIsEditing(false);
      onClubUpdated();
      showSuccess('Club Updated', `${editForm.name} has been updated successfully.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update club';
      showError('Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await adminService.deleteGolfClub(club.id);
      setShowDeleteModal(false);
      onClubDeleted();
      showSuccess('Club Deleted', `${club.name} has been removed successfully.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete club';
      showError('Delete Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: club.name,
      description: club.description || '',
      location: club.location || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                  placeholder="Club name"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{club.location || 'No location'}</span>
              </div>
            </div>

            {!isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Club description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Club location"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {club.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{club.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="font-semibold text-gray-900">{club.member_count || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-semibold text-gray-900">{formatDate(club.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Golf Club"
        message={`Are you sure you want to delete ${club.name}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Club"
        type="danger"
        loading={loading}
      />
    </>
  );
};

// Import ConfirmModal at the bottom to avoid circular dependency
import ConfirmModal from './ConfirmModal';

export default ClubCard;
