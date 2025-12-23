export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-center animate-fade-in">
        <img 
          src="https://i.top4top.io/p_3644t4psm1.png" 
          alt="شعار ثانوية قرطبة الأهلية"
          className="w-24 h-24 mx-auto mb-6 animate-bounce"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600 font-semibold">جاري تحميل النظام...</p>
      </div>
    </div>
  );
}
