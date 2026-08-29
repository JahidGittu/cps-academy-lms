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

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code Block Delimiter
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="my-4 overflow-x-auto rounded-lg bg-canvas p-4 font-mono text-xs text-primary border border-theme leading-relaxed"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${index}`} className="mt-6 mb-2 text-base sm:text-lg font-bold text-primary">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${index}`} className="mt-8 mb-3 text-lg sm:text-xl font-bold text-primary tracking-tight">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${index}`} className="mt-8 mb-4 text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
          {renderInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="my-3 border-l-4 border-brand-border bg-brand-subtle/50 px-4 py-2 text-sm italic text-secondary rounded-r-md"
        >
          {renderInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      return;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumberedList) flushList();
      isNumberedList = false;
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!isNumberedList) flushList();
      isNumberedList = true;
      listItems.push(numMatch[2]);
      return;
    }

    // Regular paragraph or empty line
    flushList();

    if (trimmed === '') {
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="my-2.5 leading-relaxed text-secondary text-sm sm:text-base">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key={`code-end`}
        className="my-4 overflow-x-auto rounded-lg bg-canvas p-4 font-mono text-xs text-primary border border-theme leading-relaxed"
      >
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className={`rich-content space-y-1 ${className}`}>{elements}</div>;
};
