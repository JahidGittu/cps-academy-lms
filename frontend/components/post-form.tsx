'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field, inputStyle } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';
import { RichTextEditor } from '@/components/rich-text-editor';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  publishState: 'draft' | 'published';
};

const BLOG_PRESETS = [
  { label: 'Engineering Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80' },
  { label: 'Coding Setup', url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80' },
  { label: 'Software Review', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80' },
  { label: 'System Architecture', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' },
];

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
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { value: string } }) =>
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
    <form onSubmit={submit} className="space-y-6">
      <Field
        label="Article Title"
        value={values.title}
        onChange={set('title')}
        required
        placeholder="e.g. Architecting Scalable Web Applications"
      />

      <RichTextEditor
        label="Article Body"
        value={values.body}
        onChange={set('body')}
        required
        rows={12}
        placeholder="Write your article content, paragraphs, code snippets, and analysis..."
      />

      {/* Dual Upload & URL Image Picker */}
      <ImagePicker
        label="Article Cover Image / Thumbnail"
        value={values.coverImageUrl}
        onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
        presets={BLOG_PRESETS}
      />

      <div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-primary">Publication State</span>
          <select
            value={values.publishState}
            onChange={set('publishState')}
            className={inputStyle}
          >
            <option value="draft">Draft (Visible to managers and admin only)</option>
            <option value="published">Published (Visible on public engineering blog)</option>
          </select>
        </label>
      </div>

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? 'Saving Article...' : label}
      </Button>
    </form>
  );
};
