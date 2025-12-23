import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  arabicName?: string;
  role: "teacher" | "admin";
}

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("send");

  const sendExitPermission = useMutation(api.permissions.sendExitPermission);
  const teacherPermissions = useQuery(api.permissions.getTeacherPermissions, {
    teacherUsername: user.username,
  });

  const handleSendPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error("يرجى إدخال اسم الطالب");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendExitPermission({
        studentName: studentName.trim(),
        teacherUsername: user.username,
      });

      if (result.success) {
        // فتح WhatsApp
        window.open(result.whatsappUrl, '_blank');
        toast.success(`تم إرسال التصريح بنجاح - ${result.date} ${result.time}`);
        setStudentName("");
      }
    } catch (error) {
      toast.error("حدث خطأ في إرسال التصريح");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-16">
      {/* الهيدر */}
      <header className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100 animate-slide-down">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <img 
              src="https://i.top4top.io/p_3644t4psm1.png" 
              alt="الشعار"
              className="w-12 h-12 animate-pulse"
            />
            <div className="text-right">
              <h1 className="text-2xl font-bold text-blue-800">مرحباً {user.arabicName}</h1>
              <p className="text-blue-600">نظام إدارة تصاريح الخروج</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* التبويبات */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 animate-slide-up">
        <div className="flex border-b border-blue-100">
          <button
            onClick={() => setActiveTab("send")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === "send" ? "bg-blue-600 text-white rounded-tl-2xl" : "text-blue-600 hover:bg-blue-50"}`}
          >
            إرسال تصريح
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === "history" ? "bg-blue-600 text-white rounded-tr-2xl" : "text-blue-600 hover:bg-blue-50"}`}
          >
            السجل
          </button>
        </div>

        <div className="p-6">
          {activeTab === "send" ? (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-blue-800 mb-6 text-center">
                إرسال تصريح خروج جديد
              </h2>

              {/* معلومات تلقائية */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200 animate-slide-up">
                <h3 className="font-bold text-blue-800 mb-3 text-center">معلومات التصريح</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-blue-600 font-semibold">المعتمد: </span>
                    <span className="text-blue-800">{user.arabicName}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">التاريخ والوقت: </span>
                    <span className="text-blue-800">تلقائي عند الإرسال</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendPermission} className="space-y-6">
                <div className="animate-slide-up animation-delay-200">
                  <label className="block text-blue-800 font-semibold mb-3 text-right text-lg">
                    اسم الطالب كاملاً
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right text-lg bg-white/80 hover:bg-white"
                    placeholder="مثال: نادر خالد القحطاني"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animation-delay-400"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                      جاري الإرسال...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-xl ml-2">📱</span>
                      إرسال تصريح للحارس
                    </div>
                  )}
                </button>
              </form>

              {/* ملاحظات */}
              <div className="mt-8 bg-yellow-50 rounded-xl p-4 border border-yellow-200 animate-slide-up animation-delay-600">
                <h4 className="font-bold text-yellow-800 mb-2 text-center">ملاحظات مهمة</h4>
                <ul className="text-yellow-700 text-sm space-y-1 text-right">
                  <li>• التاريخ والوقت يتم إدراجهما تلقائياً</li>
                  <li>• الرسالة ترسل مباشرة للحارس عبر WhatsApp</li>
                  <li>• لا يمكن تعديل محتوى الرسالة</li>
                  <li>• تأكد من كتابة اسم الطالب كاملاً وصحيحاً</li>
                </ul>
              </div>
            </div> {/* تم إغلاق div بشكل صحيح هنا */}
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-blue-800 mb-6 text-center">
                سجل التصاريح
              </h2>
            </div>
          )}

          {teacherPermissions?.studentStats && teacherPermissions.studentStats.length > 0 ? (
            <div className="space-y-4">
              {teacherPermissions.studentStats.map((student, index) => (
                <div
                  key={student.studentName}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <h3 className="font-bold text-blue-800 text-lg">
                        {student.studentName}
                      </h3>
                      <p className="text-blue-600">
                        آخر خروج: {new Date(student.lastExit).toLocaleString("ar-SA")}
                      </p>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
                      {student.count} مرة
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-blue-600 text-lg">لا توجد تصاريح مرسلة بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
