// Clean plain text summary excerpt generator supporting both Rich HTML and Markdown prose.
// Used by the blog table, blog list cards, and homepage featured posts.
export const excerpt = (body: string, maxLength = 120): string => {
  if (!body) return '';

  // 1. Strip all HTML tags
  const plainText = body
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Remove markdown symbols
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
};
