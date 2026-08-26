'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field, inputStyle, TextField } from '@/components/ui';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  publishState: 'draft' | 'published';
};

// New posts start as drafts. Publishing is a decision somebody makes on purpose, so it is never the
// default a form fills in for them.
export const PostForm = ({
  post,
  save,
  label,
}: {
  post?: BlogPost;
  save: (values: PostValues) => Promise<void>;
  label: string;
}) => {
  const [values, setValues] = useState<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    publishState: post?.publishState ?? 'draft',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set =
    (field: keyof PostValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await save(values);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title" value={values.title} onChange={set('title')} required />

      {/* rows rather than a taller class, so it does not fight the min height every textarea has. */}
      <TextField
        label="Body (Markdown)"
        value={values.body}
        onChange={set('body')}
        required
        rows={16}
      />

      <Field
        label="Cover image URL"
        value={values.coverImageUrl}
        onChange={set('coverImageUrl')}
        placeholder="https://"
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Visibility</span>

        <select value={values.publishState} onChange={set('publishState')} className={inputStyle}>
          <option value="draft">Draft, only the blog team can read it</option>
          <option value="published">Published, anyone can read it</option>
        </select>
      </label>

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy}>
        {busy ? 'Saving' : label}
      </Button>
    </form>
  );
};
