'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Sparkles,
  Layers,
  BookOpen,
  Newspaper,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { resolveImageUrl } from '@/components/course-cover';

export type MediaAsset = {
  id: string | number;
  name: string;
  url: string;
  category: 'course' | 'blog' | 'general';
  tag?: string;
  size?: string;
  width?: number;
  height?: number;
  isCustom?: boolean;
  createdAt?: string;
};

// Curated high-resolution presets categorized for LMS Tracks and Blog Articles
export const CURATED_PRESETS: MediaAsset[] = [
  // --- Course Track Presets ---
  {
    id: 'course-docker',
    name: 'Docker & Containerization Masterclass',
    url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'DevOps',
  },
  {
    id: 'course-nextjs',
    name: 'Full-Stack Web Development with React & Next.js',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Frontend',
  },
  {
    id: 'course-db',
    name: 'PostgreSQL Database Performance & Indexing',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Database',
  },
  {
    id: 'course-security',
    name: 'OAuth2, JWT & Cyber Defense for Developers',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Security',
  },
  {
    id: 'course-cloud',
    name: 'Kubernetes & CI/CD Cloud Automation',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'DevOps',
  },

  // --- Blog & Engineering Article Presets ---
  {
    id: 'blog-devops',
    name: 'Zero-Downtime Deployment & GitOps Pipelines',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Tutorial',
  },
  {
    id: 'blog-frontend',
    name: 'Building Fluid Glassmorphism UI Systems',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Frontend',
  },
  {
    id: 'blog-db',
    name: 'Optimizing Complex SQL Queries & Sharding',
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Database',
  },
  {
    id: 'blog-security',
    name: 'Zero Trust API Architecture & Rate Limiting',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Security',
  },
];

type TabOption = 'all' | 'uploads' | 'course' | 'blog' | 'upload_new' | 'url_input';

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  initialCategory?: 'course' | 'blog' | 'general';
}

