import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { FALLBACK_IMAGE } from '@/components/course-cover';

interface Preset {
  label: string;
  url: string;
}

export const ImagePicker = ({
  label = 'Cover Image / Thumbnail',
  value,
  onChange,
  presets = [],
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  presets?: Preset[];
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('url');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageError(false);
    if (value && !value.startsWith('data:')) {
      setTab('url');
    }
  }, [value]);

  // Upload file to local static storage endpoint for clean short URL (<= 255 chars)
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setLoading(true);
    setImageError(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API upload fallback', err);
    }

    // Fallback if upload fails
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange(event.target.result);
      }
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

  const displayUrl = value;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-lg bg-canvas p-0.5 border border-theme text-xs">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
              tab === 'upload'
                ? 'bg-surface text-brand shadow-2xs font-bold'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Upload className="size-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
              tab === 'url'
                ? 'bg-surface text-brand shadow-2xs font-bold'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <LinkIcon className="size-3.5" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        /* File Upload Drag & Drop Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-active bg-brand-subtle'
              : 'border-theme bg-canvas hover:border-active hover:bg-elevated'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex size-10 items-center justify-center rounded-md bg-brand-subtle text-brand mb-2 border border-brand-border shadow-2xs">
            <Upload className="size-5" />
          </div>

          <p className="text-sm font-bold text-primary">
            {loading ? 'Processing image...' : 'Click to browse or drag & drop image'}
          </p>
          <p className="text-xs text-muted mt-0.5">
            PNG, JPG, JPEG or WebP from your computer
          </p>
        </div>
      ) : (
        /* Direct URL Input & Presets */
        <div className="space-y-2.5">
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => {
              setImageError(false);
              onChange(e.target.value);
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full rounded-md border border-theme bg-surface px-3.5 py-2 text-xs sm:text-sm text-primary outline-none transition-all placeholder:text-muted focus:border-active focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />

          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span className="flex items-center gap-1 font-bold text-primary">
                <Sparkles className="size-3 text-brand" />
                <span>Presets:</span>
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setImageError(false);
                    onChange(preset.url);
                  }}
                  className={`rounded px-2 py-0.5 text-[11px] transition border cursor-pointer ${
                    value === preset.url
                      ? 'bg-brand-subtle text-brand border-brand-border font-bold shadow-2xs'
                      : 'bg-surface text-secondary border-theme hover:bg-elevated hover:text-primary'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Thumbnail Preview & Clear Action */}
      <div className="overflow-hidden rounded-lg border border-theme bg-canvas p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <ImageIcon className="size-3.5 text-brand" />
            <span>Live Thumbnail Preview</span>
          </p>

          {displayUrl && (
            <button
              type="button"
              onClick={() => {
                setImageError(false);
                onChange('');
              }}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-semibold cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Clear Image</span>
            </button>
          )}
        </div>

        <div className="relative h-48 w-full overflow-hidden rounded-md bg-black/40 shadow-2xs flex items-center justify-center border border-theme">
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={displayUrl}
              src={imageError ? FALLBACK_IMAGE : displayUrl}
              alt="Thumbnail Preview"
              className="h-full w-full object-cover transition-all duration-300"
              onError={() => {
                if (!imageError) {
                  setImageError(true);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted">
              <ImageIcon className="size-8 mb-1.5 opacity-40 text-muted" />
              <p className="text-xs font-medium">No cover image selected</p>
              <p className="text-[11px] text-muted mt-0.5">Upload a file, click a preset, or paste a URL above to set thumbnail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
