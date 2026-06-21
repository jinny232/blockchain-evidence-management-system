import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { UserRole } from "@/models/user.model";

export type AdminUserRow = {
  userId: number;
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
};

type UserDbRow = RowDataPacket & {
  userId: number;
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  isActive: number | boolean;
};

export type CreateUserInput = {
  fullName: string;
  username: string;
  email: string | null;
  password: string;
  role: UserRole;
};

export type UpdateUserInput = {
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  active: boolean;
  password?: string;
};

export async function listUsers(): Promise<AdminUserRow[]> {
  const [rows] = await db.execute<UserDbRow[]>(
    `SELECT
      id AS userId,
      full_name AS fullName,
      username,
      email,
      role,
      active AS isActive
    FROM users
    ORDER BY id DESC`
  );

  return rows.map((user) => ({
    userId: user.userId,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.isActive),
  }));
}

export async function createUserByAdmin(input: CreateUserInput) {
  const [existing] = await db.execute<RowDataPacket[]>(
    `SELECT id FROM users
     WHERE username = ? OR email = ?
     LIMIT 1`,
    [input.username, input.email]
  );

  if (existing.length > 0) {
    throw new Error("Username or email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO users
      (full_name, username, email, password_hash, role, active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [input.fullName, input.username, input.email, passwordHash, input.role]
  );

  return result.insertId;
}

export async function updateUserByAdmin(userId: number, input: UpdateUserInput) {
  const [existing] = await db.execute<RowDataPacket[]>(
    `SELECT id FROM users
     WHERE (username = ? OR email = ?)
     AND id != ?
     LIMIT 1`,
    [input.username, input.email, userId]
  );

  if (existing.length > 0) {
    throw new Error("Username or email already exists.");
  }

  if (input.password && input.password.trim()) {
    const passwordHash = await bcrypt.hash(input.password, 10);

    await db.execute(
      `UPDATE users
       SET full_name = ?,
           username = ?,
           email = ?,
           password_hash = ?,
           role = ?,
           active = ?
       WHERE id = ?`,
      [
        input.fullName,
        input.username,
        input.email,
        passwordHash,
        input.role,
        input.active ? 1 : 0,
        userId,
      ]
    );

    return;
  }

  await db.execute(
    `UPDATE users
     SET full_name = ?,
         username = ?,
         email = ?,
         role = ?,
         active = ?
     WHERE id = ?`,
    [
      input.fullName,
      input.username,
      input.email,
      input.role,
      input.active ? 1 : 0,
      userId,
    ]
  );
}

export async function deleteUserByAdmin(userId: number) {
  await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);
}