'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (post) {
      setValues({
        title: post.title ?? '',
        body: post.body ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        publishState: post.publishState ?? 'draft',
      });
    }
  }, [post?.documentId, post?.createdAt]);

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
