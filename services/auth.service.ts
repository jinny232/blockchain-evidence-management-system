import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken, getRoleRedirectPath } from "@/lib/session";
import type { UserRole } from "@/models/user.model";

export type AuthUser = {
  id: number;
  fullName: string;
  username: string;
  email: string | null;
  passwordHash: string;
  role: UserRole;
  active: boolean | number;
};

export async function findUserByUsername(username: string) {
  const [rows] = await db.execute(
    `SELECT
      id,
      full_name AS fullName,
      username,
      email,
      password_hash AS passwordHash,
      role,
      active
    FROM users
    WHERE username = ?
    LIMIT 1`,
    [username]
  );

  const users = rows as AuthUser[];
  return users[0] ?? null;
}

export async function verifyUserPassword(
  plainPassword: string,
  passwordHash: string
) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function loginUser(username: string, password: string) {
  const user = await findUserByUsername(username);

  if (!user || !user.active) {
    return null;
  }

  const passwordOk = await verifyUserPassword(password, user.passwordHash);

  if (!passwordOk) {
    return null;
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  });

  return {
    token,
    redirectTo: getRoleRedirectPath(user.role),
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}