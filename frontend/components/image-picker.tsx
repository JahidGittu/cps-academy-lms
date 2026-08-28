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
  const [tab, setTab] = useState<'upload' | 'url'>(
    value && !value.startsWith('data:') ? 'url' : 'upload'
  );
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

  // Compress & encode uploaded image to a compact data URL for instant display and storage
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(dataUrl);
        } else {
          onChange(event.target?.result as string);
        }
        setLoading(false);
      };
      img.src = event.target?.result as string;
    };

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

  const displayUrl = value?.trim() || '';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>

        {/* Upload Mode Switcher Tabs */}
        <div className="inline-flex rounded bg-slate-100 p-0.5 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white text-brand-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="size-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              tab === 'url'
                ? 'bg-white text-brand-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
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
          className={`flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-300 bg-slate-50/70 hover:border-brand-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex size-10 items-center justify-center rounded bg-brand-50 text-brand-600 mb-2 border border-brand-100 shadow-2xs">
            <Upload className="size-5" />
          </div>

          <p className="text-sm font-bold text-slate-800">
            {loading ? 'Processing image...' : 'Click to browse or drag & drop image'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
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
            className="w-full rounded border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />

          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Sparkles className="size-3 text-brand-600" />
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
                      ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700'
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
      <div className="overflow-hidden rounded border border-slate-200 bg-slate-50/70 p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <ImageIcon className="size-3.5 text-brand-600" />
            <span>Live Thumbnail Preview</span>
          </p>

          {displayUrl && (
            <button
              type="button"
              onClick={() => {
                setImageError(false);
                onChange('');
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Clear Image</span>
            </button>
          )}
        </div>

        <div className="relative h-48 w-full overflow-hidden rounded bg-slate-900 shadow-2xs flex items-center justify-center">
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
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <ImageIcon className="size-8 mb-1.5 opacity-40 text-slate-300" />
              <p className="text-xs font-medium">No cover image selected</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload a file, click a preset, or paste a URL above to set thumbnail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
