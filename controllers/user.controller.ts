import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import {
  createUserByAdmin,
  deleteUserByAdmin,
  listUsers,
  updateUserByAdmin,
} from "@/services/user.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";

const roleSchema = z.enum([
  "Admin",
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
]);

const createUserSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email().nullable().optional(),
  password: z.string().min(6),
  role: roleSchema,
});

const updateUserSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email().nullable().optional(),
  password: z.string().optional(),
  role: roleSchema,
  active: z.boolean(),
});

export async function getUsersController(request: NextRequest) {
  const auth = await requireRole(request, "Admin");

  if (!auth.ok) return auth.response;

  try {
    const users = await listUsers();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load users.",
      },
      { status: 500 }
    );
  }
}

export async function createUserController(request: NextRequest) {
  const auth = await requireRole(request, "Admin");

  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid user data." },
        { status: 400 }
      );
    }

    await createUserByAdmin({
      fullName: parsed.data.fullName,
      username: parsed.data.username,
      email: parsed.data.email ?? null,
      password: parsed.data.password,
      role: parsed.data.role,
    });

    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Created user",
      entity_type: "User",
      entity_id: parsed.data.username,
      status: "Success",
      details: `Created user ${parsed.data.username} with role ${parsed.data.role}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Create user failed",
      entity_type: "User",
      status: "Failed",
      details: error instanceof Error ? error.message : "Create user failed.",
      ip_address: getRequestIp(request),
    });

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Create user failed.",
      },
      { status: 500 }
    );
  }
}

export async function updateUserController(
  request: NextRequest,
  userId: number
) {
  const auth = await requireRole(request, "Admin");

  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid update data." },
        { status: 400 }
      );
    }

    await updateUserByAdmin(userId, {
      fullName: parsed.data.fullName,
      username: parsed.data.username,
      email: parsed.data.email ?? null,
      password: parsed.data.password,
      role: parsed.data.role,
      active: parsed.data.active,
    });

    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Updated user",
      entity_type: "User",
      entity_id: String(userId),
      status: "Success",
      details: `Updated user ${parsed.data.username}. Role: ${
        parsed.data.role
      }, Active: ${parsed.data.active ? "Yes" : "No"}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Update user failed",
      entity_type: "User",
      entity_id: String(userId),
      status: "Failed",
      details: error instanceof Error ? error.message : "Update user failed.",
      ip_address: getRequestIp(request),
    });

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Update user failed.",
      },
      { status: 500 }
    );
  }
}

export async function deleteUserController(
  request: NextRequest,
  userId: number
) {
  const auth = await requireRole(request, "Admin");

  if (!auth.ok) return auth.response;

  try {
    await deleteUserByAdmin(userId);

    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Deleted user",
      entity_type: "User",
      entity_id: String(userId),
      status: "Success",
      details: `Deleted user ID ${userId}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    await recordAuditLog({
      actor_name: "Admin",
      actor_role: "Admin",
      action: "Delete user failed",
      entity_type: "User",
      entity_id: String(userId),
      status: "Failed",
      details: error instanceof Error ? error.message : "Delete user failed.",
      ip_address: getRequestIp(request),
    });

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Delete user failed.",
      },
      { status: 500 }
    );
  }
}