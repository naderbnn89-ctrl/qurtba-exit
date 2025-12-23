import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// إرسال تصريح خروج
export const sendExitPermission = mutation({
  args: {
    studentName: v.string(),
    teacherUsername: v.string(),
  },
  handler: async (ctx, args) => {
    // الحصول على بيانات المدرس
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_username", (q) => q.eq("username", args.teacherUsername))
      .first();

    if (!teacher) {
      throw new Error("المدرس غير موجود");
    }

    // التحقق من صحة الجلسة
    if (!teacher.sessionExpiry || teacher.sessionExpiry < Date.now()) {
      throw new Error("انتهت صلاحية الجلسة");
    }

    // الحصول على التاريخ والوقت الحالي بالتوقيت السعودي
    const now = new Date();
    const saudiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    
    // تنسيق التاريخ (يوم-شهر-سنة)
    const day = saudiTime.getDate().toString().padStart(2, '0');
    const month = (saudiTime.getMonth() + 1).toString().padStart(2, '0');
    const year = saudiTime.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // تنسيق الوقت (ساعة:دقيقة ص/م)
    const hours = saudiTime.getHours();
    const minutes = saudiTime.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const formattedTime = `${displayHours}:${minutes} ${period}`;

    // حفظ التصريح في قاعدة البيانات
    const permissionId = await ctx.db.insert("exitPermissions", {
      studentName: args.studentName,
      teacherUsername: args.teacherUsername,
      teacherArabicName: teacher.arabicName,
      timestamp: Date.now(),
      date: formattedDate,
      time: formattedTime,
    });

    // إنشاء رسالة WhatsApp بالتنسيق المطلوب
    const message = `📌 سماح خروج طالب

نفيدكم بالسماح بخروج الطالب المذكور أدناه من
ثانوية قرطبة الأهلية:

اسم الطالب: ${args.studentName}
التاريخ: ${formattedDate}
الوقت: ${formattedTime}

وذلك بعلم واعتماد إدارة المدرسة.

المعتمد:
بواسطة ${teacher.arabicName}
ثانوية قرطبة الأهلية`;

    const phoneNumber = "966551141804";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return {
      success: true,
      permissionId,
      whatsappUrl,
      message,
      date: formattedDate,
      time: formattedTime,
    };
  },
});

// الحصول على تصاريح المدرس
export const getTeacherPermissions = query({
  args: { teacherUsername: v.string() },
  handler: async (ctx, args) => {
    const permissions = await ctx.db
      .query("exitPermissions")
      .withIndex("by_teacher", (q) => q.eq("teacherUsername", args.teacherUsername))
      .order("desc")
      .collect();

    // تجميع البيانات حسب الطالب
    const studentStats = new Map();
    
    permissions.forEach(permission => {
      const existing = studentStats.get(permission.studentName);
      if (existing) {
        existing.count++;
        existing.lastExit = permission.timestamp > existing.lastExit ? permission.timestamp : existing.lastExit;
      } else {
        studentStats.set(permission.studentName, {
          studentName: permission.studentName,
          count: 1,
          lastExit: permission.timestamp,
          firstExit: permission.timestamp,
        });
      }
    });

    return {
      permissions,
      studentStats: Array.from(studentStats.values()).sort((a, b) => b.lastExit - a.lastExit),
    };
  },
});

// الحصول على جميع التصاريح (للمدير)
export const getAllPermissions = query({
  args: {},
  handler: async (ctx) => {
    const permissions = await ctx.db
      .query("exitPermissions")
      .order("desc")
      .collect();

    // إحصائيات حسب المدرس
    const teacherStats = new Map();
    
    permissions.forEach(permission => {
      const existing = teacherStats.get(permission.teacherUsername);
      if (existing) {
        existing.count++;
      } else {
        teacherStats.set(permission.teacherUsername, {
          teacherUsername: permission.teacherUsername,
          teacherArabicName: permission.teacherArabicName,
          count: 1,
        });
      }
    });

    return {
      permissions,
      teacherStats: Array.from(teacherStats.values()).sort((a, b) => b.count - a.count),
      totalPermissions: permissions.length,
    };
  },
});
