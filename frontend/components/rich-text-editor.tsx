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
  Eye,
  Edit3,
} from 'lucide-react';
import Markdown from 'react-markdown';

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
  rows = 12,
  required = false,
}: RichTextEditorProps) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
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
      case 'bold':
        applyFormatting('**', '**', 'bold text');
        break;
      case 'italic':
        applyFormatting('*', '*', 'italic text');
        break;
      case 'h1':
        applyFormatting('\n# ', '\n', 'Heading 1');
        break;
      case 'h2':
        applyFormatting('\n## ', '\n', 'Heading 2');
        break;
      case 'h3':
        applyFormatting('\n### ', '\n', 'Heading 3');
        break;
      case 'quote':
        applyFormatting('\n> ', '\n', 'Quote text');
        break;
      case 'bullet-list':
        applyFormatting('\n- ', '\n', 'List item');
        break;
      case 'numbered-list':
        applyFormatting('\n1. ', '\n', 'List item');
        break;
      case 'code':
        applyFormatting('\n```javascript\n', '\n```\n', '// Code snippet here');
        break;
      case 'link':
        applyFormatting('[', '](https://example.com)', 'link text');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Write / Preview Tab Pill */}
        <div className="inline-flex rounded bg-slate-100 p-0.5 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`inline-flex items-center gap-1 rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              mode === 'write'
                ? 'bg-white text-brand-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="size-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1 rounded px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              mode === 'preview'
                ? 'bg-white text-brand-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="size-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        {/* Sticky Top Formatting Toolbar (Tiptap Style) */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/90 px-2.5 py-1.5 backdrop-blur-xs">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              title="Heading 1 (Main Section)"
              onClick={() => handleToolbarAction('h1')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 2 (Sub Section)"
              onClick={() => handleToolbarAction('h2')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 3 (Topic Header)"
              onClick={() => handleToolbarAction('h3')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Heading3 className="size-4" />
            </button>
          </div>

          {/* Basic Text Styling */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              title="Bold text"
              onClick={() => handleToolbarAction('bold')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer font-bold"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              title="Italic text"
              onClick={() => handleToolbarAction('italic')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Italic className="size-4" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              title="Bullet list"
              onClick={() => handleToolbarAction('bullet-list')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              title="Numbered list"
              onClick={() => handleToolbarAction('numbered-list')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              title="Blockquote"
              onClick={() => handleToolbarAction('quote')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Quote className="size-4" />
            </button>
          </div>

          {/* Code & Links */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Code Block"
              onClick={() => handleToolbarAction('code')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
              title="Insert Link"
              onClick={() => handleToolbarAction('link')}
              className="rounded p-1.5 text-slate-600 hover:bg-white hover:text-brand-600 hover:shadow-2xs transition cursor-pointer"
            >
              <LinkIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white p-4 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 font-mono leading-relaxed resize-y"
          />
        ) : (
          <div className="min-h-[220px] bg-slate-50/50 p-5 overflow-auto">
            {value.trim() ? (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed">
                <Markdown>{value}</Markdown>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No content to preview yet. Start typing in the Write tab.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
