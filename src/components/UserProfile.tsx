import React, { useState } from 'react';
import { useAuth } from '../context/EnhancedAuthContext';
import { User, Mail, Calendar, Shield, Edit2 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const handleSaveProfile = async () => {
    // TODO: Implement profile update
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {profile.full_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-600">{profile.role}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profile.full_name || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium text-gray-900 capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Account Status</h4>
              <p className="text-sm text-gray-600">
                {user.email_confirmed_at ? 'Email verified' : 'Email not verified'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.email_confirmed_at 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.email_confirmed_at ? 'Active' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProfile}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
