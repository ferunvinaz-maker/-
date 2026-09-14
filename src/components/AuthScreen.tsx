import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { UserRole, Grade } from '../types';
import { 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  School, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [grade, setGrade] = useState<Grade>(10);
  const [school, setSchool] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        setSuccessMsg('تم التحقق بنجاح! مرحباً بك في منصة بلوم للعلوم.');
      } else {
        if (!displayName.trim()) {
          throw new Error('يرجى إدخال الاسم الكامل للطالب أو المعلم.');
        }
        if (password.length < 6) {
          throw new Error('كلمة المرور يجب أن تتكون من 6 خانات على الأقل.');
        }

        await register(
          email.trim(),
          password,
          displayName.trim(),
          role,
          role === 'student' ? grade : undefined,
          school.trim() || undefined
        );

        setSuccessMsg('تم إنشاء حسابك بنجاح! جارٍ تحويلك للواجهة الرئيسية...');
      }
    } catch (err: any) {
      console.error(err);
      let message = 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
      if (err.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني المدخل غير صالح.';
      } else if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        message = 'البريد الإلكتروني أو كلمة المرور غير مطابقة. يمكنك تجربة الدخول السريع أدناه.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك الانتقال لتسجيل الدخول مباشرة.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور ضعيفة، يرجى كتابة 6 خانات أو أكثر.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (selectedG: Grade = 10) => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo(`طالب عُماني متميز (الصف ${selectedG})`, 'student', selectedG);
    } catch (err: any) {
      setError('تعذر تسجيل الدخول التجريبي: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-['Tajawal',sans-serif] relative overflow-hidden text-slate-100">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-950/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="max-w-md w-full text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>منصة سلطنة عُمان التعليمية 🇴🇲 • مناهج كامبريدج</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Tajawal']">
            بَلُوم للعلوم
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
          البيئة التفاعلية الذكية لتقويم وتعلّم الفيزياء والكيمياء والأحياء وفق هرم بلوم للمستويات المعرفية
        </p>
      </div>

      {/* Main Auth Card */}
      <div 
        id="auth-main-card"
        className="max-w-md w-full bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative z-10"
      >
        
        {/* Card Tabs: Login / Register */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/60 border-b border-slate-800/80 text-xs font-bold">
          <button
            type="button"
            id="tab-login-btn"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            type="button"
            id="tab-register-btn"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {/* Notification / Error Alerts */}
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 text-rose-200 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-bold">{successMsg}</p>
            </div>
          )}

          {/* Registration specific fields */}
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الاسم الكامل (الاسم الثلاثي أو المستعار) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: فيصل بن خلفان المقبالي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Role Picker: Student or Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  صفة الحساب <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'student'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>طالب / طالبة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'teacher'
                        ? 'bg-teal-950/70 border-teal-500 text-teal-200 ring-1 ring-teal-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span>معلم / معلّمة</span>
                  </button>
                </div>
              </div>

              {/* Grade Selection (if student) */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المرحلة الدراسية في سلطنة عُمان
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  >
                    <option value={10}>الصف العاشر الأساسي (كامبريدج)</option>
                    <option value={11}>الصف الحادي عشر (دبلوم كامبريدج)</option>
                    <option value={12}>الصف الثاني عشر (دبلوم التعليم العام)</option>
                  </select>
                </div>
              )}

              {/* School Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المدرسة / المحافظة التعليمية (اختياري)
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="مثال: مدرسة الإمام جابر بن زيد - مسقط"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              البريد الإلكتروني <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@edu.om"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left dir-ltr"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              كلمة المرور <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left dir-ltr"
              />
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-slate-500 mt-1 block">يجب ألا تقل عن 6 أحرف أو أرقام</span>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 shadow-emerald-600/30'
              }`}
            >
              {loading ? (
                <span>جارٍ التحقق والاتصال...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للمنصة</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد التسجيل وإنشاء الحساب</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Access - Extremely helpful for examiners and instant review */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-400 font-bold">
                أو الدخول التجريبي الفوري بنقرة واحدة
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess(10)}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 text-[11px] font-bold text-center transition-all hover:border-emerald-500/50"
            >
              ⚡ طالب عاشر
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess(11)}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-teal-300 border border-slate-700/80 text-[11px] font-bold text-center transition-all hover:border-teal-500/50"
            >
              ⚡ طالب 11
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess(12)}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 text-[11px] font-bold text-center transition-all hover:border-cyan-500/50"
            >
              ⚡ طالب 12
            </button>
          </div>

        </form>

        {/* Card Footer Feature Badges */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800/80 flex items-center justify-around text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>حساب موثق وآمن</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>بحث SerpApi مباشر</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>معايير بلوم الستة</span>
          </div>
        </div>

      </div>

      {/* Footer Credits */}
      <div className="mt-6 text-center text-xs text-slate-400 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="text-slate-300 font-medium">إعداد وتطوير:</span>
        <strong className="text-white font-bold">فراس بن ماجد بن سالم البادي</strong>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="text-emerald-400">طالب جامعة نزوى • سلطنة عُمان</span>
      </div>

    </div>
  );
};
