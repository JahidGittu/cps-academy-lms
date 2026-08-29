'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  blockquote: boolean;
  ul: boolean;
  ol: boolean;
}

// Convert legacy markdown into rich HTML so in-place WYSIWYG editor displays it styled immediately
const toRichHtml = (text: string): string => {
  if (!text) return '';
  if (
    text.includes('<') &&
    (text.includes('</p>') ||
      text.includes('</h1>') ||
      text.includes('</h2>') ||
      text.includes('</h3>') ||
      text.includes('</ul>') ||
      text.includes('</ol>') ||
      text.includes('</li>') ||
      text.includes('<div') ||
      text.includes('<br'))
  ) {
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
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${line.slice(2)}</li>`);
    } else if (line.startsWith('> ')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<blockquote>${line.slice(2)}</blockquote>`);
    } else if (line.startsWith('```')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      // Collect code block
      const codeBlock: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeBlock.push(lines[i]);
        i++;
      }
      htmlParts.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
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

  const [formats, setFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
    blockquote: false,
    ul: false,
    ol: false,
  });

  // Query browser for active formatting at cursor position
  const checkActiveFormats = () => {
    if (typeof document === 'undefined') return;
    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const ul = document.queryCommandState('insertUnorderedList');
      const ol = document.queryCommandState('insertOrderedList');

      const blockVal = (document.queryCommandValue('formatBlock') || '').toLowerCase();
      const h1 = blockVal === 'h1' || blockVal.includes('h1');
      const h2 = blockVal === 'h2' || blockVal.includes('h2');
      const h3 = blockVal === 'h3' || blockVal.includes('h3');
      const blockquote = blockVal === 'blockquote' || blockVal.includes('blockquote');

      setFormats({
        bold,
        italic,
        underline,
        h1,
        h2,
        h3,
        blockquote,
        ul,
        ol,
      });
    } catch {
      // Ignore if document not focused
    }
  };

  // Synchronize cursor selection changes with active toolbar state
  useEffect(() => {
    const handleSelection = () => {
      if (editorRef.current && editorRef.current.contains(document.activeElement)) {
        checkActiveFormats();
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

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
    checkActiveFormats();
  };

  const exec = (command: string, val: string = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, val);
    notifyChange();
  };

  const handleHeading = (tag: 'h1' | 'h2' | 'h3' | 'blockquote') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    // Check if the current format is already active; if so, toggle off to normal paragraph
    const isCurrentlyActive = formats[tag];
    if (isCurrentlyActive) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
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

  const insertImage = () => {
    const url = prompt('Enter public image URL:', 'https://');
    if (!url) return;
    exec('insertImage', url);
  };

  // Helper for active vs inactive toolbar button styles
  const btnClass = (isActive: boolean) =>
    `rounded-md p-1.5 transition-all cursor-pointer flex items-center justify-center ${
      isActive
        ? 'bg-brand-subtle text-brand border border-brand-border font-bold shadow-xs'
        : 'text-secondary hover:bg-elevated hover:text-primary border border-transparent'
    }`;

  const headingBtnClass = (isActive: boolean) =>
    `rounded-md px-2 py-1 text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
      isActive
        ? 'bg-brand-subtle text-brand border border-brand-border font-black shadow-xs'
        : 'text-secondary hover:bg-elevated hover:text-primary border border-transparent'
    }`;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-primary">{label}</label>

      {/* Unified Google Docs Style Rich Editor Box */}
      <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-2xs focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/15 transition-all">
        {/* Formatting Toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-subtle bg-canvas/95 px-2.5 py-1.5 backdrop-blur-md">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
            <button
              type="button"
              title="Heading 1 (Main Section Title) - Click to toggle"
              onClick={() => handleHeading('h1')}
              className={headingBtnClass(formats.h1)}
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 2 (Sub Section Title) - Click to toggle"
              onClick={() => handleHeading('h2')}
              className={headingBtnClass(formats.h2)}
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              title="Heading 3 (Topic Header) - Click to toggle"
              onClick={() => handleHeading('h3')}
              className={headingBtnClass(formats.h3)}
            >
              <Heading3 className="size-4" />
            </button>
          </div>

          {/* Text Styling */}
          <div className="flex items-center gap-0.5 border-r border-subtle pr-1.5">
            <button
              type="button"
              title="Bold (Ctrl+B)"
              onClick={() => exec('bold')}
              className={btnClass(formats.bold)}
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              title="Italic (Ctrl+I)"
              onClick={() => exec('italic')}
              className={btnClass(formats.italic)}
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              title="Underline (Ctrl+U)"
              onClick={() => exec('underline')}
              className={btnClass(formats.underline)}
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
              className={btnClass(formats.ul)}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              title="Numbered List"
              onClick={() => exec('insertOrderedList')}
              className={btnClass(formats.ol)}
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              title="Quote Block - Click to toggle"
              onClick={() => handleHeading('blockquote')}
              className={btnClass(formats.blockquote)}
            >
              <Quote className="size-4" />
            </button>
          </div>

          {/* Code, Links & Image Upload */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Insert Code Snippet Box"
              onClick={insertCodeBlock}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-brand border border-transparent transition cursor-pointer"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
              title="Insert External Web Link"
              onClick={insertLink}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-brand border border-transparent transition cursor-pointer"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              title="Insert Image by URL"
              onClick={insertImage}
              className="rounded-md p-1.5 text-secondary hover:bg-elevated hover:text-brand border border-transparent transition cursor-pointer"
            >
              <ImageIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Live In-Place ContentEditable Editing Surface */}
        <div
          ref={editorRef}
          contentEditable
          onInput={notifyChange}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          className="wysiwyg-content p-4 sm:p-5 outline-none font-sans text-xs sm:text-sm text-secondary min-h-[260px] cursor-text"
          data-placeholder={placeholder}
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
    </div>
  );
};
