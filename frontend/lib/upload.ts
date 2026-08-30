import { accessToken, strapiHost } from './api';


// uploads a file to Strapi's media library and returns the full URL,
// or null if both the primary and fallback routes fail
export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;

  const token   = accessToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};


  // primary: send straight to the Strapi upload endpoint
  try {
    const form = new FormData();
    form.append('files', file);

    const res = await fetch(`${strapiHost}/api/upload`, { method: 'POST', headers, body: form });

    if (res.ok) {
      const data = await res.json();
      const raw: string = Array.isArray(data) ? data[0]?.url : data?.url;
      if (raw) return raw.startsWith('http') ? raw : `${strapiHost}${raw}`;
    }
  } catch {
    // fall through to the Next.js proxy below
  }


  // fallback: Next.js API route that proxies the upload (useful behind a CORS restriction)
  try {
    const form2 = new FormData();
    form2.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: form2 });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url as string;
    }
  } catch {
    // both routes failed
  }


  return null;
}
