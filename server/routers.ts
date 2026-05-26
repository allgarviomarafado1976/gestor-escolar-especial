import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Schools
  schools: router({
    list: protectedProcedure.query(async () => {
      return db.getSchools();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getSchoolById(input.id);
    }),
  }),

  // Students
  students: router({
    list: protectedProcedure
      .input(
        z.object({
          schoolId: z.number().optional(),
          educationLevel: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getStudents(input);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getStudentById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          fullName: z.string(),
          birthDate: z.string().optional(),
          studentNumber: z.string().optional(),
          schoolId: z.number().optional(),
          className: z.string().optional(),
          educationLevel: z.string().optional(),
          specialNeed: z.string().optional(),
          classTeacher: z.string().optional(),
          observations: z.string().optional(),
          evaluationAccommodations: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createStudent({
          ...input,
          birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
          educationLevel: input.educationLevel as any,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });

        // Log audit
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entity: "student",
          details: input,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          fullName: z.string().optional(),
          birthDate: z.string().optional(),
          studentNumber: z.string().optional(),
          schoolId: z.number().optional(),
          className: z.string().optional(),
          educationLevel: z.string().optional(),
          specialNeed: z.string().optional(),
          classTeacher: z.string().optional(),
          observations: z.string().optional(),
          evaluationAccommodations: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const result = await db.updateStudent(id, {
          ...updateData,
          birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
          educationLevel: updateData.educationLevel as any,
          updatedBy: ctx.user.id,
        });

        // Log audit
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entity: "student",
          entityId: id,
          details: updateData,
        });

        return result;
      }),
  }),

  // Measures
  measures: router({
    list: protectedProcedure
      .input(z.object({ type: z.string().optional() }))
      .query(async ({ input }) => {
        return db.getMeasures(input.type);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getMeasureById(input.id);
    }),
  }),

  // Student Measures
  studentMeasures: router({
    list: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return db.getStudentMeasures(input.studentId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          measureId: z.number(),
          startDate: z.string(),
          endDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createStudentMeasure({
          studentId: input.studentId,
          measureId: input.measureId,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        // Log audit
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entity: "student_measure",
          details: input,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          endDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const result = await db.updateStudentMeasure(id, {
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          notes: updateData.notes,
        });

        // Log audit
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entity: "student_measure",
          entityId: id,
          details: updateData,
        });

        return result;
      }),
  }),

  // Audit Log
  auditLog: router({
    list: adminProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          entity: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getAuditLogs(input);
      }),
  }),

  // Users Management
  users: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getUserById(input.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(["user", "admin", "professor", "tecnico"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const openId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const result = await db.createUser({
          openId,
          name: input.name,
          email: input.email,
          role: input.role,
          active: true,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entity: "user",
          details: input,
        });

        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().optional(),
          role: z.enum(["user", "admin", "professor", "tecnico"]).optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const result = await db.updateUser(id, updateData);

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entity: "user",
          entityId: id,
          details: updateData,
        });

        return result;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateUser(input.id, { active: false });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entity: "user",
          entityId: input.id,
          details: { id: input.id },
        });

        return result;
      }),
  }),

  // Reports
  reports: router({
    list: protectedProcedure
      .input(
        z.object({
          studentId: z.number().optional(),
          schoolId: z.number().optional(),
          type: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getReports(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          type: z.enum(["student", "school", "class", "measure", "period"]),
          studentId: z.number().optional(),
          schoolId: z.number().optional(),
          className: z.string().optional(),
          measureType: z.enum(["Universal", "Seletiva", "Adicional"]).optional(),
          period: z.string().optional(),
          content: z.string().optional(),
          pdfUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createReport({
          ...input,
          generatedBy: ctx.user.id,
        });

        // Log audit
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entity: "report",
          details: input,
        });

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
