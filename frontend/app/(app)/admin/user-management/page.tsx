'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  UserCheck,
  CheckCircle2,
  Users,
  Search,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Role, User } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';
import { UserManagementSkeleton } from '@/components/page-skeletons';
import { ConfirmModal } from '@/components/confirm-modal';

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Content Manager': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Instructor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const VALID_ROLES = ['Admin', 'Instructor', 'Content Manager', 'Student'];

const UserManagementStudio = () => {
  const { user: me } = useAuth();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<{ id: number; username: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const users = useApi<User[]>('/users?populate=role&sort=createdAt:desc');
  const roles = useApi<{ roles: Role[] }>('/users-permissions/roles');

  const rows = users.data ?? [];
  const allRoles = roles.data?.roles ?? [];

  // Filter out internal roles like Authenticated, Public
  const availableRoles = useMemo(() => {
    return allRoles.filter((r) => VALID_ROLES.includes(r.name));
  }, [allRoles]);

  // Summary Metrics
  const adminCount = useMemo(() => rows.filter((u) => u.role?.name === 'Admin').length, [rows]);
  const instructorCount = useMemo(() => rows.filter((u) => u.role?.name === 'Instructor').length, [rows]);
  const managerCount = useMemo(() => rows.filter((u) => u.role?.name === 'Content Manager').length, [rows]);
  const studentCount = useMemo(() => rows.filter((u) => (u.role?.name ?? 'Student') === 'Student').length, [rows]);

  // Search and Filter logic
  const filteredUsers = useMemo(() => {
    return rows.filter((u) => {
      const matchesSearch =
        query.trim() === '' ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());

      const currentRole = u.role?.name ?? 'Student';
      const matchesRole = roleFilter === 'all' || currentRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [rows, query, roleFilter]);

  const hasActiveFilters = query !== '' || roleFilter !== 'all';

  const resetFilters = () => {
    setQuery('');
    setRoleFilter('all');
  };

  const changeRole = async (targetUserId: number, roleId: number) => {
    setBusyId(targetUserId);
    setActionError('');
    setSuccessId(null);

    try {
      await api.put(`/users/${targetUserId}`, { role: roleId });
      await users.reload();
      setSuccessId(targetUserId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (caught) {
      setActionError(errorMessage(caught, 'Could not update user role'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleteBusy(true);
    setActionError('');

    try {
      await api.delete(`/users/${deletingUser.id}`);
      setDeletingUser(null);
      await users.reload();
    } catch (caught) {
      setActionError(errorMessage(caught, 'Could not delete user account'));
    } finally {
      setDeleteBusy(false);
    }
  };

  if (users.loading || roles.loading) {
    return <UserManagementSkeleton />;
  }

  if (users.error) return <Alert>{users.error}</Alert>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
          Users
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Manage user accounts, assign system permission roles, and control administrative access.
        </p>
      </div>

      <Alert>{actionError}</Alert>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Total Accounts</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Instructors</p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-400">{instructorCount}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Content Managers</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-400">{managerCount}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Students</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-400">{studentCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-theme bg-canvas text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-theme bg-surface px-3 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
          >
            <option value="all">All Roles ({rows.length})</option>
            <option value="Admin">Admin ({adminCount})</option>
            <option value="Instructor">Instructor ({instructorCount})</option>
            <option value="Content Manager">Content Manager ({managerCount})</option>
            <option value="Student">Student ({studentCount})</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-theme bg-elevated px-2.5 py-1.5 text-xs font-bold text-secondary hover:text-primary transition"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-muted font-medium px-1">
        <span>
          Showing <strong>{filteredUsers.length}</strong> of {rows.length} users
        </span>
      </div>

      {/* User Management Table */}
      {filteredUsers.length === 0 ? (
        <Empty>
          <p className="text-base font-bold text-primary">No users match your search criteria</p>
          <p className="text-xs text-muted mt-1">Try resetting the search keywords or role filters.</p>
          {hasActiveFilters && (
            <Button variant="plain" onClick={resetFilters} className="mt-4">
              Clear All Filters
            </Button>
          )}
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-secondary">
              <thead className="bg-canvas border-b border-subtle text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3.5">User Profile</th>
                  <th className="px-5 py-3.5">Current Role</th>
                  <th className="px-5 py-3.5">Assign Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredUsers.map((row) => {
                  const self = row.id === me?.id;
                  const roleName = row.role?.name ?? 'Student';
                  const badgeStyle =
                    roleBadgeColor[roleName] ?? 'bg-elevated text-secondary border-theme';

                  return (
                    <tr key={row.id} className="hover:bg-elevated/50 transition-colors">
                      {/* Avatar & Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-xs font-bold text-brand uppercase border border-brand-border shadow-2xs shrink-0">
                            {row.username.slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <span className="block font-bold text-primary truncate">
                              {row.username}{' '}
                              {self && (
                                <span className="text-[11px] font-semibold text-brand ml-1">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-muted truncate">{row.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${badgeStyle}`}
                        >
                          {roleName === 'Admin' ? (
                            <Shield className="size-3.5" />
                          ) : (
                            <UserCheck className="size-3.5" />
                          )}
                          <span>{roleName}</span>
                        </span>
                      </td>

                      {/* Role Assignment Dropdown */}
                      <td className="px-5 py-3.5">
                        {self ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted italic">
                            <Shield className="size-3 text-muted" />
                            <span>Self role protected</span>
                          </span>
                        ) : (
                          <select
                            disabled={busyId === row.id}
                            value={row.role?.id ?? ''}
                            onChange={(e) => void changeRole(row.id, Number(e.target.value))}
                            className="rounded-lg border border-theme bg-canvas px-3 py-1.5 text-xs font-semibold text-primary outline-none transition focus:border-active focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            {availableRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Account Status Badge */}
                      <td className="px-5 py-3.5">
                        {busyId === row.id ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand animate-pulse bg-brand-subtle px-2.5 py-1 rounded-md border border-brand-border">
                            <span className="size-1.5 rounded-full bg-brand animate-ping" />
                            <span>Updating...</span>
                          </span>
                        ) : successId === row.id ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                            <span>Saved!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions Column (Delete User) */}
                      <td className="px-5 py-3.5 text-right">
                        {!self ? (
                          <button
                            type="button"
                            onClick={() => setDeletingUser({ id: row.id, username: row.username })}
                            disabled={deleteBusy && deletingUser?.id === row.id}
                            title="Delete User Account"
                            className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SweetAlert Delete User Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        title="Delete User Account?"
        message={`Are you sure you want to permanently delete user "${deletingUser?.username}"? All associated student enrollments and course records for this user will be removed.`}
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        loading={deleteBusy}
        onConfirm={confirmDeleteUser}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
};

export default function UserManagementPage() {
  return (
    <RequireAuth roles={['Admin']}>
      <UserManagementStudio />
    </RequireAuth>
  );
}
