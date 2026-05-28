import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
  json,
  boolean,
  decimal,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "professor", "tecnico"]).default("user").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Schools table - Escolas do agrupamento
 */
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

/**
 * Students table - Alunos com informações completas
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  birthDate: date("birthDate"),
  studentNumber: varchar("studentNumber", { length: 50 }).unique(),
  schoolId: int("schoolId").references(() => schools.id),
  className: varchar("className", { length: 100 }),
  educationLevel: mysqlEnum("educationLevel", [
    "Pré-Escolar",
    "1.º Ciclo",
    "2.º Ciclo",
    "3.º Ciclo",
    "Secundário",
  ]),
  specialNeed: text("specialNeed"),
  classTeacher: varchar("classTeacher", { length: 255 }),
  observations: text("observations"),
  evaluationAccommodations: text("evaluationAccommodations"),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Measures table - Medidas de suporte DL 54/2018
 */
export const measures = mysqlTable("measures", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["Universal", "Seletiva", "Adicional"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Measure = typeof measures.$inferSelect;
export type InsertMeasure = typeof measures.$inferInsert;

/**
 * Student Measures junction table - Associação entre alunos e medidas
 */
export const studentMeasures = mysqlTable("student_measures", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  measureId: int("measureId").notNull().references(() => measures.id, { onDelete: "cascade" }),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  notes: text("notes"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentMeasure = typeof studentMeasures.$inferSelect;
export type InsertStudentMeasure = typeof studentMeasures.$inferInsert;

/**
 * Audit Log table - Rastreabilidade completa de todas as alterações
 */
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity: varchar("entity", { length: 50 }).notNull(), // student, measure, user, school, etc
  entityId: int("entityId"),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * Reports table - Relatórios gerados
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["student", "school", "class", "measure", "period"]).notNull(),
  studentId: int("studentId").references(() => students.id),
  schoolId: int("schoolId").references(() => schools.id),
  className: varchar("className", { length: 100 }),
  measureType: mysqlEnum("measureType", ["Universal", "Seletiva", "Adicional"]),
  period: varchar("period", { length: 50 }),
  content: text("content"),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  generatedBy: int("generatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
