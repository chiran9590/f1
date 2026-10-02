import React, { useEffect, useRef, useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { r2Service } from '../../services/r2Service';
import { useToast } from '../../context/ToastContext';

interface Club { id: string; club_name: string }
interface Item { name: string; size: number; pct: number; status: 'waiting' | 'uploading' | 'done' | 'error'; error?: string }
interface Recorded { id: string; file_name: string; file_size: number | null; uploaded_at: string }

const POOL = 3; // files uploaded in parallel

const AdminUpload: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState('');
  const [kind, setKind] = useState<'tiles' | 'metadata'>('tiles');
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<Recorded[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('clubs').select('id, club_name').order('club_name').then(({ data, error }) => {
      if (error) showError('Could not load clubs', error.message); else setClubs(data || []);
    });
    // eslint-disable-next-line
  }, []);

  const loadRecent = async () => {
    if (!clubId) return setRecent([]);
    const { data } = await supabase.from(kind).select('id, file_name, file_size, uploaded_at')
      .eq('club_id', clubId).order('uploaded_at', { ascending: false }).limit(20);
    setRecent(data || []);
  };
  useEffect(() => { loadRecent(); /* eslint-disable-next-line */ }, [clubId, kind]);

  const patch = (i: number, p: Partial<Item>) => setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...p } : it)));

  const start = async (files: File[]) => {
    if (!clubId) return showError('Choose a club first');
    if (files.length === 0) return;
    setBusy(true);
    setItems(files.map((f) => ({ name: f.name, size: f.size, pct: 0, status: 'waiting' })));

    let next = 0, ok = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        patch(i, { status: 'uploading' });
        const r = await r2Service.uploadFile(files[i], clubId, kind, (p) => patch(i, { pct: p.percentage }));
        if (r.success) { ok++; patch(i, { status: 'done', pct: 100 }); }
        else patch(i, { status: 'error', error: r.error });
      }
    };
    await Promise.all(Array.from({ length: Math.min(POOL, files.length) }, worker));

    setBusy(false);
    if (fileInput.current) fileInput.current.value = '';
    if (ok === files.length) showSuccess('Upload complete', `${ok} file(s) uploaded`);
    else showError('Some uploads failed', `${ok}/${files.length} uploaded. See the list below.`);
    loadRecent();
  };

  const mb = (n: number | null) => (n == null ? '' : `${(n / 1024 / 1024).toFixed(2)} MB`);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Upload to Cloudflare</h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-700">Club
          <select value={clubId} onChange={(e) => setClubId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">— select a club —</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.club_name}</option>)}
          </select>
        </label>
        <div className="text-sm text-gray-700">Type
          <div className="mt-1 flex rounded-lg border border-gray-300 overflow-hidden">
            {(['tiles', 'metadata'] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)}
                className={`flex-1 py-2 ${kind === k ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>
                {k === 'tiles' ? 'Tiles' : 'Metadata'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (!busy) start(Array.from(e.dataTransfer.files)); }}
        className={`block border-2 border-dashed rounded-lg p-10 text-center bg-white ${clubId ? 'border-indigo-300 cursor-pointer' : 'border-gray-200 opacity-60'}`}
      >
        <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
        <div className="font-medium text-gray-800">Drop {kind} files here or click to choose</div>
        <div className="text-sm text-gray-500">Files go to the selected club's folder in Cloudflare R2</div>
        <input ref={fileInput} type="file" multiple className="hidden" disabled={!clubId || busy}
               onChange={(e) => start(Array.from(e.target.files || []))} />
      </label>

      {items.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y">
          {items.map((it, i) => (
            <div key={i} className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-gray-800">{it.name}</span>
                <span className="flex items-center gap-1 text-gray-500">
                  {it.status === 'done' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {it.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                  {it.status === 'uploading' ? `${it.pct}%` : it.status}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded mt-2"><div className="h-1.5 bg-indigo-500 rounded" style={{ width: `${it.pct}%` }} /></div>
              {it.error && <div className="text-xs text-red-600 mt-1">{it.error}</div>}
            </div>
          ))}
        </div>
      )}

      {clubId && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 font-semibold text-gray-900 border-b">Latest {kind} for this club</div>
          {recent.length === 0 ? <p className="p-4 text-gray-500 text-sm">Nothing uploaded yet.</p> : (
            <ul className="divide-y text-sm">
              {recent.map((r) => (
                <li key={r.id} className="p-3 flex justify-between">
                  <span className="truncate">{r.file_name}</span>
                  <span className="text-gray-500">{mb(r.file_size)} · {new Date(r.uploaded_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUpload;
