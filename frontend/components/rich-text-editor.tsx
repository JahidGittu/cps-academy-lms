'use client';

import { useEffect, useRef, type ChangeEvent } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

// Convert legacy markdown into rich HTML so in-place WYSIWYG editor displays it styled immediately
const toRichHtml = (text: string): string => {
  if (!text) return '';
  if (text.includes('<') && (text.includes('</p>') || text.includes('</h1>') || text.includes('</h2>') || text.includes('</ul>') || text.includes('</li>') || text.includes('<div') || text.includes('<br'))) {
    return text;
  }

  // Convert markdown lines into HTML paragraphs, headings, and lists
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${line.slice(2)}</li>`);
    } else if (line.startsWith('> ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<blockquote>${line.slice(2)}</blockquote>`);
    } else if (line.startsWith('```')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      // Collect code block
      const codeBlock: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeBlock.push(lines[i]);
        i++;
      }
      htmlParts.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      // Parse inline **bold**
      let p = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      p = p.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      p = p.replace(/`([^`]+)`/g, '<code>$1</code>');
      htmlParts.push(`<p>${p}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('');
};

export const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = 'Write content here...',
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Initialize and synchronize HTML content in contentEditable div
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const formattedHtml = toRichHtml(value);
    if (!isInternalUpdate.current && editor.innerHTML !== formattedHtml) {
      editor.innerHTML = formattedHtml;
    }
    isInternalUpdate.current = false;
  }, [value]);

  const notifyChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    isInternalUpdate.current = true;
    const html = editor.innerHTML;
    onChange({ target: { value: html } });
  };

  const exec = (command: string, val: string = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, val);
    notifyChange();
  };

  const handleHeading = (tag: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    // Check if current format is already the tag; toggle to paragraph if so
    document.execCommand('formatBlock', false, `<${tag}>`);
    notifyChange();
  };

  const insertCodeBlock = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    const selectedText = selection?.toString() || '// Write your code snippet here';
    const preHtml = `<pre><code>${selectedText}</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, preHtml);
    notifyChange();
  };

  const insertLink = () => {
    const url = prompt('Enter website or resource URL:', 'https://');
    if (!url) return;
    exec('createLink', url);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-primary">
        {label}
      </label>

      {/* Unified Google Docs Style Rich Editor Box */}
      <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-2xs focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/15 transition-all">
        {/* Formatting Toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-subtle bg-canvas/95 px-2.5 py-1.5 backdrop-blur-md">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
            <button
              type="button"
              title="Heading 1 (Main Title)"
              onClick={() => handleHeading('h1')}
              className="rounded-md px-2 py-1 text-xs font-black text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 2 (Sub Section)"
              onClick={() => handleHeading('h2')}
              className="rounded-md px-2 py-1 text-xs font-bold text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 3 (Topic Header)"
              onClick={() => handleHeading('h3')}
              className="rounded-md px-2 py-1 text-xs font-semibold text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Heading3 className="size-4" />
            </button>
          </div>

          {/* Text Styling */}
          <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
            <button
              type="button"
              title="Bold"
              onClick={() => exec('bold')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer font-bold"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => exec('italic')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              title="Underline"
              onClick={() => exec('underline')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Underline className="size-4" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
            <button
              type="button"
              title="Bullet List"
              onClick={() => exec('insertUnorderedList')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              title="Numbered List"
              onClick={() => exec('insertOrderedList')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              title="Quote"
              onClick={() => handleHeading('blockquote')}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <Quote className="size-4" />
            </button>
          </div>

          {/* Code, Links & Image Upload */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Code Block"
              onClick={insertCodeBlock}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer font-mono"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
              title="Insert Hyperlink"
              onClick={insertLink}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
            >
              <LinkIcon className="size-4" />
            </button>
            <label
              title="Upload & Insert Image from computer"
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
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
                        const imgHtml = `<img src="${data.url}" alt="${file.name}" class="rounded-lg my-2 max-w-full border border-theme" /><p><br></p>`;
                        editorRef.current?.focus();
                        document.execCommand('insertHTML', false, imgHtml);
                        notifyChange();
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

        {/* Single Unified In-Place WYSIWYG Editable Document Canvas */}
        <div
          ref={editorRef}
          contentEditable
          onInput={notifyChange}
          onBlur={notifyChange}
          data-placeholder={placeholder}
          className="wysiwyg-content w-full bg-surface p-5 text-sm text-secondary outline-none leading-relaxed transition-all"
        />
      </div>
    </div>
  );
};
