// A blog post body is Markdown and there is no separate summary field, so the first ordinary line of
// prose stands in for one. Headings are skipped because "## Introduction" tells a reader nothing.
// Used by the blog list and by the three posts on the front page.
export const excerpt = (body: string) =>
  body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#')) ?? '';
