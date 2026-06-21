"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssignableRole,
  TeamAssignmentRecord,
  TeamCaseOption,
  TeamUserOption,
} from "@/models/team-assignment.model";
import ManageTeamModal from "./ManageTeamModal";
import Pagination from "@/components/ui/Pagination";

const roles: AssignableRole[] = [
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

const PAGE_SIZE = 10;

export default function TeamAssignmentsClient() {
  const [assignments, setAssignments] = useState<TeamAssignmentRecord[]>([]);
  const [cases, setCases] = useState<TeamCaseOption[]>([]);
  const [users, setUsers] = useState<TeamUserOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TeamCaseOption | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadData() {
    setLoading(true);

    const res = await fetch("/api/admin/team-assignments", {
      cache: "no-store",
    });

    const data = await res.json();

    if (res.ok) {
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      setCases(Array.isArray(data.cases) ? data.cases : []);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setActionError("");
    } else {
      setAssignments([]);
      setCases([]);
      setUsers([]);
      setActionError(data.message || "Failed to load team assignments.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateManageModal() {
    setSelectedCase(null);
    setModalOpen(true);
  }

  function openCaseManageModal(caseItem: TeamCaseOption) {
    setSelectedCase(caseItem);
    setModalOpen(true);
  }

  const caseCards = useMemo(() => {
    return cases.map((caseItem) => {
      const team = assignments.filter((item) => item.case_id === caseItem.id);

      return {
        ...caseItem,
        team,
      };
    });
  }, [cases, assignments]);

  const filteredCaseCards = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return caseCards.filter((caseItem) => {
      const teamText = caseItem.team
        .map((member) => `${member.full_name} ${member.username} ${member.role}`)
        .join(" ");

      const text =
        `${caseItem.case_code} ${caseItem.title} ${teamText}`.toLowerCase();

      return text.includes(keyword);
    });
  }, [caseCards, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredCaseCards.length / PAGE_SIZE);

  const paginatedCaseCards = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCaseCards.slice(start, start + PAGE_SIZE);
  }, [filteredCaseCards, currentPage]);

  const assignedCases = caseCards.filter((item) => item.team.length > 0).length;
  const unassignedCases = caseCards.filter((item) => item.team.length === 0).length;

  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Case Access</p>
          <p className="mt-1 text-sm text-slate-500">
            View and manage the complete role-based team for each case.
          </p>
        </div>

        <button
          onClick={openCreateManageModal}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ➕ Create / Manage Team
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Cases" value={cases.length} color="text-slate-950" />
        <StatCard label="Assigned Cases" value={assignedCases} color="text-blue-600" />
        <StatCard label="Unassigned Cases" value={unassignedCases} color="text-amber-600" />
        <StatCard label="Team Members" value={assignments.length} color="text-emerald-600" />
      </div>

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="glass-card rounded-2xl p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case code, case title, member, role..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
            Loading team assignments...
          </div>
        )}

        {!loading &&
          paginatedCaseCards.map((caseItem) => (
            <div
              key={caseItem.id}
              className="glass-card rounded-3xl p-5 transition hover:shadow-xl hover:shadow-slate-200/70"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-950">
                      {caseItem.case_code}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        caseItem.team.length > 0
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {caseItem.team.length > 0 ? "Team Assigned" : "No Team Yet"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {caseItem.title}
                  </p>
                </div>

                <button
                  onClick={() => openCaseManageModal(caseItem)}
                  className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  ⚙️ Manage Team
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {roles.map((role) => {
                  const members = caseItem.team.filter(
                    (member) => member.role === role
                  );

                  return (
                    <div
                      key={role}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {role}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${roleClass(
                            role
                          )}`}
                        >
                          {members.length}
                        </span>
                      </div>

                      {members.length === 0 ? (
                        <p className="text-sm text-slate-400">No member</p>
                      ) : (
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                            >
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {member.full_name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                @{member.username}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {!loading && filteredCaseCards.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
            No cases found.
          </div>
        )}

        {!loading && filteredCaseCards.length > 0 && (
          <div className="glass-card overflow-hidden rounded-2xl">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ManageTeamModal
        open={modalOpen}
        caseOption={selectedCase}
        cases={cases}
        existingAssignments={
          selectedCase
            ? assignments.filter((item) => item.case_id === selectedCase.id)
            : []
        }
        allAssignments={assignments}
        users={users}
        onClose={() => {
          setModalOpen(false);
          setSelectedCase(null);
        }}
        onSaved={loadData}
      />
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