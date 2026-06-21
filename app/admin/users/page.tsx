import UsersClient from "@/components/admin/UsersClient";
import { listUsers, type AdminUserRow } from "@/services/user.service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: AdminUserRow[] = [];
  let loadError = "";

  try {
    users = await listUsers();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load users.";
  }

  return <UsersClient initialUsers={users} loadError={loadError} />;
}