"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CreateUserModal from "@/components/admin/CreateUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import Pagination from "@/components/ui/Pagination";
import type { UserRole } from "@/models/user.model";

type AdminUserRow = {
  userId: number;
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
};

type Props = {
  initialUsers: AdminUserRow[];
  loadError: string;
};

const PAGE_SIZE = 10;

const roles: Array<UserRole | "All"> = [
  "All",
  "Admin",
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

export default function UsersClient({ initialUsers, loadError }: Props) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return initialUsers.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        (user.email || "").toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && user.isActive) ||
        (statusFilter === "Inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [initialUsers, search, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  async function handleDelete(user: AdminUserRow) {
    const confirmed = window.confirm(
      `Delete user "${user.username}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionError("");

    try {
      const response = await fetch(`/api/admin/users/${user.userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setActionError(data.message || "Failed to delete user.");
        return;
      }

      router.refresh();
    } catch {
      setActionError("Could not connect to server.");
    }
  }

  const totalUsers = initialUsers.length;
  const activeUsers = initialUsers.filter((user) => user.isActive).length;
  const inactiveUsers = initialUsers.filter((user) => !user.isActive).length;

  return (
    <div className="space-y-6 text-slate-950">
      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => router.refresh()}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Control</p>
    
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, create, update, and delete system users.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ➕ Create User
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={totalUsers} color="text-slate-950" />
        <StatCard label="Active Users" value={activeUsers} color="text-emerald-600" />
        <StatCard label="Inactive Users" value={inactiveUsers} color="text-red-600" />
      </div>

      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Could not load users: {loadError}
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, username, email..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as UserRole | "All")
            }
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "All" ? "All roles" : role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "All" | "Active" | "Inactive"
              )
            }
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="All">All status</option>
            <option value="Active">Active only</option>
            <option value="Inactive">Inactive only</option>
          </select>
        </div>
      </div>

      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/80 px-5 py-4 text-sm font-semibold text-slate-500">
          <span>Name</span>
          <span>Username</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {paginatedUsers.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No users found.
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user.userId}
              className="grid grid-cols-6 items-center border-b border-slate-200 px-5 py-4 text-sm transition last:border-0 hover:bg-blue-50/60"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>

                <span>
                  <span className="block font-semibold text-slate-950">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-slate-500">
                    ID #{user.userId}
                  </span>
                </span>
              </span>

              <span className="text-slate-600">{user.username}</span>
              <span className="truncate text-slate-600">{user.email || "-"}</span>

              <span>
                <span className={roleBadgeClass(user.role)}>{user.role}</span>
              </span>

              <span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border border-red-300 bg-red-50 text-red-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </span>

              <span className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(user)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  🗑 Delete
                </button>
              </span>
            </div>
          ))
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function roleBadgeClass(role: string) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold";

  if (role === "Admin") return `${base} border border-purple-300 bg-purple-50 text-purple-700`;
  if (role === "Investigator") return `${base} border border-blue-300 bg-blue-50 text-blue-700`;
  if (role === "Lab Technician") return `${base} border border-emerald-300 bg-emerald-50 text-emerald-700`;
  if (role === "Lawyer") return `${base} border border-amber-300 bg-amber-50 text-amber-700`;
  if (role === "Judge") return `${base} border border-red-300 bg-red-50 text-red-700`;

  return `${base} border border-slate-300 bg-slate-50 text-slate-600`;
}