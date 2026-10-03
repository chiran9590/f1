// Cloudflare R2 uploads via short-lived presigned URLs issued by the `r2-presign` Edge Function.
// No R2 credentials exist in the browser.
import { supabase, callFunction } from '../lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  key: string;
  error?: string;
}

type Kind = 'tiles' | 'metadata';

function putWithProgress(url: string, file: File, onProgress?: (p: UploadProgress) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ loaded: e.loaded, total: e.total, percentage: Math.round((e.loaded / e.total) * 100) });
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`R2 rejected the upload (HTTP ${xhr.status}). Check the bucket's access keys.`));
    xhr.onerror = () =>
      reject(new Error('Upload blocked by the browser. Add this site to the R2 bucket CORS rules (see README).'));
    xhr.send(file);
  });
}

class R2Service {
  /** Uploads one file for a club and records it in the `tiles` / `metadata` table. */
  async uploadFile(
    file: File,
    clubId: string,
    kind: Kind,
    onProgress?: (p: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const { uploadUrl, key } = await callFunction<{ uploadUrl: string; key: string }>('r2-presign', {
        action: 'upload',
        clubId,
        kind,
        fileName: file.name,
        contentType: file.type,
      });

      await putWithProgress(uploadUrl, file, onProgress);

      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from(kind).insert({
        club_id: clubId,
        file_name: file.name,
        file_path: key,
        file_size: file.size,
        uploaded_by: auth.user?.id,
      });
      if (error) throw new Error(`Uploaded, but saving the record failed: ${error.message}`);

      return { success: true, key };
    } catch (e: any) {
      console.error('R2 upload failed:', e);
      return { success: false, key: '', error: e.message || 'Upload failed' };
    }
  }

  /**
   * Uploads many files at once (tiles keep their {z}/{x}/{y}.png path; metadata keeps its file name).
   * Presigns 100 files per request, uploads `concurrency` at a time, then records them in the database.
   */
  async uploadMany(
    entries: { file: File; path: string }[],
    clubId: string,
    kind: Kind,
    onProgress?: (p: { done: number; total: number; failed: { path: string; error: string }[] }) => void,
    concurrency = 6
  ): Promise<{ ok: number; failed: { path: string; error: string }[]; recordError?: string }> {
    const total = entries.length;
    let done = 0;
    const failed: { path: string; error: string }[] = [];
    const rows: Record<string, unknown>[] = [];
    const { data: auth } = await supabase.auth.getUser();
    const report = () => onProgress?.({ done, total, failed });

    for (let i = 0; i < entries.length; i += 100) {
      const chunk = entries.slice(i, i + 100);
      let byPath: Record<string, { key: string; uploadUrl: string }> = {};
      try {
        const { items } = await callFunction<{ items: { path: string; key: string; uploadUrl: string }[] }>(
          'r2-presign',
          { action: 'upload-batch', clubId, kind, paths: chunk.map((c) => c.path) }
        );
        byPath = Object.fromEntries(items.map((it) => [it.path, it]));
      } catch (e: any) {
        chunk.forEach((c) => failed.push({ path: c.path, error: e.message }));
        done += chunk.length;
        report();
        continue;
      }

      let next = 0;
      const worker = async () => {
        while (next < chunk.length) {
          const entry = chunk[next++];
          const item = byPath[entry.path];
          try {
            await putWithProgress(item.uploadUrl, entry.file);
            rows.push({
              club_id: clubId,
              file_name: entry.file.name,
              file_path: item.key,
              file_size: entry.file.size,
              uploaded_by: auth.user?.id,
            });
          } catch (e: any) {
            failed.push({ path: entry.path, error: e.message });
          }
          done++;
          report();
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, chunk.length) }, worker));
    }

    // Record in the database (replace rows for files that were uploaded again)
    let recordError: string | undefined;
    try {
      for (let i = 0; i < rows.length; i += 50) {
        const paths = rows.slice(i, i + 50).map((r) => r.file_path as string);
        const { error } = await supabase.from(kind).delete().eq('club_id', clubId).in('file_path', paths);
        if (error) throw error;
      }
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from(kind).insert(rows.slice(i, i + 500));
        if (error) throw error;
      }
    } catch (e: any) {
      recordError = e.message;
    }
    return { ok: rows.length, failed, recordError };
  }

  /** File paths recorded for a club (reads the DB table, not R2). */
  async listFiles(clubId: string, kind: Kind): Promise<string[]> {
    const { data, error } = await supabase.from(kind).select('file_path').eq('club_id', clubId);
    return error ? [] : (data || []).map((r: { file_path: string }) => r.file_path);
  }

  /** Short-lived read URLs for files (admins: any file; clients: their own club's files). */
  async getDownloadUrls(keys: string[]): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (let i = 0; i < keys.length; i += 200) {
      const { urls } = await callFunction<{ urls: Record<string, string> }>('r2-presign', {
        action: 'download',
        keys: keys.slice(i, i + 200),
      });
      Object.assign(out, urls);
    }
    return out;
  }
}

export const r2Service = new R2Service();
