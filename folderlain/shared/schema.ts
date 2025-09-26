import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nama: text("nama").notNull(),
  kelas: text("kelas").notNull(),
  telepon: text("telepon").notNull().unique(),
  instagram: text("instagram").notNull().unique(),
  sekolah: text("sekolah").notNull(),
  kota: text("kota").notNull(),
  provinsi: text("provinsi").notNull(),
  cabang: text("cabang").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index("phone_idx").on(table.telepon),
  instagramIdx: index("instagram_idx").on(table.instagram),
  nameSchoolDateIdx: index("name_school_date_idx").on(table.nama, table.sekolah, table.createdAt),
}));

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  lastLogin: timestamp("last_login"),
  isActive: text("is_active").default("true").notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: text("admin_id").references(() => adminUsers.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  ipAddress: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  lastLogin: true,
  isActive: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
