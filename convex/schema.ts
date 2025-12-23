import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول المدرسين
  teachers: defineTable({
    username: v.string(),
    password: v.string(),
    arabicName: v.string(),
    role: v.literal("teacher"),
    sessionExpiry: v.optional(v.number()),
  }).index("by_username", ["username"]),

  // جدول المدير
  admins: defineTable({
    username: v.string(),
    password: v.string(),
    role: v.literal("admin"),
    sessionExpiry: v.optional(v.number()),
  }).index("by_username", ["username"]),

  // جدول تصاريح الخروج
  exitPermissions: defineTable({
    studentName: v.string(),
    teacherUsername: v.string(),
    teacherArabicName: v.string(),
    timestamp: v.number(),
    date: v.string(),
    time: v.string(),
  })
    .index("by_teacher", ["teacherUsername"])
    .index("by_student", ["studentName"])
    .index("by_date", ["date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
