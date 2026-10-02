import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, MoreVertical, Shield, User } from 'lucide-react';
import { AdminUser } from '../../services/adminService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

interface UsersTableProps {
  searchQuery: string;
  onUserDeleted: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ searchQuery, onUserDeleted }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: AdminUser | null }>({
    isOpen: false,
    user: null
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await adminService.getUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      await adminService.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      setDeleteModal({ isOpen: false, user: null });
      showSuccess('User Deleted', `${user.full_name || user.email} has been removed successfully.`);
      onUserDeleted();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      showError('Delete Failed', errorMessage);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No users match your search criteria.' : 'No users have been registered yet.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {user.full_name || 'Unknown User'}
                      </h3>
                      {user.role === 'admin' && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{user.username || 'no-username'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Action Menu */}
                  {actionMenu === user.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Edit2 className="w-4 h-4" />
                        Edit User
                      </button>
                      <button
                        onClick={() => {
                          setDeleteModal({ isOpen: true, user });
                          setActionMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Sign In</p>
                  <p className="font-medium text-gray-900">{formatDate(user.last_sign_in_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={() => deleteModal.user && handleDeleteUser(deleteModal.user)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.user?.full_name || deleteModal.user?.email}? This action cannot be undone.`}
        confirmText="Delete User"
        type="danger"
      />

      {/* Click outside to close action menu */}
      {actionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenu(null)}
        />
      )}
    </>
  );
};

// Import ConfirmModal at the bottom to avoid circular dependency
import ConfirmModal from './ConfirmModal';

export default UsersTable;
