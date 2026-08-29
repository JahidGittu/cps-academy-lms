'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  X, Search, Upload, Image as ImageIcon, Trash2, Check,
  Sparkles, Layers, BookOpen, Newspaper, Link as LinkIcon,
  RefreshCw, AlertCircle, FolderOpen, CheckCircle2,
} from 'lucide-react';
import { resolveImageUrl } from '@/components/course-cover';
import type { MediaAsset } from './media-presets';
import { PRESETS } from './media-presets';
import { useMediaLibrary } from './use-media-library';

export type { MediaAsset };
export { PRESETS as CURATED_PRESETS };

type Tab = 'all' | 'uploads' | 'course' | 'blog' | 'upload_new' | 'url_input';

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  initialCategory?: 'course' | 'blog' | 'general';
}

export const MediaLibraryModal = ({
  isOpen, onClose, onSelect, currentUrl, initialCategory = 'general',
}: MediaLibraryModalProps) => {
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentUrl ?? '');
  const [customUrl, setCustomUrl] = useState('');
  const [drag, setDrag] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lib = useMediaLibrary(isOpen);

  useEffect(() => {
    if (currentUrl) setSelected(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialCategory === 'course') setTab('course');
    else if (initialCategory === 'blog') setTab('blog');
    else setTab('all');
  }, [isOpen, initialCategory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      confirmDelete ? setConfirmDelete(null) : onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, confirmDelete, onClose]);

  const displayed = useMemo(() => {
    let list: MediaAsset[] = [];
    if (tab === 'all') list = [...lib.files, ...PRESETS];
    else if (tab === 'uploads') list = lib.files;
    else if (tab === 'course') list = [...lib.files.filter(f => f.category === 'course'), ...PRESETS.filter(p => p.category === 'course')];
    else if (tab === 'blog') list = [...lib.files.filter(f => f.category === 'blog'), ...PRESETS.filter(p => p.category === 'blog')];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(a => a.name.toLowerCase().includes(q) || (a.tag?.toLowerCase().includes(q)));
  }, [tab, lib.files, search]);

  const apply = () => {
    if (selected.trim()) { onSelect(selected.trim()); onClose(); }
  };

  const applyUrl = () => {
    if (customUrl.trim()) { onSelect(customUrl.trim()); onClose(); }
  };

  async function onFilePick(file: File) {
    const url = await lib.upload(file);
    if (url) { setSelected(url); setTab('uploads'); }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    if (selected === confirmDelete.url) setSelected('');
    await lib.deleteAsset(confirmDelete);
    setConfirmDelete(null);
  }

  const tabBtn = (id: Tab, label: string, Icon: React.ElementType, count?: number) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
        tab === id ? 'brand-gradient text-white shadow-xs' : 'text-secondary hover:text-primary hover:bg-elevated'
      }`}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
      {count !== undefined && <span className="text-[10px] opacity-80">({count})</span>}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] rounded-2xl border border-theme bg-surface shadow-2xl overflow-hidden text-primary animate-in zoom-in-95 duration-200">

        {/* Toast */}
        {lib.toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl border border-theme bg-surface/95 backdrop-blur-md px-4 py-2.5 shadow-xl text-xs font-bold animate-in slide-in-from-top-3 duration-200">
            {lib.toast.type === 'success'
              ? <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              : <AlertCircle className="size-4 text-rose-400 shrink-0" />}
            <span className={lib.toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
              {lib.toast.message}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-elevated/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl brand-gradient text-white shadow-md">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary">Media Library</h3>
              <p className="text-xs text-muted">Browse, upload, and manage images for your courses and blog.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg hover:bg-elevated text-muted hover:text-primary transition cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-subtle bg-canvas/60 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tabBtn('all', 'All', Layers, lib.files.length + PRESETS.length)}
            {tabBtn('uploads', 'Uploaded', FolderOpen, lib.files.length)}
            {tabBtn('course', 'Courses', BookOpen)}
            {tabBtn('blog', 'Blog', Newspaper)}
            <div className="h-4 w-px bg-theme mx-1 shrink-0" />
            <button type="button" onClick={() => setTab('upload_new')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${tab === 'upload_new' ? 'bg-sky-600 text-white' : 'text-secondary hover:text-primary hover:bg-elevated'}`}>
              <Upload className="size-3.5" /><span>Upload</span>
            </button>
            <button type="button" onClick={() => setTab('url_input')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${tab === 'url_input' ? 'bg-indigo-600 text-white' : 'text-secondary hover:text-primary hover:bg-elevated'}`}>
              <LinkIcon className="size-3.5" /><span>URL</span>
            </button>
          </div>

          {tab !== 'upload_new' && tab !== 'url_input' && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tag..." className="w-full rounded-lg border border-theme bg-surface pl-9 pr-3 py-1.5 text-xs text-primary placeholder:text-muted focus:border-active focus:outline-none" />
              {search && <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-xs cursor-pointer">✕</button>}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

          {/* Grid */}
          {tab !== 'upload_new' && tab !== 'url_input' && (
            <div>
              {lib.loading && (
                <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted">
                  <RefreshCw className="size-4 animate-spin text-brand" />
                  <span>Loading assets...</span>
                </div>
              )}

              {!lib.loading && displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-canvas border border-theme">
                    <ImageIcon className="size-7 text-muted" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">No assets found</h4>
                    <p className="text-xs text-muted mt-1 max-w-xs">
                      {search ? `Nothing matches "${search}".` : 'No media in this category yet.'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setTab('upload_new')} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white cursor-pointer">
                    <Upload className="size-3.5" /><span>Upload Image</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayed.map((item) => {
                  const isSelected = selected === item.url;
                  return (
                    <div key={item.id} onClick={() => setSelected(item.url)} className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col bg-canvas ${isSelected ? 'border-brand ring-2 ring-brand-500/40 shadow-lg scale-[1.02]' : 'border-theme hover:border-active hover:shadow-md'}`}>
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(item.url)} alt={item.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-brand text-white shadow-md">
                            <Check className="size-3.5 stroke-[3]" />
                          </div>
                        )}
                        {item.tag && <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">{item.tag}</span>}
                        {item.isCustom && (
                          <button type="button" onClick={e => { e.stopPropagation(); setConfirmDelete(item); }} disabled={lib.deletingId === item.id} className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-lg bg-black/70 hover:bg-rose-600 text-white/80 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer" title="Delete">
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 space-y-1">
                        <p className="text-xs font-bold text-primary truncate" title={item.name}>{item.name}</p>
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

          {/* Upload tab */}
          {tab === 'upload_new' && (
            <div className="max-w-xl mx-auto py-8 space-y-6">
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) void onFilePick(f); }}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition cursor-pointer text-center ${drag ? 'border-brand bg-brand/10' : 'border-theme hover:border-active bg-canvas hover:bg-elevated/40'}`}
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) void onFilePick(f); }} />
                <div className="flex size-16 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg mb-4">
                  {lib.uploading ? <RefreshCw className="size-8 animate-spin" /> : <Upload className="size-8" />}
                </div>
                <h4 className="text-sm font-bold text-primary">{lib.uploading ? 'Uploading...' : 'Click or drag an image here'}</h4>
                <p className="text-xs text-muted mt-1">PNG, JPG, WebP, SVG · max 10MB</p>
              </div>

              {lib.uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="size-4 shrink-0" /><span>{lib.uploadError}</span>
                </div>
              )}
              {lib.uploadSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Check className="size-4 shrink-0" /><span>Uploaded and selected!</span>
                </div>
              )}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url_input' && (
            <div className="max-w-xl mx-auto py-8 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-primary">Paste an image URL</label>
                <div className="flex gap-2">
                  <input type="url" value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="flex-1 rounded-xl border border-theme bg-canvas px-4 py-2.5 text-xs text-primary placeholder:text-muted outline-none focus:border-active" />
                  <button type="button" onClick={applyUrl} disabled={!customUrl.trim()} className="rounded-xl brand-gradient disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold cursor-pointer shrink-0">
                    Use URL
                  </button>
                </div>
              </div>
              {customUrl.trim() && (
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-theme bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={customUrl} alt="Preview" className="size-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-subtle bg-elevated/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {selected ? (
              <>
                <div className="size-9 rounded-lg overflow-hidden border border-theme shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(selected)} alt="" className="size-full object-cover" />
                </div>
                <p className="text-[10px] text-muted truncate max-w-xs">{selected}</p>
              </>
            ) : (
              <span className="text-xs text-muted">No image selected</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="rounded-xl border border-theme bg-surface hover:bg-elevated text-secondary px-4 py-2 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="button" onClick={apply} disabled={!selected} className="inline-flex items-center gap-2 rounded-xl brand-gradient disabled:opacity-50 text-white px-6 py-2 text-xs font-bold shadow-md cursor-pointer">
              <Check className="size-4" /><span>Use Image</span>
            </button>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {confirmDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl border border-theme bg-surface p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/25">
                <Trash2 className="size-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary">Delete this image?</h4>
                <p className="text-xs text-muted mt-1">This will remove it from your media library.</p>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-theme bg-canvas text-left">
                <div className="size-12 rounded-lg overflow-hidden border border-theme shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(confirmDelete.url)} alt="" className="size-full object-cover" />
                </div>
                <p className="text-xs font-bold text-primary truncate">{confirmDelete.name}</p>
              </div>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => setConfirmDelete(null)} disabled={Boolean(lib.deletingId)} className="flex-1 rounded-xl border border-theme bg-canvas hover:bg-elevated text-secondary py-2.5 text-xs font-bold transition cursor-pointer">
                  Cancel
                </button>
                <button type="button" onClick={onDelete} disabled={Boolean(lib.deletingId)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-2.5 text-xs font-bold cursor-pointer">
                  {lib.deletingId ? <><RefreshCw className="size-3.5 animate-spin" /><span>Deleting...</span></> : <><Trash2 className="size-3.5" /><span>Delete</span></>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
