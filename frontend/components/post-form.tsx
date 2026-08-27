'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field, inputStyle, TextField } from '@/components/ui';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  publishState: 'draft' | 'published';
};

const SAMPLES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
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
    <form onSubmit={submit} className="space-y-5">
      <Field label="Article Title" value={values.title} onChange={set('title')} required placeholder="e.g. Architecting Scalable Web Applications" />

      <TextField
        label="Article Body (Markdown supported)"
        value={values.body}
        onChange={set('body')}
        required
        rows={14}
        placeholder="Write content with markdown formatting..."
      />

      <div>
        <Field
          label="Cover Image URL"
          value={values.coverImageUrl}
          onChange={set('coverImageUrl')}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="size-3 text-brand-600" />
          <span>Quick sample images:</span>
          {SAMPLES.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
              className="text-brand-600 underline hover:text-brand-800"
            >
              Image {i + 1}
            </button>
          ))}
        </div>
      </div>

      {values.coverImageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
            <ImageIcon className="size-3.5" />
            <span>Cover Preview</span>
          </p>
          <div className="relative h-36 w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.coverImageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Publishing State</span>
        <select value={values.publishState} onChange={set('publishState')} className={inputStyle}>
          <option value="draft">Draft (Restricted to Content Managers & Admins)</option>
          <option value="published">Published (Visible to all students and public)</option>
        </select>
      </label>

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? 'Saving Article...' : label}
      </Button>
    </form>
  );
};
