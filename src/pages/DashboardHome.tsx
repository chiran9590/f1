import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  Gauge,
  Crosshair,
  RotateCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import LogoutButton from '../components/LogoutButton';

const DashboardHome: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
  const analysisRunIdRef = useRef(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    swing_angle: number;
    speed: number;
    accuracy: number;
    health_score: number;
    class_areas: {
      healthy: number;
      stressed: number;
      diseased: number;
      bare_ground: number;
      other: number;
    };
    overlay_url: string;
    processing_time: number;
  } | null>(null);
  const [club, setClub] = useState('Driver');
  const [zoom, setZoom] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  const metrics = useMemo(() => {
    if (analysis) {
      return {
        swingAngle: `${analysis.swing_angle.toFixed(1)} deg`,
        speed: `${analysis.speed.toFixed(1)} mph`,
        accuracy: `${analysis.accuracy.toFixed(1)}%`,
      };
    }

    const base = selectedFile ? 1 : 0;
    return {
      swingAngle: `${(32 + base * 4).toFixed(1)} deg`,
      speed: `${(92 + base * 11).toFixed(1)} mph`,
      accuracy: `${(81 + base * 7).toFixed(1)}%`,
    };
  }, [selectedFile, analysis]);

  const startBackendAnalysis = async (file: File, clubName: string) => {
    const runId = ++analysisRunIdRef.current;
    setAnalysisError(null);
    setAnalysis(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (clubName) formData.append('club_name', clubName);

      const uploadRes = await fetch(`${API_BASE_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadJson?.detail || uploadJson?.message || 'Upload failed');
      }

      const fileId: string = uploadJson.file_id;
      if (!fileId) throw new Error('Backend did not return file_id');

      // Poll status.
      const maxAttempts = 120;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (runId !== analysisRunIdRef.current) return; // aborted by new upload

        const statusRes = await fetch(`${API_BASE_URL}/process-status/${fileId}`);
        const statusJson = await statusRes.json();
        if (!statusRes.ok) {
          throw new Error(statusJson?.detail || statusJson?.message || 'Status check failed');
        }

        const status = statusJson?.status;
        const progress = Number(statusJson?.progress ?? 0);
        setUploadProgress(progress);

        if (status === 'completed') {
          const resultsRes = await fetch(`${API_BASE_URL}/results/${fileId}`);
          const resultsJson = await resultsRes.json();
          if (!resultsRes.ok) {
            throw new Error(resultsJson?.detail || resultsJson?.message || 'Failed to fetch results');
          }

          if (runId !== analysisRunIdRef.current) return; // aborted

          setAnalysis({
            swing_angle: Number(resultsJson.swing_angle ?? 0),
            speed: Number(resultsJson.speed ?? 0),
            accuracy: Number(resultsJson.accuracy ?? 0),
            health_score: Number(resultsJson.health_score ?? 0),
            class_areas: resultsJson.class_areas ?? {
              healthy: 0,
              stressed: 0,
              diseased: 0,
              bare_ground: 0,
              other: 0,
            },
            overlay_url: resultsJson.overlay_url ?? '',
            processing_time: Number(resultsJson.processing_time ?? 0),
          });
          setUploadProgress(100);
          setUploading(false);
          return;
        }

        if (status === 'failed') {
          throw new Error(statusJson?.message || 'Analysis failed');
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      throw new Error('Analysis timed out');
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      setUploading(false);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      // Keep preview for user feedback, but backend currently supports images only.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(null);
      setAnalysis(null);
      setAnalysisError('Video processing is not supported yet. Please upload an image.');
      setUploadProgress(0);
      setUploading(false);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setZoom(1);

    // Fire the real backend processing.
    startBackendAnalysis(file, club);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 z-20 h-screen w-64 bg-slate-900 text-slate-100">
        <div className="border-b border-slate-700 p-5">
          <h1 className="text-lg font-semibold">Client Dashboard</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <LogoutButton
                variant="dropdown"
                className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
              />
            </li>
          </ul>
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Client Dashboard</h2>
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 shadow">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {(profile?.full_name?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{profile?.full_name || 'Client User'}</p>
              <p className="text-xs text-slate-500">Client</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold text-slate-900">Instant Upload and Result Analysis</h3>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
              dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <UploadCloud className="mx-auto mb-2 h-10 w-10 text-slate-500" />
            <p className="text-sm text-slate-600">Drag and drop image/video here</p>
            <p className="mt-1 text-xs text-slate-500">Accepted formats: image/*, video/*</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              File Upload
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {analysisError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {analysisError}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="golfClub" className="mb-1 block text-sm font-medium text-slate-700">
                  Golf Club Name
                </label>
                <select
                  id="golfClub"
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option>Driver</option>
                  <option>Iron</option>
                  <option>Wedge</option>
                  <option>Putter</option>
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Zoom Controls</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <ZoomIn className="h-4 w-4" />
                    Zoom In (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <ZoomOut className="h-4 w-4" />
                    Zoom Out (-)
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Upload Preview</p>
              <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg bg-white">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <ImageIcon className="mx-auto mb-1 h-6 w-6" />
                    <p className="text-sm">No media selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold text-slate-900">Result Analysis</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Analysis Preview</p>
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Analysis preview"
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                    />
                    <div className="pointer-events-none absolute inset-0 border-2 border-emerald-400/70" />
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Upload media to view analysis</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-slate-700">
                  <RotateCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Swing Angle</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.swingAngle}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-slate-700">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm font-medium">Speed</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.speed}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-slate-700">
                  <Crosshair className="h-4 w-4" />
                  <span className="text-sm font-medium">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.accuracy}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardHome;
