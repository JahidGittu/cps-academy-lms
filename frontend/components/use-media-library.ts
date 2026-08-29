'use client';

import { useState, useEffect, useCallback } from 'react';
import { accessToken, strapiHost } from '@/lib/api';
import { resolveImageUrl } from '@/components/course-cover';
import { uploadImage } from '@/lib/upload';
import type { MediaAsset } from './media-presets';

function authHeaders(): Record<string, string> {
  const t = accessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function fetchPlatformAssets(): Promise<MediaAsset[]> {
  const map = new Map<string, MediaAsset>();

  try {
    const res = await fetch(
      `${strapiHost}/api/upload/files?sort=createdAt:desc&pagination[pageSize]=200`,
      { headers: authHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      const files: Record<string, unknown>[] = Array.isArray(data) ? data : data?.data ?? [];
      for (const f of files) {
        const raw = String(f.url ?? '');
        if (!raw) continue;
        const url = resolveImageUrl(raw);
        map.set(url, {
          id: (f.id as string | number) || String(f.documentId ?? Math.random()),
          name: String(f.name ?? 'Uploaded Image'),
          url,
          category: 'general',
          size: typeof f.size === 'number' ? `${Math.round(f.size)} KB` : undefined,
          width: typeof f.width === 'number' ? f.width : undefined,
          height: typeof f.height === 'number' ? f.height : undefined,
          isCustom: true,
        });
      }
    }
  } catch {
    // silently skip if upload list unavailable
  }

  try {
    const res = await fetch(
      `${strapiHost}/api/courses?fields[0]=title&fields[1]=coverImageUrl&pagination[pageSize]=100`,
      { headers: authHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      const courses: Record<string, unknown>[] = Array.isArray(data) ? data : data?.data ?? [];
      for (const c of courses) {
        const cover = typeof c.coverImageUrl === 'string' ? c.coverImageUrl.trim() : '';
        if (!cover) continue;
        const url = resolveImageUrl(cover);
        map.set(url, {
          id: map.get(url)?.id ?? `course-${c.documentId || c.id}`,
          name: `${String(c.title || 'Course')} Cover`,
          url,
          category: 'course',
          tag: 'Course',
          size: map.get(url)?.size,
          isCustom: true,
        });
      }
    }
  } catch {
    // skip
  }

  try {
    const res = await fetch(
      `${strapiHost}/api/blog-posts?fields[0]=title&fields[1]=coverImageUrl&fields[2]=topic&pagination[pageSize]=100`,
      { headers: authHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      const posts: Record<string, unknown>[] = Array.isArray(data) ? data : data?.data ?? [];
      for (const p of posts) {
        const cover = typeof p.coverImageUrl === 'string' ? p.coverImageUrl.trim() : '';
        if (!cover) continue;
        const url = resolveImageUrl(cover);
        if (!map.has(url)) {
          map.set(url, {
            id: `blog-${p.documentId || p.id}`,
            name: `${String(p.title || 'Article')} Banner`,
            url,
            category: 'blog',
            tag: typeof p.topic === 'string' && p.topic ? p.topic : 'Article',
            isCustom: true,
          });
        }
      }
    }
  } catch {
    // skip
  }

  return Array.from(map.values());
}

export type Toast = { message: string; type: 'success' | 'error' };

export function useMediaLibrary(isOpen: boolean) {
  const [files, setFiles] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await fetchPlatformAssets());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void loadAssets();
  }, [isOpen, loadAssets]);

  async function upload(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are supported (PNG, JPG, WebP, SVG).');
      return null;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const url = await uploadImage(file);
      if (url) {
        setUploadSuccess(true);
        setToast({ message: 'Image uploaded successfully!', type: 'success' });
        await loadAssets();
        return url;
      }
      setUploadError('Upload failed. Try using a direct image URL instead.');
    } catch {
      setUploadError('Upload failed. Try using a direct image URL instead.');
    } finally {
      setUploading(false);
    }

    return null;
  }

  async function deleteAsset(asset: MediaAsset) {
    setDeletingId(asset.id);
    try {
      await fetch(`${strapiHost}/api/upload/files/${asset.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      setFiles((prev) => prev.filter((f) => f.id !== asset.id));
      setToast({ message: `"${asset.name}" deleted.`, type: 'success' });
    } catch {
      setToast({ message: 'Could not delete file. Try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  return { files, loading, uploading, uploadSuccess, uploadError, deletingId, toast, upload, deleteAsset, refresh: loadAssets };
}
