import { eq, and, like, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  schools,
  students,
  measures,
  studentMeasures,
  auditLog,
  reports,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Schools
export async function getSchools() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schools);
}

export async function getSchoolById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Students
export async function getStudents(filters?: {
  schoolId?: number;
  educationLevel?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];

  if (filters?.schoolId) {
    conditions.push(eq(students.schoolId, filters.schoolId));
  }
  if (filters?.educationLevel) {
    conditions.push(eq(students.educationLevel, filters.educationLevel as any));
  }
  if (filters?.search) {
    conditions.push(like(students.fullName, `%${filters.search}%`));
  }

  if (conditions.length === 0) {
    return db.select().from(students);
  }
  return db.select().from(students).where(and(...conditions));
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createStudent(data: typeof students.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(students).values(data);
  return result;
}

export async function updateStudent(id: number, data: Partial<typeof students.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(students).set(data).where(eq(students.id, id));
}

// Measures
export async function getMeasures(type?: string) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];

  if (type) {
    conditions.push(eq(measures.type, type as any));
  }

  if (conditions.length === 0) {
    return db.select().from(measures);
  }
  return db.select().from(measures).where(and(...conditions));
}

export async function getMeasureById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(measures).where(eq(measures.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Student Measures
export async function getStudentMeasures(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(studentMeasures)
    .where(eq(studentMeasures.studentId, studentId));
}

export async function createStudentMeasure(data: typeof studentMeasures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(studentMeasures).values(data);
}

export async function updateStudentMeasure(
  id: number,
  data: Partial<typeof studentMeasures.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(studentMeasures).set(data).where(eq(studentMeasures.id, id));
}

// Audit Log
export async function createAuditLog(data: typeof auditLog.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLog).values(data);
}

export async function getAuditLogs(filters?: { userId?: number; entity?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];

  if (filters?.userId) {
    conditions.push(eq(auditLog.userId, filters.userId));
  }
  if (filters?.entity) {
    conditions.push(eq(auditLog.entity, filters.entity));
  }

  const query = conditions.length > 0 
    ? db.select().from(auditLog).where(and(...conditions))
    : db.select().from(auditLog);

  return query.orderBy(desc(auditLog.createdAt)).limit(1000);
}

// Reports
export async function createReport(data: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reports).values(data);
}

export async function getReports(filters?: {
  studentId?: number;
  schoolId?: number;
  type?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let conditions: any[] = [];

  if (filters?.studentId) {
    conditions.push(eq(reports.studentId, filters.studentId));
  }
  if (filters?.schoolId) {
    conditions.push(eq(reports.schoolId, filters.schoolId));
  }
  if (filters?.type) {
    conditions.push(eq(reports.type, filters.type as any));
  }

  const query = conditions.length > 0
    ? db.select().from(reports).where(and(...conditions))
    : db.select().from(reports);

  return query.orderBy(desc(reports.createdAt));
}

// Users Management
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createUser(data: typeof users.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(users).values(data);
}

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, id));
}
