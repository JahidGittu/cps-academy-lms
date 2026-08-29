'use client';

import type { KeyboardEvent } from 'react';
import { CheckCircle2, Plus, Tag, X } from 'lucide-react';

const PRESET_TOPICS = [
  'Tutorial', 'DevOps', 'Security', 'Database', 'Frontend', 'Backend', 'Architecture',
];

interface Props {
  activeTags: string[];
  onToggle: (tag: string) => void;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export const PostTags = ({ activeTags, onToggle, onAdd, onRemove }: Props) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const val = e.currentTarget.value.trim();
    if (val) { onAdd(val); e.currentTarget.value = ''; }
  };

  const handleAddClick = (input: HTMLInputElement | null) => {
    if (!input) return;
    const val = input.value.trim();
    if (val) { onAdd(val); input.value = ''; }
  };

  return (
    <div className="rounded-xl border border-theme bg-surface p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-primary flex items-center gap-1.5">
          <Tag className="size-3.5 text-sky-400" />
          <span>Tags ({activeTags.length})</span>
        </label>
        <span className="text-[10px] text-muted font-medium">Click to toggle</span>
      </div>

      {activeTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-canvas border border-theme">
          {activeTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 text-xs font-bold">
              <span>{tag}</span>
              <button type="button" onClick={() => onRemove(tag)} className="hover:text-red-400 cursor-pointer p-0.5" title={`Remove ${tag}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-2 rounded-lg bg-canvas border border-dashed border-theme text-center">
          <span className="text-[11px] text-muted">No tags selected</span>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="block text-[11px] font-semibold text-muted">Topics:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TOPICS.map((topic) => {
            const active = activeTags.some((t) => t.toLowerCase() === topic.toLowerCase());
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onToggle(topic)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  active
                    ? 'brand-gradient text-white shadow-xs border border-transparent'
                    : 'bg-canvas text-secondary border border-theme hover:bg-elevated hover:text-primary'
                }`}
              >
                <span>{topic}</span>
                {active ? <CheckCircle2 className="size-3" /> : <Plus className="size-3 text-muted" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Add custom tag (Enter to add)..."
          className="w-full rounded-lg border border-theme bg-canvas px-3 py-1.5 text-xs text-primary placeholder:text-muted outline-none focus:border-active"
          ref={(el) => {
            if (el) el.dataset.tagInput = 'true';
          }}
        />
        <button
          type="button"
          onClick={() => {
            const el = document.querySelector<HTMLInputElement>('[data-tag-input="true"]');
            handleAddClick(el);
          }}
          className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white p-1.5 shrink-0 cursor-pointer"
          title="Add tag"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
};
