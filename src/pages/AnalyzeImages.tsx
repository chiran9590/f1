import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, Loader2, ArrowLeft, ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { analyzeImages, ImageInferenceResult } from '../services/inferenceService';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILES = 10;

const AnalyzeImages: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImageInferenceResult[] | null>(null);

  const scopeLabel = isAdmin
    ? 'Admin — all courses'
    : profile?.golf_course
      ? profile.golf_course
      : 'Your assigned course';

  const validateAndAdd = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const valid = list.filter((f) => ACCEPTED.includes(f.type) || /\.(png|jpe?g)$/i.test(f.name));

      if (valid.length === 0) {
        setError('Please select PNG or JPG images only.');
        return;
      }

      const combined = [...files, ...valid].slice(0, MAX_FILES);
      if (files.length + valid.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} images. Only the first ${MAX_FILES} were kept.`);
      } else {
        setError(null);
      }

      previews.forEach((url) => URL.revokeObjectURL(url));
      setFiles(combined);
      setPreviews(combined.map((f) => URL.createObjectURL(f)));
      setResults(null);
    },
    [files, previews]
  );

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Add at least one image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeImages(files);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </Link>
          <span className="text-xs text-slate-500">{scopeLabel}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Analyze Images</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload 1–{MAX_FILES} PNG or JPG images. Results are returned per image.
        </p>

        <div
          className={`mt-6 rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragOver ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files);
          }}
        >
          <Upload className="mx-auto mb-2 h-10 w-10 text-slate-400" />
          <p className="text-sm text-slate-600">Drag and drop images here</p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG — up to {MAX_FILES} files</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Choose files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && validateAndAdd(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="relative">
                <img
                  src={previews[i]}
                  alt={file.name}
                  className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="mt-1 max-w-[5rem] truncate text-xs text-slate-500">{file.name}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading || files.length === 0}
          onClick={handleSubmit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            `Analyze ${files.length || ''} image${files.length !== 1 ? 's' : ''}`
          )}
        </button>

        {results && results.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Results</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((row) => (
                <div
                  key={row.imageName}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{row.imageName}</p>
                    <p className="mt-1 text-sm text-green-700">{row.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AnalyzeImages;
