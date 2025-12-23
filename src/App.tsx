import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster, toast } from "sonner";
import LoginForm from "./components/LoginForm";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard";
import LoadingSpinner from "./components/LoadingSpinner";

interface User {
  id: string;
  username: string;
  arabicName?: string;
  role: "teacher" | "admin";
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const initializeAccounts = useMutation(api.users.initializeAccounts);

  useEffect(() => {
    // تهيئة الحسابات عند بدء التطبيق
    initializeAccounts().then(() => {
      setIsLoading(false);
    });

    // التحقق من وجود جلسة محفوظة
    const savedUser = localStorage.getItem("qurtuba_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("qurtuba_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("qurtuba_user");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {!user ? (
          <LoginForm onLogin={handleLogin} />
        ) : user.role === "teacher" ? (
          <TeacherDashboard user={user} onLogout={handleLogout} />
        ) : (
          <AdminDashboard user={user} onLogout={handleLogout} />
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-blue-100 py-2 text-center text-sm text-blue-600 z-20">
        صُنع بإتقان © 2026 ثانوية قرطبة الأهلية
      </footer>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
          }
        }}
      />
    </div>
  );
}
