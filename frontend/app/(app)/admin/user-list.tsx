'use client';

import { useState } from 'react';
import { Shield, Trash2, UserCheck } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { User } from '@/lib/types';
import { Alert, Empty } from '@/components/ui';

type Role = { id: number; name: string; type: string };

const pluginRoles = ['public', 'authenticated'];

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  'Content Manager': 'bg-amber-50 text-amber-700 border-amber-200',
  Instructor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const UserList = ({ onChanged }: { onChanged: () => void }) => {
  const { user: me } = useAuth();

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
    if (!window.confirm(`Remove user "${row.username}"? This will also remove their associated records.`)) {
      return;
    }

    void write(row.id, () => api.delete(`/users/${row.id}`));
  };

  if (users.loading) return <p className="text-sm text-slate-500">Loading user accounts...</p>;

  if (users.error) return <Alert>{users.error}</Alert>;

  const rows = users.data ?? [];

  if (!rows.length) return <Empty>No registered accounts.</Empty>;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Manage user roles and platform access permissions.</p>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Current Role</th>
                <th className="px-5 py-3.5">Assign Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const self = row.id === me?.id;
                const roleName = row.role?.name ?? 'Student';
                const badgeStyle = roleBadgeColor[roleName] ?? 'bg-slate-50 text-slate-700 border-slate-200';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase">
                          {row.username.slice(0, 2)}
                        </span>
                        <div>
                          <span className="block font-semibold text-slate-900">{row.username}</span>
                          <span className="block text-xs text-slate-500">{row.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
                        {roleName}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {self ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Shield className="size-3.5" />
                          <span>Logged-in Admin</span>
                        </span>
                      ) : (
                        <select
                          value={row.role?.id ?? ''}
                          disabled={busy === row.id}
                          onChange={(event) =>
                            void write(row.id, () =>
                              api.put(`/users/${row.id}`, { role: Number(event.target.value) })
                            )
                          }
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                        >
                          {assignable.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {self ? null : (
                        <button
                          type="button"
                          disabled={busy === row.id}
                          onClick={() => remove(row)}
                          title="Remove user"
                          className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
