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
      <Field
        label="Article Title"
        value={values.title}
        onChange={set('title')}
        required
        placeholder="e.g. Architecting Scalable Web Applications"
      />

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
          label="Cover Image / Thumbnail URL"
          value={values.coverImageUrl}
          onChange={set('coverImageUrl')}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Sparkles className="size-3 text-brand-600" />
            <span>Preset article covers:</span>
          </span>
          {SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, coverImageUrl: sample.url }))}
              className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition border border-slate-200"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {values.coverImageUrl && (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ImageIcon className="size-3.5 text-brand-600" />
            <span>Cover Live Preview</span>
          </p>
          <div className="relative h-44 w-full overflow-hidden rounded bg-slate-900 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.coverImageUrl}
              alt="Article Cover Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Publication State</span>
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
