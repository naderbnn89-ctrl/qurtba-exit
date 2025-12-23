import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// تسجيل الدخول المخصص
export const customSignIn = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // البحث في جدول المدرسين
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (teacher && teacher.password === args.password) {
      // تحديث وقت انتهاء الجلسة (30 ساعة)
      const sessionExpiry = Date.now() + (30 * 60 * 60 * 1000);
      await ctx.db.patch(teacher._id, { sessionExpiry });
      
      return {
        success: true,
        user: {
          id: teacher._id,
          username: teacher.username,
          arabicName: teacher.arabicName,
          role: teacher.role,
        },
      };
    }

    // البحث في جدول المدراء
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (admin && admin.password === args.password) {
      const sessionExpiry = Date.now() + (30 * 60 * 60 * 1000);
      await ctx.db.patch(admin._id, { sessionExpiry });
      
      return {
        success: true,
        user: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      };
    }

    return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  },
});

// التحقق من صحة الجلسة
export const validateSession = query({
  args: { userId: v.id("teachers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.sessionExpiry || user.sessionExpiry < Date.now()) {
      return null;
    }
    return user;
  },
});

// إنشاء الحسابات الأولية
export const initializeAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    // التحقق من وجود الحسابات
    const existingTeacher = await ctx.db.query("teachers").first();
    const existingAdmin = await ctx.db.query("admins").first();

    if (!existingTeacher) {
      // إنشاء حسابات المدرسين
      await ctx.db.insert("teachers", {
        username: "khaled",
        password: "Khaled@2025",
        arabicName: "أ. خالد",
        role: "teacher",
      });

      await ctx.db.insert("teachers", {
        username: "saleh",
        password: "Saleh@2025",
        arabicName: "أ. صالح",
        role: "teacher",
      });

      await ctx.db.insert("teachers", {
        username: "jaber",
        password: "Jaber@2025",
        arabicName: "أ. جابر",
        role: "teacher",
      });
    }

    if (!existingAdmin) {
      // إنشاء حساب المدير
      await ctx.db.insert("admins", {
        username: "admin111",
        password: "admin@999",
        role: "admin",
      });
    }

    return { success: true };
  },
});
