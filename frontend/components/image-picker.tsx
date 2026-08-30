'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  Upload, Link as LinkIcon, Image as ImageIcon,
  X, Sparkles, Layers, FolderOpen, AlertCircle,
} from 'lucide-react';

import { resolveImageUrl } from '@/components/course-cover';
import { MediaLibraryModal } from '@/components/media-library-modal';
import { uploadImage } from '@/lib/upload';


export const ImagePicker = ({
  label    = 'Cover Image / Thumbnail',
  value,
  onChange,
  category = 'general',
}: {
  label?:    string;
  value:     string;
  onChange:  (url: string) => void;
  category?: 'course' | 'blog' | 'general';
  presets?:  unknown;
}) => {
  const [tab,         setTab]         = useState<'upload' | 'url'>('upload');
  const [dragOver,    setDragOver]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [imageError,  setImageError]  = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // switch to URL tab when an external URL is loaded in (e.g. from the media library)
  useEffect(() => {
    setImageError(false);
    if (value && !value.startsWith('/uploads/') && !value.startsWith('data:')) {
      setTab('url');
    }
  }, [value]);


  // uploads the file to Strapi; falls back to a base64 data URL if upload fails
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setLoading(true);
    setImageError(false);

    const url = await uploadImage(file);
    if (url) {
      onChange(url);
      setLoading(false);
      return;
    }

    // fallback: read as base64 so the preview still works offline
    const reader = new FileReader();
    reader.onload  = (event) => {
      if (typeof event.target?.result === 'string') onChange(event.target.result);
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const displayUrl = value ? resolveImageUrl(value) : '';


  return (
    <div className="space-y-3">

      {/* label row with media library trigger + upload/url tab switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
          <ImageIcon className="size-4 text-sky-400" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg brand-gradient text-white px-3 py-1 text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
            title="Browse Railway uploads & curated tech presets"
          >
            <Sparkles className="size-3.5" />
            <span>Media Library</span>
          </button>

          <div className="flex items-center rounded-lg bg-canvas p-0.5 border border-theme text-xs">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition cursor-pointer text-[11px] font-bold ${
                tab === 'upload' ? 'bg-surface text-brand shadow-2xs' : 'text-secondary hover:text-primary'
              }`}
            >
              <Upload className="size-3" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition cursor-pointer text-[11px] font-bold ${
                tab === 'url' ? 'bg-surface text-brand shadow-2xs' : 'text-secondary hover:text-primary'
              }`}
            >
              <LinkIcon className="size-3" />
              <span>URL</span>
            </button>
          </div>
        </div>
      </div>


      {tab === 'upload' ? (
        /* drag-and-drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-active bg-brand-subtle'
              : 'border-theme bg-canvas hover:border-active hover:bg-elevated/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand mb-1.5 border border-brand-border shadow-2xs">
            <Upload className="size-4" />
          </div>

          <p className="text-xs font-bold text-primary">
            {loading
              ? 'Uploading to Railway Cloud...'
              : displayUrl
              ? 'Click or drag & drop to replace image'
              : 'Click to upload from device'}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            PNG, JPG, WebP up to 10MB (Stores in Railway backend)
          </p>
        </div>
      ) : (
        /* direct URL input */
        <div>
          <input
            type="text"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => { setImageError(false); onChange(e.target.value); }}
            placeholder="https://images.unsplash.com/... or https://..."
            className="w-full rounded-xl border border-theme bg-surface px-3.5 py-2 text-xs text-primary outline-none transition-all placeholder:text-muted focus:border-active focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
        </div>
      )}


      {/* live thumbnail preview with remove and browse library shortcuts */}
      <div className="overflow-hidden rounded-xl border border-theme bg-canvas p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <ImageIcon className="size-3.5 text-brand" />
            <span>Thumbnail Preview</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
            >
              <FolderOpen className="size-3" />
              <span>Browse Library</span>
            </button>

            {displayUrl && (
              <button
                type="button"
                onClick={() => { setImageError(false); onChange(''); }}
                className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-400 font-bold cursor-pointer"
              >
                <X className="size-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative h-44 w-full overflow-hidden rounded-lg bg-black/40 shadow-2xs flex items-center justify-center border border-theme">
          {displayUrl && !imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={displayUrl}
              src={displayUrl}
              alt="Thumbnail Preview"
              className="h-full w-full object-cover transition-all duration-300"
              onError={() => setImageError(true)}
            />
          ) : imageError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-rose-400 space-y-1">
              <AlertCircle className="size-7 opacity-90 text-rose-400" />
              <p className="text-xs font-bold">Image failed to load</p>
              <p className="text-[11px] text-muted">Please check if the image URL is accessible or choose another image.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted">
              <ImageIcon className="size-8 mb-1.5 opacity-40 text-muted" />
              <p className="text-xs font-medium">No image selected</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-[11px] font-bold text-brand hover:underline cursor-pointer"
              >
                Open Media Library to select
              </button>
            </div>
          )}
        </div>
      </div>


      {/* media library modal */}
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(newUrl) => { setImageError(false); onChange(newUrl); }}
        currentUrl={value}
        initialCategory={category}
      />

    </div>
  );
};
