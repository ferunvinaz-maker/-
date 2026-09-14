import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { UserRole, Grade } from '../types';
import { X, LogIn, UserPlus, GraduationCap, School, Mail, Lock, User, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        setSuccessMsg('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        if (!displayName.trim()) {
          throw new Error('يرجى إدخال الاسم الكريم.');
        }
        if (password.length < 6) {
          throw new Error('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
        }

        await register(
          email.trim(),
          password,
          displayName.trim(),
          role,
          role === 'student' ? grade : undefined,
          school.trim() || undefined
        );

        setSuccessMsg('تم إنشاء الحساب وحفظ البيانات بنجاح!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      let message = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
      if (err.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني المدخل غير صالح.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول به.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور ضعيفة، اختر كلمة مرور من 6 خانات أو أكثر.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="auth-modal-container"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
      >
        
        {/* Modal Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg">منصة بلوم للعلوم</h3>
              <p className="text-xs text-emerald-200">مناهج كامبريدج - سلطنة عُمان 🇴🇲</p>
            </div>
          </div>

          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            {mode === 'login' 
              ? 'سجّل دخولك لمتابعة أسئلتك المحفوظة، واستشارات المعلم الذكي، وتقييم إجاباتك.' 
              : 'أنشئ حسابك الجديد كطالب أو معلم لتجربة تعليمية تفاعلية متكاملة.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-black/25 p-1 rounded-xl mt-4 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'register' ? 'bg-emerald-500 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>حساب جديد</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-bold">{successMsg}</p>
            </div>
          )}

          {/* If Register: Name, Role, Grade, School */}
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل (الاسم الثلاثي أو المستعار) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: أحمد بن محمد المعمري"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع الحساب <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'student'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                        ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span>معلم / معلّمة</span>
                  </button>
                </div>
              </div>

              {/* Student Grade */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المرحلة الدراسية المقيد بها
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value={10}>الصف العاشر الأساسي</option>
                    <option value={11}>الصف الحادي عشر (دبلوم كامبريدج)</option>
                    <option value={12}>الصف الثاني عشر (دبلوم التعليم العام)</option>
                  </select>
                </div>
              )}

              {/* School / Governorate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المدرسة / المحافظة التعليمية (اختياري)
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="مثال: مدرسة الإمام جابر بن زيد - مسقط"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البريد الإلكتروني <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@edu.om"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-left dir-ltr"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كلمة المرور <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-left dir-ltr"
              />
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-slate-600 mt-1 block">يجب ألا تقل عن 6 أحرف</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <span>جارٍ المعالجة...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى المنصة</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد إنشاء الحساب</span>
                </>
              )}
            </button>
          </div>

          {/* Switch Footer */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  سجل حساباً جديداً الآن
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
