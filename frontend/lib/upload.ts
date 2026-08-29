import { accessToken, strapiHost } from './api';

/**
 * Upload an image file to Strapi's media library.
 * Returns the absolute URL of the uploaded file, or null on failure.
 */
export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;

  const form = new FormData();
  form.append('files', file);

  const token = accessToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(`${strapiHost}/api/upload`, { method: 'POST', headers, body: form });

    if (res.ok) {
      const data = await res.json();
      const raw: string = Array.isArray(data) ? data[0]?.url : data?.url;
      if (raw) return raw.startsWith('http') ? raw : `${strapiHost}${raw}`;
    }
  } catch {
    // fall through to local fallback
  }

  try {
    const form2 = new FormData();
    form2.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form2 });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url as string;
    }
  } catch {
    // both failed
  }

  return null;
}
