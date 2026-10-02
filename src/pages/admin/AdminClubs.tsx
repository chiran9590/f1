import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface Club { id: string; club_name: string; created_at: string }

const AdminClubs: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('clubs').select('*').order('club_name');
    if (error) showError('Could not load clubs', error.message);
    else setClubs(data || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from('clubs').insert({ club_name: name.trim(), created_by: auth.user?.id });
    setBusy(false);
    if (error) return showError('Could not create club', error.message);
    showSuccess('Club created', name.trim());
    setName('');
    load();
  };

  const remove = async (club: Club) => {
    if (!confirm(`Delete club "${club.club_name}"? Users assigned to it will become unassigned.`)) return;
    const { error } = await supabase.from('clubs').delete().eq('id', club.id);
    if (error) return showError('Could not delete club', error.message);
    showSuccess('Club deleted', club.club_name);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>

      <form onSubmit={create} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex gap-3">
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="New club name (e.g. Club 001)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button disabled={busy} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
          {busy ? 'Creating…' : 'Create club'}
        </button>
      </form>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y">
        {clubs.length === 0 && <p className="p-5 text-gray-500">No clubs yet.</p>}
        {clubs.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{c.club_name}</div>
              <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
            </div>
            <button onClick={() => remove(c)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete club">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminClubs;
