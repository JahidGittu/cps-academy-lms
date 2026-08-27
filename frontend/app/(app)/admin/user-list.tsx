'use client';

import { useState } from 'react';
import { Shield, UserCheck, CheckCircle2 } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Role, User } from '@/lib/types';
import { Alert } from '@/components/ui';

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  'Content Manager': 'bg-amber-50 text-amber-700 border-amber-200',
  Instructor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const UserList = ({ onChanged }: { onChanged?: () => void }) => {
  const { user: me } = useAuth();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);

  const users = useApi<User[]>('/users?populate=role&sort=createdAt:desc');
  const roles = useApi<{ roles: Role[] }>('/users-permissions/roles');

  const rows = users.data ?? [];
  const availableRoles = roles.data?.roles ?? [];

  const changeRole = async (targetUserId: number, roleId: number) => {
    setBusyId(targetUserId);
    setActionError('');
    setSuccessId(null);

    try {
      await api.put(`/users/${targetUserId}`, { role: roleId });
      await users.reload();
      onChanged?.();
      setSuccessId(targetUserId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (caught) {
      setActionError(errorMessage(caught, 'Could not update user role'));
    } finally {
      setBusyId(null);
    }
  };

  if (users.loading) return <p className="text-sm text-slate-500">Loading user directory...</p>;

  if (users.error) return <Alert>{users.error}</Alert>;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage user roles and platform access permissions.</p>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
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
                          <span className="block font-semibold text-slate-900">
                            {row.username} {self && <span className="text-xs font-normal text-slate-400">(You)</span>}
                          </span>
                          <span className="block text-xs text-slate-400">{row.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
                        {roleName === 'Admin' ? <Shield className="size-3" /> : <UserCheck className="size-3" />}
                        <span>{roleName}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {self ? (
                        <span className="text-xs text-slate-400 italic">Self role protected</span>
                      ) : (
                        <select
                          disabled={busyId === row.id}
                          value={row.role?.id ?? ''}
                          onChange={(e) => void changeRole(row.id, Number(e.target.value))}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                        >
                          {availableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {busyId === row.id ? (
                        <span className="text-xs font-semibold text-brand-600 animate-pulse">Updating...</span>
                      ) : successId === row.id ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="size-3.5" />
                          <span>Updated!</span>
                        </span>
                      ) : null}
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
