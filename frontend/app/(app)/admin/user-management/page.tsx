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
import { Alert, Empty } from '@/components/ui';
import { UserManagementSkeleton } from '@/components/page-skeletons';
import { ConfirmModal } from '@/components/confirm-modal';

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Content Manager': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Instructor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const VALID_ROLES = ['Admin', 'Instructor', 'Content Manager', 'Student'];

const UserManagement = () => {
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
          User Management
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

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-muted font-medium px-1">
        <span>
          Showing <strong>{filteredUsers.length}</strong> of {rows.length} platform users
        </span>
      </div>

      {/* User Management Data Table */}
      {filteredUsers.length === 0 ? (
        <Empty>
          <p className="text-base font-bold text-primary">No users found</p>
          <p className="text-xs text-muted mt-1">
            {hasActiveFilters
              ? 'No users match your filter criteria. Try resetting the search keyword or role filter.'
              : 'There are no user accounts in the platform yet.'}
          </p>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="border-b border-theme bg-white dark:bg-slate-800/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Joined Platform</th>
                  <th className="py-3.5 px-4 text-right">Assign Role / Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-subtle">
                {filteredUsers.map((user) => {
                  const roleName = user.role?.name ?? 'Student';
                  const isCurrentLoggedUser = me?.id === user.id;
                  const isUserBusy = busyId === user.id;
                  const isUpdated = successId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-elevated/30 transition-colors group"
                    >
                      {/* User Identity Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-xs font-bold text-brand uppercase border border-brand-border">
                            {user.username.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{user.username}</span>
                              {isCurrentLoggedUser && (
                                <span className="rounded bg-sky-500/15 text-sky-400 px-1.5 py-0.2 text-[10px] font-bold border border-sky-500/25">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill Column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            roleBadgeColor[roleName] ?? 'bg-muted/10 text-muted border-theme'
                          }`}
                        >
                          <Shield className="size-3" />
                          <span>{roleName}</span>
                        </span>
                      </td>

                      {/* Joined Date Column */}
                      <td className="py-3.5 px-4 text-muted text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>

                      {/* Role Assignment & Delete Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdated && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold animate-in fade-in duration-200">
                              <CheckCircle2 className="size-3.5" />
                              <span>Updated</span>
                            </span>
                          )}

                          {/* Role Selector Dropdown */}
                          <div className="relative inline-block">
                            <select
                              value={user.role?.id ?? ''}
                              disabled={isUserBusy || isCurrentLoggedUser}
                              onChange={(e) => changeRole(user.id, Number(e.target.value))}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer ${
                                isCurrentLoggedUser
                                  ? 'bg-canvas text-muted border-theme cursor-not-allowed opacity-60'
                                  : 'bg-surface text-primary border-theme hover:bg-elevated hover:border-active'
                              }`}
                              title={
                                isCurrentLoggedUser
                                  ? 'You cannot change your own role'
                                  : 'Change user role'
                              }
                            >
                              {availableRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Delete User Button */}
                          {!isCurrentLoggedUser && (
                            <button
                              type="button"
                              onClick={() => setDeletingUser({ id: user.id, username: user.username })}
                              className="rounded-lg border border-theme bg-surface p-1.5 text-muted hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        title="Delete User Account?"
        message={`Are you sure you want to permanently delete user account "${deletingUser?.username}"? All enrollments, progress, and submissions associated with this user will also be removed.`}
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
      <UserManagement />
    </RequireAuth>
  );
}
