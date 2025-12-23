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

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("stats");
  const [newTeacher, setNewTeacher] = useState({
    username: "",
    password: "",
    arabicName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const allPermissions = useQuery(api.permissions.getAllPermissions);
  const addTeacher = useMutation(api.admin.addTeacher);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.username || !newTeacher.password || !newTeacher.arabicName) {
      toast.error("يرجى إدخال جميع البيانات");
      return;
    }

    setIsLoading(true);
    try {
      await addTeacher({
        ...newTeacher,
        adminUsername: user.username,
      });
      toast.success("تم إضافة المدرس بنجاح");
      setNewTeacher({ username: "", password: "", arabicName: "" });
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في إضافة المدرس");
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
              <h1 className="text-2xl font-bold text-blue-800">لوحة تحكم المدير</h1>
              <p className="text-blue-600">إدارة النظام والإحصائيات</p>
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
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
              activeTab === "stats"
                ? "bg-blue-600 text-white rounded-tl-2xl"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            الإحصائيات
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
              activeTab === "add"
                ? "bg-blue-600 text-white rounded-tr-2xl"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            إضافة مدرس
          </button>
        </div>

        <div className="p-6">
          {activeTab === "stats" ? (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-blue-800 mb-6 text-center">
                إحصائيات النظام
              </h2>

              {/* إحصائيات عامة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center animate-slide-up">
                  <div className="text-3xl font-bold">{allPermissions?.totalPermissions || 0}</div>
                  <div className="text-blue-100">إجمالي التصاريح</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl text-center animate-slide-up animation-delay-200">
                  <div className="text-3xl font-bold">{allPermissions?.teacherStats?.length || 0}</div>
                  <div className="text-green-100">المدرسين النشطين</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center animate-slide-up animation-delay-400">
                  <div className="text-3xl font-bold">
                    {allPermissions?.permissions?.filter(p => 
                      new Date(p.timestamp).toDateString() === new Date().toDateString()
                    ).length || 0}
                  </div>
                  <div className="text-purple-100">تصاريح اليوم</div>
                </div>
              </div>

              {/* إحصائيات المدرسين */}
              <h3 className="text-lg font-bold text-blue-800 mb-4">إحصائيات المدرسين</h3>
              {allPermissions?.teacherStats && allPermissions.teacherStats.length > 0 ? (
                <div className="space-y-4">
                  {allPermissions.teacherStats.map((teacher, index) => (
                    <div
                      key={teacher.teacherUsername}
                      className="bg-blue-50 rounded-xl p-4 border border-blue-200 animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-right">
                          <h4 className="font-bold text-blue-800 text-lg">
                            {teacher.teacherArabicName}
                          </h4>
                          <p className="text-blue-600">@{teacher.teacherUsername}</p>
                        </div>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
                          {teacher.count} تصريح
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-blue-600 text-lg">لا توجد إحصائيات بعد</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-blue-800 mb-6 text-center">
                إضافة مدرس جديد
              </h2>

              <form onSubmit={handleAddTeacher} className="space-y-6 max-w-md mx-auto">
                <div className="animate-slide-up animation-delay-200">
                  <label className="block text-blue-800 font-semibold mb-2 text-right">
                    الاسم بالعربية
                  </label>
                  <input
                    type="text"
                    value={newTeacher.arabicName}
                    onChange={(e) => setNewTeacher({...newTeacher, arabicName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right bg-white/80 hover:bg-white"
                    placeholder="مثال: أ. محمد"
                  />
                </div>

                <div className="animate-slide-up animation-delay-400">
                  <label className="block text-blue-800 font-semibold mb-2 text-right">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    value={newTeacher.username}
                    onChange={(e) => setNewTeacher({...newTeacher, username: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right bg-white/80 hover:bg-white"
                    placeholder="username"
                    dir="ltr"
                  />
                </div>

                <div className="animate-slide-up animation-delay-600">
                  <label className="block text-blue-800 font-semibold mb-2 text-right">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right bg-white/80 hover:bg-white"
                    placeholder="كلمة مرور قوية"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animation-delay-800"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      جاري الإضافة...
                    </div>
                  ) : (
                    "إضافة المدرس"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
