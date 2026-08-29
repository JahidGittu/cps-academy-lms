'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Columns,
  Sparkles,
} from 'lucide-react';
import { RichContent } from './rich-content';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = 'Write content here...',
  rows = 10,
  required = false,
}: RichTextEditorProps) => {
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange({ target: { value: newValue } });

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'h1':
        applyFormatting('# ', '', 'Main Heading');
        break;
      case 'h2':
        applyFormatting('## ', '', 'Section Title');
        break;
      case 'h3':
        applyFormatting('### ', '', 'Topic Header');
        break;
      case 'bold':
        applyFormatting('**', '**', 'bold text');
        break;
      case 'italic':
        applyFormatting('*', '*', 'italic text');
        break;
      case 'bullet-list':
        applyFormatting('- ', '', 'List item');
        break;
      case 'numbered-list':
        applyFormatting('1. ', '', 'Numbered item');
        break;
      case 'quote':
        applyFormatting('> ', '', 'Important note or quote');
        break;
      case 'code':
        applyFormatting('```typescript\n', '\n```', '// Your code snippet here');
        break;
      case 'link':
        applyFormatting('[', '](https://example.com)', 'Link Title');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-primary">
          {label}
        </label>

        {/* View Mode Toggle: Edit vs Split vs Live Preview */}
        <div className="flex items-center rounded-lg bg-canvas p-1 border border-theme text-xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-surface text-sky-400 font-bold shadow-2xs'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Edit3 className="size-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-surface text-sky-400 font-bold shadow-2xs'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Columns className="size-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-surface text-sky-400 font-bold shadow-2xs'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Eye className="size-3.5" />
            <span>Live Output</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-2xs focus-within:border-sky-500/50 transition-all">
        {/* Formatting Toolbar (shown when in edit or split mode) */}
        {viewMode !== 'preview' && (
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-subtle bg-canvas/90 px-2.5 py-1.5 backdrop-blur-xs">
            {/* Headings */}
            <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
              <button
                type="button"
                title="Heading 1 (Main Section)"
                onClick={() => handleToolbarAction('h1')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer font-bold text-xs"
              >
                <Heading1 className="size-4" />
              </button>
              <button
                type="button"
                title="Heading 2 (Sub Section)"
                onClick={() => handleToolbarAction('h2')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer text-xs font-bold"
              >
                <Heading2 className="size-4" />
              </button>
              <button
                type="button"
                title="Heading 3 (Topic Header)"
                onClick={() => handleToolbarAction('h3')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer text-xs font-bold"
              >
                <Heading3 className="size-4" />
              </button>
            </div>

            {/* Basic Text Styling */}
            <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
              <button
                type="button"
                title="Bold text"
                onClick={() => handleToolbarAction('bold')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer font-bold"
              >
                <Bold className="size-4" />
              </button>
              <button
                type="button"
                title="Italic text"
                onClick={() => handleToolbarAction('italic')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <Italic className="size-4" />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
              <button
                type="button"
                title="Bullet list"
                onClick={() => handleToolbarAction('bullet-list')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                title="Numbered list"
                onClick={() => handleToolbarAction('numbered-list')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <ListOrdered className="size-4" />
              </button>
              <button
                type="button"
                title="Blockquote"
                onClick={() => handleToolbarAction('quote')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <Quote className="size-4" />
              </button>
            </div>

            {/* Code, Links & Image Upload */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                title="Code Block"
                onClick={() => handleToolbarAction('code')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer font-mono"
              >
                <Code className="size-4" />
              </button>
              <button
                type="button"
                title="Insert Hyperlink"
                onClick={() => handleToolbarAction('link')}
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <LinkIcon className="size-4" />
              </button>
              <label
                title="Upload & Insert Image from computer"
                className="rounded p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
              >
                <ImageIcon className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
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
                          applyFormatting(`\n![${file.name.replace(/\.[^/.]+$/, '')}](${data.url})\n`, '', '');
                        }
                      }
                    } catch (err) {
                      console.error('Image upload failed', err);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* View Mode Layouts */}
        {viewMode === 'edit' ? (
          <div>
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className="w-full bg-surface p-4 text-xs sm:text-sm text-primary outline-none placeholder:text-muted font-mono leading-relaxed resize-y"
            />
          </div>
        ) : viewMode === 'split' ? (
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-subtle">
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className="w-full bg-surface p-4 text-xs sm:text-sm text-primary outline-none placeholder:text-muted font-mono leading-relaxed resize-none"
            />
            <div className="bg-canvas/50 p-4 overflow-y-auto max-h-[400px]">
              <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">Live Student View</p>
              <div className="text-xs sm:text-sm text-secondary leading-relaxed">
                <RichContent content={value} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-canvas p-6 overflow-y-auto min-h-[220px]">
            <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-3">Live Formatted Student Output</p>
            <div className="text-xs sm:text-sm text-secondary leading-relaxed">
              <RichContent content={value} />
            </div>
          </div>
        )}
      </div>

      {/* Instant Visual Output helper card if in edit mode and has text */}
      {viewMode === 'edit' && value.trim() && (
        <div className="rounded-xl border border-theme bg-canvas/70 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-2.5">
            <Sparkles className="size-3.5" />
            <span>Live Formatted Output (স্টুডেন্টরা যেমন দেখবে)</span>
          </div>
          <div className="text-xs sm:text-sm text-secondary leading-relaxed border-t border-subtle pt-2.5">
            <RichContent content={value} />
          </div>
        </div>
      )}
    </div>
  );
};
