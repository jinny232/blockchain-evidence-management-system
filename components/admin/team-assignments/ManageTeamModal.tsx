"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssignableRole,
  TeamAssignmentRecord,
  TeamCaseOption,
  TeamUserOption,
} from "@/models/team-assignment.model";

interface Props {
  open: boolean;
  caseOption: TeamCaseOption | null;
  cases: TeamCaseOption[];
  existingAssignments: TeamAssignmentRecord[];
  allAssignments: TeamAssignmentRecord[];
  users: TeamUserOption[];
  onClose: () => void;
  onSaved: () => void;
}

const roles: AssignableRole[] = [
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

export default function ManageTeamModal({
  open,
  caseOption,
  cases,
  existingAssignments,
  allAssignments,
  users,
  onClose,
  onSaved,
}: Props) {
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [role, setRole] = useState<AssignableRole>("Investigator");
  const [search, setSearch] = useState("");
  const [selectedUsersByRole, setSelectedUsersByRole] = useState<
    Record<AssignableRole, number[]>
  >({
    Investigator: [],
    "Lab Technician": [],
    Lawyer: [],
    Judge: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCase = useMemo(() => {
    if (caseOption) return caseOption;
    return cases.find((item) => String(item.id) === selectedCaseId) || null;
  }, [caseOption, cases, selectedCaseId]);

  const activeAssignments = useMemo(() => {
    if (!selectedCase) return [];

    if (caseOption) return existingAssignments;

    return allAssignments.filter((item) => item.case_id === selectedCase.id);
  }, [selectedCase, caseOption, existingAssignments, allAssignments]);

  useEffect(() => {
    if (!open) return;

    setSelectedCaseId(caseOption ? String(caseOption.id) : "");
    setRole("Investigator");
    setSearch("");
    setError("");

    const nextSelected: Record<AssignableRole, number[]> = {
      Investigator: [],
      "Lab Technician": [],
      Lawyer: [],
      Judge: [],
    };

    if (caseOption) {
      existingAssignments.forEach((item) => {
        if (roles.includes(item.role)) {
          nextSelected[item.role].push(item.user_id);
        }
      });
    }

    setSelectedUsersByRole(nextSelected);
  }, [open, caseOption, existingAssignments]);

  useEffect(() => {
    if (!open || !selectedCase || caseOption) return;

    const nextSelected: Record<AssignableRole, number[]> = {
      Investigator: [],
      "Lab Technician": [],
      Lawyer: [],
      Judge: [],
    };

    const currentAssignments = allAssignments.filter(
      (item) => item.case_id === selectedCase.id
    );

    currentAssignments.forEach((item) => {
      if (roles.includes(item.role)) {
        nextSelected[item.role].push(item.user_id);
      }
    });

    setSelectedUsersByRole(nextSelected);
  }, [open, selectedCase, caseOption, allAssignments]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesRole = user.role === role;

      const text = `${user.full_name} ${user.username} ${
        user.email ?? ""
      }`.toLowerCase();

      const matchesSearch = text.includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [users, role, search]);

  const selectedCount = roles.reduce(
    (total, roleName) => total + selectedUsersByRole[roleName].length,
    0
  );

  const selectedPreview = useMemo(() => {
    return roles.flatMap((roleName) =>
      selectedUsersByRole[roleName].map((userId) => {
        const user = users.find((item) => item.id === userId);

        return {
          userId,
          role: roleName,
          name: user?.full_name || "Unknown user",
          username: user?.username || "",
        };
      })
    );
  }, [selectedUsersByRole, users]);

  if (!open) return null;

  function toggleUser(userId: number) {
    setSelectedUsersByRole((prev) => {
      const current = prev[role];

      const next = current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId];

      return {
        ...prev,
        [role]: next,
      };
    });
  }

  function resetAndClose() {
    setSelectedCaseId("");
    setRole("Investigator");
    setSearch("");
    setSelectedUsersByRole({
      Investigator: [],
      "Lab Technician": [],
      Lawyer: [],
      Judge: [],
    });
    setError("");
    onClose();
  }

  async function saveTeam(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedCase) {
      setError("Please select a case.");
      return;
    }

    const assignments = roles.flatMap((roleName) =>
      selectedUsersByRole[roleName].map((userId) => ({
        user_id: userId,
        role: roleName,
      }))
    );

    if (assignments.length === 0) {
      const ok = confirm(
        "No users selected. Do you want to clear this case team?"
      );

      if (!ok) return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/team-assignments/case/${selectedCase.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignments,
            assigned_by: "Admin",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update team.");
        return;
      }

      onSaved();
      resetAndClose();
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
      <form
        onSubmit={saveTeam}
        className="my-6 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 text-slate-950 shadow-2xl shadow-slate-500/30 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">Case Team</p>
            <h2 className="mt-1 text-2xl font-bold">
              ⚙️ {selectedCase ? `Manage Team — ${selectedCase.case_code}` : "Create / Manage Team"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedCase
                ? selectedCase.title
                : "Select a case, filter users by role, and save the team."}
            </p>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {!caseOption && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Case
              </label>

              <select
                value={selectedCaseId}
                onChange={(e) => {
                  setSelectedCaseId(e.target.value);
                  setSearch("");
                }}
                className={inputClass}
                required
              >
                <option value="">Select case</option>

                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.case_code} — {item.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedCase && activeAssignments.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              This case already has {activeAssignments.length} team member
              {activeAssignments.length > 1 ? "s" : ""}. Saving will update the
              full team.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Filter by Role
              </label>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as AssignableRole);
                  setSearch("");
                }}
                className={inputClass}
              >
                {roles.map((roleName) => (
                  <option key={roleName}>{roleName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Search User
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, username, email..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{role} Users</h3>
                <p className="text-xs text-slate-500">
                  {filteredUsers.length} users found
                </p>
              </div>

              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClass(role)}`}>
                {selectedUsersByRole[role].length} selected
              </span>
            </div>

            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                  No users found for this role/search.
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const checked = selectedUsersByRole[role].includes(user.id);

                  return (
                    <label
                      key={user.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition ${
                        checked
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(user.id)}
                          className="h-4 w-4 accent-blue-600"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {user.full_name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            @{user.username} {user.email ? `• ${user.email}` : ""}
                          </p>
                        </div>
                      </div>

                      {checked && (
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">
              Current Selected Team
            </h3>

            {selectedPreview.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                No members selected.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPreview.map((item) => (
                  <span
                    key={`${item.role}-${item.userId}`}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                      item.role
                    )}`}
                  >
                    {item.name} • {item.role}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white/90 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Selected members:{" "}
            <span className="font-semibold text-blue-600">{selectedCount}</span>
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Team"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function roleClass(role: AssignableRole) {
  if (role === "Investigator") {
    return "border border-blue-300 bg-blue-50 text-blue-700";
  }

  if (role === "Lab Technician") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (role === "Lawyer") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (role === "Judge") {
    return "border border-purple-300 bg-purple-50 text-purple-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}