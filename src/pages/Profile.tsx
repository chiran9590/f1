import React, { useState, useEffect } from 'react';
import { User, Mail, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await authService.updateProfile(user.id, formData);
      
      if (error) {
        showError('Update Failed', error);
        return;
      }

      await refreshProfile();
      setIsEditing(false);
      showSuccess('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      showError('Update Failed', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
      });
    }
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'User'}
              </h2>
              <p className="text-gray-600">@{profile.email?.split('@')[0] || 'user'}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {profile.full_name || 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.email?.split('@')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400">@</span>
                  <span className="text-gray-900">
                    {profile.email?.split('@')[0] || 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className={`text-sm font-medium ${
                    user.email_confirmed_at ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.email_confirmed_at ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
