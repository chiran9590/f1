import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Search, ChevronDown, Shield, Mail, Loader2, MapPin, Calendar } from 'lucide-react';
import { authService, Profile } from '../services/enhancedAuthService';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

interface UserManagementProps {
  onUserSelect?: (user: Profile) => void;
}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'admin'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<'client' | 'admin'>('client');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [userToAssignClub, setUserToAssignClub] = useState<Profile | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [availableClubs, setAvailableClubs] = useState<Array<{ id: string; club_name: string }>>([]);
  const [isAssigningClub, setIsAssigningClub] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers, error } = await authService.getAllUsers();
      
      if (error) {
        showError('Fetch Failed', error);
        return;
      }
      
      setUsers(fetchedUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Fetch Failed', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, club_name')
        .order('club_name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        return;
      }
      
      setAvailableClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (user: Profile) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await authService.deleteUser(userToDelete.id);
      
      if (error) {
        showError('Delete Failed', error);
        return;
      }

      showSuccess('Success', `User ${userToDelete.name} has been deleted`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Delete Failed', 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditRole = (user: Profile) => {
    setUserToEdit(user);
    setNewRole(user.role as 'client' | 'admin');
    setShowRoleModal(true);
  };

  const confirmRoleUpdate = async () => {
    if (!userToEdit) return;

    try {
      setIsUpdatingRole(true);
      const { error } = await authService.updateUserRole(userToEdit.id, newRole);
      
      if (error) {
        showError('Update Failed', error);
        return;
      }

      showSuccess('Success', `User role updated to ${newRole}`);
      setShowRoleModal(false);
      setUserToEdit(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      showError('Update Failed', 'Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleAssignClub = (user: Profile) => {
    setUserToAssignClub(user);
    setSelectedClub(user.club_id || '');
    setShowClubModal(true);
  };

  const confirmClubAssignment = async () => {
    if (!userToAssignClub) return;

    try {
      setIsAssigningClub(true);
      const { error } = await authService.updateProfile(userToAssignClub.id, { club_id: selectedClub || undefined });
      
      if (error) {
        showError('Assignment Failed', error);
        return;
      }

      showSuccess('Success', `Club ${selectedClub || 'unassigned'} for ${userToAssignClub.name}`);
      setShowClubModal(false);
      setUserToAssignClub(null);
      setSelectedClub('');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error assigning club:', error);
      showError('Assignment Failed', 'Failed to assign club');
    } finally {
      setIsAssigningClub(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage all users and their permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, phone, or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'client' | 'admin')}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No users have been created yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.club_id ? (
                        <span className="text-sm text-green-600">Assigned</span>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAssignClub(user)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Assign Club"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRole(user)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No users have been created yet'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showRoleModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit User Role</h3>
                <p className="text-sm text-gray-600">Change user permissions</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Update role for <strong>{userToEdit.name}</strong>
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={newRole === 'client'}
                    onChange={(e) => setNewRole(e.target.value as 'client')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Client</div>
                    <div className="text-sm text-gray-500">Can upload images and view their own analysis results</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value as 'admin')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Admin</div>
                    <div className="text-sm text-gray-500">Full system access including user management</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                disabled={isUpdatingRole}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleUpdate}
                disabled={isUpdatingRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Club Assignment Modal */}
      {showClubModal && userToAssignClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Club</h3>
                <p className="text-sm text-gray-600">Assign golf club to user</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Assign club for <strong>{userToAssignClub.name}</strong>
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="club"
                    value=""
                    checked={selectedClub === ''}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">No Club Assigned</div>
                    <div className="text-sm text-gray-500">User will wait for admin assignment</div>
                  </div>
                </label>
                
                {availableClubs.map((club) => (
                  <label key={club.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="club"
                      value={club.id}
                      checked={selectedClub === club.id}
                      onChange={(e) => setSelectedClub(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{club.club_name}</div>
                      <div className="text-sm text-gray-500">Assign this golf club</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClubModal(false)}
                disabled={isAssigningClub}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmClubAssignment}
                disabled={isAssigningClub}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isAssigningClub ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
    </div>
  );
};

export default UserManagement;
