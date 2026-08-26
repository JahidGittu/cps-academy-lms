'use client';

import { useState } from 'react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { User } from '@/lib/types';
import { Alert, Button, Empty } from '@/components/ui';

type Role = { id: number; name: string; type: string };

// Public and Authenticated belong to the users-permissions plugin, not to this project. Neither
// appears in the permission matrix, so moving an account into one would leave it signed in and
// allowed to do nothing at all.
const pluginRoles = ['public', 'authenticated'];

export const UserList = ({ onChanged }: { onChanged: () => void }) => {
  const { user: me } = useAuth();

  // The id being written, so one row can say it is busy without the other rows going grey.
  const [busy, setBusy] = useState(0);
  const [actionError, setActionError] = useState('');

  const users = useApi<User[]>('/users?populate=role');
  const roles = useApi<{ roles: Role[] }>('/users-permissions/roles');

  const assignable = (roles.data?.roles ?? []).filter((role) => !pluginRoles.includes(role.type));

  const write = async (id: number, run: () => Promise<unknown>) => {
    setBusy(id);
    setActionError('');

    try {
      await run();
      await users.reload();
      onChanged();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(0);
    }
  };

  const remove = (row: User) => {
    if (!window.confirm(`Remove ${row.username}? Their enrollments and results go with them.`)) {
      return;
    }

    void write(row.id, () => api.delete(`/users/${row.id}`));
  };

  if (users.loading) return <p className="text-sm text-slate-500">Loading accounts</p>;

  if (users.error) return <Alert>{users.error}</Alert>;

  const rows = users.data ?? [];

  if (!rows.length) return <Empty>No accounts.</Empty>;

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">Accounts</h2>

      <Alert>{actionError}</Alert>

      <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {rows.map((row) => {
          // An admin editing their own row is how a platform ends up with nobody who can administer
          // it, so this one row is read only. Another admin can still change it.
          const self = row.id === me?.id;

          return (
            <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-48 flex-1">
                <span className="block font-medium">{row.username}</span>
                <span className="block text-xs text-slate-500">{row.email}</span>
              </span>

              {self ? (
                <span className="text-slate-500">{row.role?.name} (you)</span>
              ) : (
                <select
                  value={row.role?.id ?? ''}
                  disabled={busy === row.id}
                  onChange={(event) =>
                    void write(row.id, () =>
                      api.put(`/users/${row.id}`, { role: Number(event.target.value) })
                    )
                  }
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                >
                  {assignable.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}

              {!self && (
                <Button variant="danger" disabled={busy === row.id} onClick={() => remove(row)}>
                  Remove
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
