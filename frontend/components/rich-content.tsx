'use client';

import React from 'react';

// Lightweight, zero-dependency rich content renderer for lesson & blog formatting
export const RichContent = ({
  content,
  className = '',
}: {
  content?: string | null;
  className?: string;
}) => {
  if (!content || !content.trim()) {
    return <p className="text-xs text-muted italic">No content provided.</p>;
  }

  // Check if content is formatted HTML from our WYSIWYG editor
  const isHtml =
    content.includes('<') &&
    (content.includes('</p>') ||
      content.includes('</h1>') ||
      content.includes('</h2>') ||
      content.includes('</h3>') ||
      content.includes('</ul>') ||
      content.includes('</ol>') ||
      content.includes('</li>') ||
      content.includes('</blockquote>') ||
      content.includes('</pre>') ||
      content.includes('<img') ||
      content.includes('<br'));

  if (isHtml) {
    return (
      <div
        className={`prose-custom max-w-none text-secondary ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const renderInline = (text: string): React.ReactNode => {
    // Split by bold (**text**), italic (*text*), code (`code`), and link ([title](url))
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        tokens.push(
          <strong key={match.index} className="font-bold text-primary">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        tokens.push(
          <em key={match.index} className="italic">
            {raw.slice(1, -1)}
          </em>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        tokens.push(
          <code
            key={match.index}
            className="rounded bg-elevated px-1.5 py-0.5 text-xs font-mono text-brand border border-theme"
          >
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('[') && raw.includes('](')) {
        const titleMatch = raw.match(/\[([^\]]+)\]/);
        const urlMatch = raw.match(/\(([^)]+)\)/);
        if (titleMatch && urlMatch) {
          tokens.push(
            <a
              key={match.index}
              href={urlMatch[1]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline font-semibold"
            >
              {titleMatch[1]}
            </a>
          );
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens.length ? tokens : text;
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-3 ml-5 list-decimal space-y-1 text-secondary">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-3 ml-5 list-disc space-y-1 text-secondary">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith('```')) {
      flushList();
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 overflow-x-auto rounded-lg border border-theme bg-canvas p-4 font-mono text-xs text-primary shadow-2xs leading-relaxed"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Markdown Image tag: ![alt](url)
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushList();
      const altText = imageMatch[1];
      const imageUrl = imageMatch[2];
      elements.push(
        <figure key={`img-${i}`} className="my-4 overflow-hidden rounded-xl border border-theme shadow-xs bg-canvas/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={altText || 'Lesson image'} className="w-full max-h-[500px] object-cover" />
          {altText && (
            <figcaption className="p-2 text-center text-xs text-muted border-t border-subtle bg-surface">
              {altText}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // Numbered list: 1. Item
    const numListMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numListMatch) {
      if (!isNumberedList && listItems.length > 0) {
        flushList();
      }
      isNumberedList = true;
      listItems.push(numListMatch[2]);
      continue;
    }

    // Bullet list: - Item or * Item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (isNumberedList && listItems.length > 0) {
        flushList();
      }
      isNumberedList = false;
      listItems.push(line.slice(2));
      continue;
    }

    // End of list
    flushList();

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-6 mb-3 text-2xl font-extrabold text-primary tracking-tight">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2.5 text-xl font-bold text-primary tracking-tight">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-base font-bold text-primary">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-4 border-brand-border bg-brand-subtle/50 px-4 py-2 text-xs sm:text-sm italic text-secondary rounded-r-lg"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="my-2 text-xs sm:text-sm text-secondary leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
