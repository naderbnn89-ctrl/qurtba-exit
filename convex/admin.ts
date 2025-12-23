import { mutation } from "./_generated/server";
import { v } from "convex/values";

// إضافة مدرس جديد (للمدير فقط)
export const addTeacher = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    arabicName: v.string(),
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحية المدير
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.sessionExpiry || admin.sessionExpiry < Date.now()) {
      throw new Error("غير مصرح لك بهذا الإجراء");
    }

    // التحقق من عدم وجود اسم المستخدم
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingTeacher) {
      throw new Error("اسم المستخدم موجود بالفعل");
    }

    // إضافة المدرس الجديد
    const teacherId = await ctx.db.insert("teachers", {
      username: args.username,
      password: args.password,
      arabicName: args.arabicName,
      role: "teacher",
    });

    return { success: true, teacherId };
  },
});