export const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  initialCategory = 'general',
}: MediaLibraryModalProps) => {
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentUrl ?? '');
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Unified Media Assets State (Strapi Uploads + Course Uploads + Blog Uploads)
  const [uploadedFiles, setUploadedFiles] = useState<MediaAsset[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Upload Progress & Action State
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [sweetAlertToast, setSweetAlertToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected URL with prop
  useEffect(() => {
    if (currentUrl) setSelectedUrl(currentUrl);
  }, [currentUrl]);

  // Set default tab on open
  useEffect(() => {
    if (isOpen) {
      if (initialCategory === 'course') setActiveTab('course');
      else if (initialCategory === 'blog') setActiveTab('blog');
      else setActiveTab('all');
      void fetchAllPlatformAssets();
    }
  }, [isOpen, initialCategory]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (assetToDelete) {
          setAssetToDelete(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, assetToDelete, onClose]);

  // Auto-dismiss Sweet Alert Toast after 3.5 seconds
  useEffect(() => {
    if (sweetAlertToast) {
      const timer = setTimeout(() => setSweetAlertToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [sweetAlertToast]);

  // Comprehensive Asset Aggregator: Fetches Strapi Uploads + All Uploaded Course Covers + Blog Covers
  const fetchAllPlatformAssets = async () => {
    setLoadingUploads(true);
    setUploadError('');

    const assetsMap = new Map<string, MediaAsset>();
    const rawHost = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
    const strapiBase = rawHost.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    // Always read token fresh from localStorage (never cache in closure)
    const getToken = () => {
      if (typeof window === 'undefined') return null;
      return (
        localStorage.getItem('lms.jwt') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') ||
        null
      );
    };

    const authHeaders = (): Record<string, string> => {
      const t = getToken();
      return t ? { Authorization: `Bearer ${t}` } : {};
    };

    // Helper: resolve any URL (relative or absolute) to absolute
    const resolveUrl = (raw: string) => {
      if (!raw) return '';
      raw = raw.trim();
      if (raw.startsWith('http') || raw.startsWith('//') || raw.startsWith('data:')) return raw;
      return `${strapiBase}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };

    // 1. Fetch from Strapi Upload Plugin (/api/upload/files) — public read enabled
    try {
      const res = await fetch(`${strapiBase}/api/upload/files?sort=createdAt:desc&pagination[pageSize]=200`, {
        headers: authHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const files: Array<Record<string, unknown>> = Array.isArray(data) ? data : data?.data ?? [];

        files.forEach((f) => {
          const rawUrl = String(f.url ?? '');
          if (!rawUrl) return;
          const finalUrl = resolveUrl(rawUrl);
          const sizeKB = typeof f.size === 'number' ? `${Math.round(f.size)} KB` : undefined;

          assetsMap.set(finalUrl, {
            id: (f.id as string | number) || String(f.documentId ?? Math.random()),
            name: String(f.name ?? 'Uploaded Image'),
            url: finalUrl,
            category: 'general',
            size: sizeKB,
            width: typeof f.width === 'number' ? f.width : undefined,
            height: typeof f.height === 'number' ? f.height : undefined,
            isCustom: true,
            createdAt: typeof f.createdAt === 'string' ? f.createdAt : undefined,
          });
        });
      } else {
        console.warn('[MediaModal] /api/upload/files responded with', res.status);
      }
    } catch (err) {
      console.warn('Failed to fetch Strapi upload files', err);
    }

    // 2. Fetch all Course Covers — public API, extract /uploads/ images
    try {
      const res = await fetch(
        `${strapiBase}/api/courses?fields[0]=title&fields[1]=coverImageUrl&pagination[pageSize]=100`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        const courses: Array<Record<string, unknown>> = Array.isArray(data) ? data : data?.data ?? [];
        courses.forEach((c) => {
          const cover = typeof c.coverImageUrl === 'string' ? c.coverImageUrl.trim() : '';
          if (!cover) return;
          const finalUrl = resolveUrl(cover);
          // Add even if already in map from upload/files — course items get better labeling
          assetsMap.set(finalUrl, {
            id: assetsMap.get(finalUrl)?.id ?? `course-${c.documentId || c.id}`,
            name: `${String(c.title || 'Course')} Cover`,
            url: finalUrl,
            category: 'course',
            tag: 'Course Track',
            size: assetsMap.get(finalUrl)?.size,
            isCustom: true,
          });
        });
      }
    } catch (err) {
      console.warn('Failed to fetch courses for media assets', err);
    }

    // 3. Fetch all Blog Post Covers
    try {
      const res = await fetch(
        `${strapiBase}/api/blog-posts?fields[0]=title&fields[1]=coverImageUrl&fields[2]=topic&pagination[pageSize]=100`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        const posts: Array<Record<string, unknown>> = Array.isArray(data) ? data : data?.data ?? [];
        posts.forEach((p) => {
          const cover = typeof p.coverImageUrl === 'string' ? p.coverImageUrl.trim() : '';
          if (!cover) return;
          const finalUrl = resolveUrl(cover);
          if (!assetsMap.has(finalUrl)) {
            assetsMap.set(finalUrl, {
              id: `blog-${p.documentId || p.id}`,
              name: `${String(p.title || 'Article')} Banner`,
              url: finalUrl,
              category: 'blog',
              tag: typeof p.topic === 'string' && p.topic ? p.topic : 'Article',
              isCustom: true,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Failed to fetch blog posts for media assets', err);
    }

    setUploadedFiles(Array.from(assetsMap.values()));
    setLoadingUploads(false);
  };



  // Upload new file directly to Strapi / Railway Backend
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const rawHost = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
      const strapiBase = rawHost.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('lms.jwt') || localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch(`${strapiBase}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploaded = Array.isArray(data) ? data[0] : data;
        const uploadedUrl = uploaded?.url;

        if (uploadedUrl) {
          const finalUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${strapiBase}${uploadedUrl}`;
          setSelectedUrl(finalUrl);
          setUploadSuccess(true);
          setSweetAlertToast({ message: 'Image successfully uploaded to Railway Storage!', type: 'success' });
          await fetchAllPlatformAssets();
          setActiveTab('uploads');
          return;
        }
      }
    } catch (err) {
      console.warn('Strapi direct upload failed, fallback to local', err);
    }

    // Secondary fallback to Next.js /api/upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setSelectedUrl(data.url);
          setUploadSuccess(true);
          setSweetAlertToast({ message: 'Image uploaded to local storage successfully!', type: 'success' });
          await fetchAllPlatformAssets();
          setActiveTab('uploads');
          return;
        }
      }
    } catch (err) {
      setUploadError('Upload failed. Please check network connection or try a direct image URL.');
    } finally {
      setUploading(false);
    }
  };

  // Perform permanent deletion from Railway Cloud Storage
  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;

    setDeletingId(assetToDelete.id);
    try {
      const rawHost = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
      const strapiBase = rawHost.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('lms.jwt') || localStorage.getItem('token') : null;

      const res = await fetch(`${strapiBase}/api/upload/files/${assetToDelete.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setUploadedFiles((prev) => prev.filter((item) => item.id !== assetToDelete.id));
        if (selectedUrl === assetToDelete.url) {
          setSelectedUrl('');
        }
        setSweetAlertToast({
          message: `"${assetToDelete.name}" was permanently deleted from Railway!`,
          type: 'success',
        });
      } else {
        // If it's a course reference item, remove from local list
        setUploadedFiles((prev) => prev.filter((item) => item.id !== assetToDelete.id));
        setSweetAlertToast({
          message: `Asset removed from library view.`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Failed to delete file from Railway', err);
      setSweetAlertToast({
        message: 'Network error deleting file. Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
      setAssetToDelete(null);
    }
  };

  // Combine and filter assets based on activeTab and searchQuery
  const displayedAssets = useMemo(() => {
    let list: MediaAsset[] = [];

    if (activeTab === 'all') {
      list = [...uploadedFiles, ...CURATED_PRESETS];
    } else if (activeTab === 'uploads') {
      list = uploadedFiles;
    } else if (activeTab === 'course') {
      const courseUploads = uploadedFiles.filter((f) => f.category === 'course');
      const coursePresets = CURATED_PRESETS.filter((p) => p.category === 'course');
      list = [...courseUploads, ...coursePresets];
    } else if (activeTab === 'blog') {
      const blogUploads = uploadedFiles.filter((f) => f.category === 'blog');
      const blogPresets = CURATED_PRESETS.filter((p) => p.category === 'blog');
      list = [...blogUploads, ...blogPresets];
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q)) ||
        item.url.toLowerCase().includes(q)
    );
  }, [activeTab, uploadedFiles, searchQuery]);

  const handleApplySelection = () => {
    if (selectedUrl.trim()) {
      onSelect(selectedUrl.trim());
      onClose();
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      onSelect(customUrlInput.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] rounded-2xl border border-theme bg-surface shadow-2xl overflow-hidden text-primary animate-in zoom-in-95 duration-200">
        
        {/* Floating Sweet Alert Toast Notification */}
        {sweetAlertToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl border border-theme bg-surface/95 backdrop-blur-md px-4 py-2.5 shadow-xl text-xs font-bold animate-in slide-in-from-top-3 duration-200">
            {sweetAlertToast.type === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-400 shrink-0" />
            )}
            <span className={sweetAlertToast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
              {sweetAlertToast.message}
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-elevated/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl brand-gradient text-white shadow-md">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                <span>Asset & Media Library</span>
                <span className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5 text-[11px] font-bold border border-brand/20">
                  Platform Cloud Hub
                </span>
              </h3>
              <p className="text-xs text-muted">
                Access all course thumbnails, blog covers, Railway cloud uploads, and curated presets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-elevated text-muted hover:text-primary transition cursor-pointer"
            title="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-subtle bg-canvas/60 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'brand-gradient text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <Layers className="size-3.5" />
              <span>All Assets</span>
              <span className="text-[10px] opacity-80">({uploadedFiles.length + CURATED_PRESETS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('uploads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'uploads'
                  ? 'brand-gradient text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <FolderOpen className="size-3.5" />
              <span>Uploaded Media</span>
              <span className="text-[10px] opacity-80">({uploadedFiles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('course')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'course'
                  ? 'brand-gradient text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Course Assets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'blog'
                  ? 'brand-gradient text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <Newspaper className="size-3.5" />
              <span>Blog Banners</span>
            </button>

            <div className="h-4 w-px bg-theme mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setActiveTab('upload_new')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'upload_new'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <Upload className="size-3.5" />
              <span>Upload New</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url_input')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'url_input'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              <LinkIcon className="size-3.5" />
              <span>Direct URL</span>
            </button>
          </div>

          {/* Search Filter Box */}
          {activeTab !== 'upload_new' && activeTab !== 'url_input' && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by title or topic..."
                className="w-full rounded-lg border border-theme bg-surface pl-9 pr-3 py-1.5 text-xs text-primary placeholder:text-muted focus:border-active focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          {/* TAB 1: Grid Showcase (All Assets / Uploads / Course / Blog) */}
          {activeTab !== 'upload_new' && activeTab !== 'url_input' && (
            <div>
              {loadingUploads && (
                <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted">
                  <RefreshCw className="size-4 animate-spin text-brand" />
                  <span>Loading platform assets from Railway...</span>
                </div>
              )}

              {!loadingUploads && displayedAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-canvas border border-theme text-muted">
                    <ImageIcon className="size-7 text-muted" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">No assets found</h4>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      {searchQuery
                        ? `No image matches "${searchQuery}". Try searching another keyword.`
                        : 'No uploaded media in this category yet.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload_new')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition cursor-pointer"
                  >
                    <Upload className="size-3.5" />
                    <span>Upload First Image</span>
                  </button>
                </div>
              )}

              {/* Grid of Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedAssets.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  const isDeleting = deletingId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedUrl(item.url)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col bg-canvas ${
                        isSelected
                          ? 'border-brand ring-2 ring-brand-500/40 shadow-lg scale-[1.02]'
                          : 'border-theme hover:border-active hover:shadow-md'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveImageUrl(item.url)}
                          alt={item.name}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-white shadow-md animate-in zoom-in-50 duration-150">
                            <Check className="size-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Category/Tag Badge */}
                        {item.tag && (
                          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">
                            {item.tag}
                          </span>
                        )}

                        {/* Sweet Alert Delete Trigger Button (Only for uploaded custom assets) */}
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetToDelete(item);
                            }}
                            disabled={isDeleting}
                            className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-lg bg-black/70 hover:bg-rose-600 text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                            title="Delete image from Railway"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Card Meta Footer */}
                      <div className="p-2.5 space-y-1">
                        <p className="text-xs font-bold text-primary truncate" title={item.name}>
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted">
                          <span>{item.isCustom ? 'Uploaded' : 'Preset'}</span>
                          {item.size && <span>{item.size}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Upload New Asset */}
          {activeTab === 'upload_new' && (
            <div className="max-w-xl mx-auto py-8 space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  dragActive
                    ? 'border-brand bg-brand/10 scale-[1.01]'
                    : 'border-theme hover:border-active bg-canvas hover:bg-elevated/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileUpload(file);
                  }}
                />

                <div className="flex size-16 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg mb-4">
                  {uploading ? (
                    <RefreshCw className="size-8 animate-spin" />
                  ) : (
                    <Upload className="size-8" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-primary">
                  {uploading ? 'Uploading to Railway Cloud...' : 'Click or Drag & Drop Image Here'}
                </h4>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Supports PNG, JPG, WebP up to 10MB. Files are permanently stored in Railway Media Storage.
                </p>
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Check className="size-4 shrink-0" />
                  <span>Image uploaded and selected successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Direct URL Input */}
          {activeTab === 'url_input' && (
            <div className="max-w-xl mx-auto py-8 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-primary">
                  Paste Direct Web Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                    className="flex-1 rounded-xl border border-theme bg-canvas px-4 py-2.5 text-xs text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrlInput.trim()}
                    className="rounded-xl brand-gradient disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-md transition cursor-pointer shrink-0"
                  >
                    Apply URL
                  </button>
                </div>
                <p className="text-[11px] text-muted">
                  You can paste direct image links from Unsplash, Imgur, Cloudinary, or any CDN.
                </p>
              </div>

              {customUrlInput.trim() && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-secondary">Live Link Preview:</span>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-theme bg-canvas shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customUrlInput}
                      alt="URL Preview"
                      className="size-full object-cover"
                      onError={() => setUploadError('Image failed to load from this URL.')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-subtle bg-elevated/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {selectedUrl ? (
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg overflow-hidden border border-theme shrink-0 bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(selectedUrl)} alt="Selected" className="size-full object-cover" />
                </div>
                <div className="min-w-0 max-w-xs sm:max-w-md">
                  <p className="text-xs font-bold text-primary truncate">Selected Asset</p>
                  <p className="text-[10px] text-muted truncate">{selectedUrl}</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted">No asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-theme bg-surface hover:bg-elevated text-secondary hover:text-primary px-4 py-2 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplySelection}
              disabled={!selectedUrl}
              className="inline-flex items-center gap-2 rounded-xl brand-gradient disabled:opacity-50 text-white px-6 py-2 text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
            >
              <Check className="size-4" />
              <span>Use Selected Asset</span>
            </button>
          </div>
        </div>

        {/* 🌟 In-Modal Sweet Alert Delete Confirmation Dialog 🌟 */}
        {assetToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-2xl border border-theme bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
              
              {/* Alert Icon */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-md">
                <Trash2 className="size-7" />
              </div>

              {/* Title & Warning Text */}
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-primary">Delete Cloud Asset?</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Are you sure you want to delete this image from your media view?
                </p>
              </div>

              {/* Image Preview & Name */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-theme bg-canvas text-left">
                <div className="size-12 rounded-lg overflow-hidden border border-theme shrink-0 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(assetToDelete.url)}
                    alt="To delete"
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary truncate" title={assetToDelete.name}>
                    {assetToDelete.name}
                  </p>
                  <p className="text-[10px] text-muted">{assetToDelete.size || 'Platform Asset'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(null)}
                  disabled={Boolean(deletingId)}
                  className="flex-1 rounded-xl border border-theme bg-canvas hover:bg-elevated text-secondary hover:text-primary py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={Boolean(deletingId)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-2.5 text-xs font-bold shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  {deletingId ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-3.5" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
