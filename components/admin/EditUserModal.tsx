"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UserRole } from "@/models/user.model";

const roles: UserRole[] = [
  "Admin",
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

type User = {
  userId: number;
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
};

type Props = {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditUserModal({ user, onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Investigator");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email || "");
    setPassword("");
    setRole(user.role);
    setActive(user.isActive);
    setError("");
  }, [user]);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          username,
          email: email.trim() ? email : null,
          password: password.trim() ? password : undefined,
          role,
          active,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update user.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

 return (
  <div className="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-md sm:items-center">
    <div className="my-6 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 text-slate-950 shadow-2xl shadow-slate-500/30 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
            <p className="text-sm font-semibold text-blue-600">User Access</p>
            <h2 className="mt-1 text-2xl font-bold">✏️ Update User</h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit account information and role.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="custom-scrollbar max-h-[calc(92vh-170px)] space-y-4 overflow-y-auto px-6 py-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              placeholder="Full name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              placeholder="Username"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email optional"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              New Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              type="password"
              placeholder="Leave empty to keep current password"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Role
            </label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className={inputClass}
            >
              {roles.map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Active account
              </p>
              <p className="text-xs text-slate-500">
                Inactive users cannot access the system.
              </p>
            </div>

            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-5 w-5 accent-blue-600"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white/90 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const form = document.querySelector("form");
              form?.requestSubmit();
            }}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}