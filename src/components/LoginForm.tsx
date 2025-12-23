import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  arabicName?: string;
  role: "teacher" | "admin";
}

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const customSignIn = useMutation(api.users.customSignIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("يرجى إدخال جميع البيانات");
      return;
    }

    setIsLoading(true);
    try {
      const result = await customSignIn({ username, password });
      if (result.success && result.user) {
        toast.success("تم تسجيل الدخول بنجاح");
        onLogin(result.user);
      } else {
        toast.error(result.error || "حدث خطأ في تسجيل الدخول");
      }
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8 animate-fade-in">
          <img 
            src="https://i.top4top.io/p_3644t4psm1.png" 
            alt="شعار ثانوية قرطبة الأهلية"
            className="w-32 h-32 mx-auto mb-6 animate-bounce-slow"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))' }}
          />
          <h1 className="text-3xl font-bold text-blue-800 mb-2 animate-slide-up">
            ثانوية قرطبة الأهلية
          </h1>
          <p className="text-blue-600 animate-slide-up animation-delay-200">
            نظام إدارة تصاريح الخروج
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100 animate-slide-up animation-delay-400">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="animate-slide-right animation-delay-600">
                <label className="block text-blue-800 font-semibold mb-2 text-right">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right bg-white/80 hover:bg-white"
                  placeholder="أدخل اسم المستخدم"
                  dir="ltr"
                />
              </div>

              <div className="animate-slide-left animation-delay-800">
                <label className="block text-blue-800 font-semibold mb-2 text-right">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-right bg-white/80 hover:bg-white"
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animation-delay-1000"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
