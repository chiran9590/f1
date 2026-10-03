import React, { useEffect, useRef, useState } from 'react';
import { Upload, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { r2Service } from '../../services/r2Service';
import { useToast } from '../../context/ToastContext';

interface Club { id: string; club_name: string }
interface Picked { file: File; path: string }
interface Failure { path: string; error: string }

type Kind = 'tiles' | 'metadata';

/** "Health_Map/20/541082/349330.png" -> "20/541082/349330.png" (null if it is not a z/x/y tile) */
export function toTilePath(rel: string): string | null {
  const m = rel.match(/(\d+)\/(\d+)\/(\d+)\.(png|jpe?g|webp)$/i);
  return m ? `${m[1]}/${m[2]}/${m[3]}.${m[4].toLowerCase()}` : null;
}

async function walk(entry: any, prefix: string, out: { file: File; rel: string }[]) {
  if (entry.isFile) {
    const file: File = await new Promise((res, rej) => entry.file(res, rej));
    out.push({ file, rel: prefix + entry.name });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    let batch: any[];
    do {
      batch = await new Promise<any[]>((res, rej) => reader.readEntries(res, rej));
      for (const e of batch) await walk(e, `${prefix}${entry.name}/`, out);
    } while (batch.length > 0);
  }
}

const AdminUpload: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState('');
  const [kind, setKind] = useState<Kind>('tiles');
  const [picked, setPicked] = useState<Picked[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState<Failure[]>([]);
  const [finished, setFinished] = useState(false);
  const [counts, setCounts] = useState({ tiles: 0, metadata: 0 });
  const [metaNames, setMetaNames] = useState<string[]>([]);
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('clubs').select('id, club_name').order('club_name').then(({ data, error }) => {
      if (error) showError('Could not load clubs', error.message); else setClubs(data || []);
    });
    // eslint-disable-next-line
  }, []);

  const loadCounts = async () => {
    if (!clubId) { setCounts({ tiles: 0, metadata: 0 }); setMetaNames([]); return; }
    const count = async (t: Kind) =>
      (await supabase.from(t).select('*', { count: 'exact', head: true }).eq('club_id', clubId)).count ?? 0;
    const [tiles, metadata] = await Promise.all([count('tiles'), count('metadata')]);
    setCounts({ tiles, metadata });
    const { data } = await supabase.from('metadata').select('file_name').eq('club_id', clubId).order('file_name');
    setMetaNames((data || []).map((d: { file_name: string }) => d.file_name));
  };
  useEffect(() => { loadCounts(); setPicked([]); setSkipped(0); setFinished(false); /* eslint-disable-next-line */ }, [clubId, kind]);

  /** Turns raw selected/dropped files into uploadable entries for the current type. */
  const accept = (raw: { file: File; rel: string }[]) => {
    const good: Picked[] = [];
    let skip = 0;
    for (const { file, rel } of raw) {
      if (kind === 'tiles') {
        const p = toTilePath(rel);
        if (p) good.push({ file, path: p }); else skip++;
      } else if (/\.(geojson|json)$/i.test(file.name)) {
        good.push({ file, path: file.name });
      } else skip++;
    }
    setPicked(good); setSkipped(skip); setFinished(false); setFailed([]);
    if (good.length === 0) {
      showError('Nothing to upload', kind === 'tiles'
        ? 'Choose the tiles folder that contains the zoom/x/y.png structure (for example 20/541082/349330.png).'
        : 'Choose .geojson or .json files.');
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    accept(files.map((f) => ({ file: f, rel: (f as any).webkitRelativePath || f.name })));
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (busy || !clubId) return;
    const entries = Array.from(e.dataTransfer.items || [])
      .map((i) => (i as any).webkitGetAsEntry?.())
      .filter(Boolean); // must be read before any await
    const out: { file: File; rel: string }[] = [];
    if (entries.length) for (const en of entries) await walk(en, '', out);
    else Array.from(e.dataTransfer.files).forEach((f) => out.push({ file: f, rel: f.name }));
    accept(out);
  };

  const zooms = Array.from(new Set(picked.map((p) => p.path.split('/')[0]))).sort((a, b) => +a - +b);

  const start = async () => {
    if (!clubId || picked.length === 0) return;
    setBusy(true); setFinished(false); setFailed([]);
    setProgress({ done: 0, total: picked.length });
    const r = await r2Service.uploadMany(picked, clubId, kind, (p) => {
      setProgress({ done: p.done, total: p.total });
      setFailed(p.failed);
    });
    setFailed(r.failed);
    setBusy(false); setFinished(true);
    if (r.recordError) showError('Uploaded, but saving records failed', r.recordError);
    else if (r.failed.length === 0) showSuccess('Upload complete', `${r.ok} file(s) uploaded`);
    else showError('Some files failed', `${r.ok} uploaded, ${r.failed.length} failed. See the list below.`);
    setPicked([]);
    if (folderInput.current) folderInput.current.value = '';
    if (fileInput.current) fileInput.current.value = '';
    loadCounts();
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Upload to Cloudflare</h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-700">Club
          <select value={clubId} onChange={(e) => setClubId(e.target.value)} disabled={busy}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">— select a club —</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.club_name}</option>)}
          </select>
        </label>
        <div className="text-sm text-gray-700">Type
          <div className="mt-1 flex rounded-lg border border-gray-300 overflow-hidden">
            {(['tiles', 'metadata'] as const).map((k) => (
              <button key={k} type="button" disabled={busy} onClick={() => setKind(k)}
                className={`flex-1 py-2 ${kind === k ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>
                {k === 'tiles' ? 'Health-map tiles' : 'Metadata (GeoJSON)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center bg-white ${clubId ? 'border-indigo-300' : 'border-gray-200 opacity-60'}`}
      >
        <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
        {kind === 'tiles' ? (
          <>
            <div className="font-medium text-gray-800">Drop the tiles folder here</div>
            <div className="text-sm text-gray-500 mb-4">
              The folder must contain the <code>zoom/x/y.png</code> structure, e.g. <code>20/541082/349330.png</code>
            </div>
            <button type="button" disabled={!clubId || busy} onClick={() => folderInput.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
              <FolderOpen className="w-4 h-4" /> Choose tiles folder
            </button>
            <input ref={folderInput} type="file" className="hidden" onChange={onInput}
                   {...({ webkitdirectory: '', directory: '' } as any)} />
          </>
        ) : (
          <>
            <div className="font-medium text-gray-800">Drop GeoJSON files here</div>
            <div className="text-sm text-gray-500 mb-4">Course_boundary, Buildings, Open Water, Woodland… (.geojson / .json)</div>
            <button type="button" disabled={!clubId || busy} onClick={() => fileInput.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
              <Upload className="w-4 h-4" /> Choose files
            </button>
            <input ref={fileInput} type="file" multiple accept=".geojson,.json" className="hidden" onChange={onInput} />
          </>
        )}
      </div>

      {picked.length > 0 && !busy && (
        <div className="bg-white rounded-lg border border-indigo-200 shadow-sm p-5 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <b>{picked.length}</b> {kind === 'tiles' ? 'tiles' : 'files'} ready
            {kind === 'tiles' && zooms.length > 0 && <> · zoom level{zooms.length > 1 ? 's' : ''} {zooms.join(', ')}</>}
            {skipped > 0 && <span className="text-gray-500"> · {skipped} other file(s) ignored</span>}
          </div>
          <button onClick={start} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Upload {picked.length} file(s)
          </button>
        </div>
      )}

      {(busy || finished) && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              {finished && (failed.length === 0
                ? <CheckCircle className="w-4 h-4 text-green-600" />
                : <XCircle className="w-4 h-4 text-red-600" />)}
              {busy ? 'Uploading…' : 'Finished'}
            </span>
            <span>{progress.done} / {progress.total} ({pct}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded"><div className="h-2 bg-indigo-500 rounded" style={{ width: `${pct}%` }} /></div>
          {failed.length > 0 && (
            <div className="mt-4 text-sm">
              <div className="font-medium text-red-700 mb-1">{failed.length} failed</div>
              <ul className="max-h-40 overflow-auto text-xs text-red-600 space-y-1">
                {failed.slice(0, 50).map((f, i) => <li key={i}>{f.path}: {f.error}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {clubId && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-sm text-gray-700">
          <div className="font-semibold text-gray-900 mb-2">Stored for this club</div>
          <div>{counts.tiles} tile file(s) · {counts.metadata} metadata file(s)</div>
          {metaNames.length > 0 && <div className="mt-2 text-gray-500">{metaNames.join(' · ')}</div>}
        </div>
      )}
    </div>
  );
};

export default AdminUpload;
