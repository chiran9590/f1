import React, { useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { supabase, callFunction } from '../../lib/supabase';
import { useAuth } from '../../context/EnhancedAuthContext';
import { useToast } from '../../context/ToastContext';

interface Club { id: string; club_name: string }
interface Row { id: string; name: string | null; email: string | null; role: string; club_id: string | null }

const empty = { name: '', email: '', password: '', role: 'client', clubId: '' };

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<Row[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [form, setForm] = useState(empty);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const [u, c] = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, club_id').order('created_at', { ascending: false }),
      supabase.from('clubs').select('id, club_name').order('club_name'),
    ]);
    if (u.error) showError('Could not load users', u.error.message); else setUsers(u.data || []);
    if (c.error) showError('Could not load clubs', c.error.message); else setClubs(c.data || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await callFunction('create-user', { ...form, clubId: form.clubId || null });
      showSuccess('User created', form.email);
      setForm(empty);
      load();
    } catch (err: any) {
      showError('Could not create user', err.message);
    } finally {
      setCreating(false);
    }
  };

  const assignClub = async (userId: string, clubId: string) => {
    const { error } = await supabase.from('profiles').update({ club_id: clubId || null }).eq('id', userId);
    if (error) return showError('Could not assign club', error.message);
    showSuccess('Club updated');
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, club_id: clubId || null } : u)));
  };

  const remove = async (u: Row) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await callFunction('delete-user', { userId: u.id });
      showSuccess('User deleted', u.email || '');
      load();
    } catch (err: any) {
      showError('Could not delete user', err.message);
    }
  };

  const input = 'px-3 py-2 border border-gray-300 rounded-lg w-full';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <form onSubmit={createUser} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
          <UserPlus className="w-5 h-5 text-indigo-600" /> Create user
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input required className={input} placeholder="Full name" value={form.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" className={input} placeholder="Email" value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required minLength={8} type="password" className={input} placeholder="Password (min 8)" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
          <select className={input} value={form.clubId} onChange={(e) => setForm({ ...form, clubId: e.target.value })}>
            <option value="">No club yet</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.club_name}</option>)}
          </select>
        </div>
        <button disabled={creating} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {creating ? 'Creating…' : 'Create user'}
        </button>
      </form>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Club</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium text-gray-900">{u.name || '—'}</td>
                <td className="p-3 text-gray-700">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </td>
                <td className="p-3">
                  {u.role === 'admin' ? <span className="text-gray-400">n/a</span> : (
                    <select className="px-2 py-1 border border-gray-300 rounded" value={u.club_id || ''}
                            onChange={(e) => assignClub(u.id, e.target.value)}>
                      <option value="">Unassigned</option>
                      {clubs.map((c) => <option key={c.id} value={c.id}>{c.club_name}</option>)}
                    </select>
                  )}
                </td>
                <td className="p-3 text-right">
                  {u.id !== user?.id && (
                    <button onClick={() => remove(u)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete user">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
