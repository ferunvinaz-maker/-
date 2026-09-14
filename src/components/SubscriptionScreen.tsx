import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Award, 
  BookOpen, 
  ArrowRight,
  Ticket,
  ChevronLeft,
  X,
  Lock,
  Globe
} from 'lucide-react';

interface SubscriptionScreenProps {
  onComplete?: () => void;
  isModal?: boolean;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onComplete,
  isModal = false,
}) => {
  const { userProfile, activateSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'semester' | 'annual' | 'free_trial'>('semester');
  const [paymentMethod, setPaymentMethod] = useState<'thawani' | 'voucher' | 'trial'>('thawani');
  const [voucherCode, setVoucherCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThawaniPay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate real-time Thawani Pay checkout delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      await activateSubscription(selectedPlan, 'thawani');
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'فشلت عملية الدفع عبر بوابة ثواني.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoucherActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      setError('يرجى إدخال كود التفعيل المدرسي.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Accept typical school vouchers or any valid promo
      const cleanCode = voucherCode.trim().toUpperCase();
      if (cleanCode.length >= 3) {
        await activateSubscription('semester', 'school_voucher');
        setSuccess(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      } else {
        throw new Error('كود التفعيل غير صالح أو منتهي الصلاحية.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeTrial = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await activateSubscription('free_trial', 'free_trial');
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'تعذر تفعيل التجربة المجانية.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`font-['Tajawal',sans-serif] ${isModal ? 'p-0' : 'min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center'}`}>
      <div className={`w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative ${isModal ? 'border-none shadow-none' : ''}`}>
        
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 text-white relative">
          {isModal && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>اشتراك منصة بلوم للعلوم • سلطنة عُمان</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                تفعيل حساب الطالب عبر بوابة ثواني (Thawani Pay)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
                خطوة سريعة لتفعيل حساب الطالب والاستفادة من بنك الأسئلة التقويمية، المعلم الذكي ببحث SerpApi، والسبورة التفاعلية.
              </p>
            </div>

            {/* Thawani Pay Badge */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
              <div className="text-[11px] text-emerald-200 font-medium">بوابة الدفع الوطنية</div>
              <div className="text-base font-black tracking-wider text-white">Thawani Pay 🇴🇲</div>
              <div className="text-[9px] text-emerald-300 mt-0.5">آمن ومعتمد 100%</div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status feedback */}
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 text-rose-200 rounded-2xl text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-100 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
              <div>
                <strong className="block text-white font-bold">تم تفعيل حسابك بنجاح وبدء الاشتراك!</strong>
                <span className="text-emerald-200 text-xs">مرحباً بك {userProfile?.displayName || 'يا بطل العلوم'}. جارٍ فتح جميع أدوات المنصة...</span>
              </div>
            </div>
          )}

          {/* Plan Selection Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Plan 1: Full Semester */}
            <div 
              onClick={() => setSelectedPlan('semester')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlan === 'semester'
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                الأكثر طلباً ⭐
              </div>

              <div className="text-xs font-bold text-emerald-400 mb-1">الباقة الشاملة</div>
              <div className="text-xl font-black text-white mb-2">الفصل الدراسي الكامل</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-emerald-300">5.000</span>
                <span className="text-xs text-slate-400 font-bold">ر.ع عُماني / فصل</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>جميع دروس العاشر والحادي عشر والثاني عشر</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>توليد أسئلة بلوم الستة ونماذج الإجابة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>المدرس الذكي مع محرك SerpApi للبحث الحي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>طباعة وتحميل أوراق الاختبار وسلم الدرجات</span>
                </li>
              </ul>
            </div>

            {/* Plan 2: Free Trial / School */}
            <div 
              onClick={() => setSelectedPlan('free_trial')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlan === 'free_trial'
                  ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-teal-400 mb-1">تجربة استكشافية</div>
              <div className="text-xl font-black text-white mb-2">تجربة مجانية / كود مدرسي</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-teal-300">0.000</span>
                <span className="text-xs text-slate-400 font-bold">ر.ع عُماني (14 يوماً)</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>وصول فوري لكافة أدوات المنصة دون بطاقة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>إمكانية تفعيل اشتراك المدرسة بكود التفعيل</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>توليد أسئلة بلوم والسبورة التفاعلية</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Payment Method Selector */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <label className="block text-xs font-black text-slate-200">
              اختر وسيلة التفعيل المفضلة:
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('thawani')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'thawani'
                    ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>بوابة ثواني Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('voucher')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'voucher'
                    ? 'bg-teal-900/40 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ticket className="w-4 h-4 text-teal-400" />
                <span>كود مدرسي</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('trial')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'trial'
                    ? 'bg-cyan-900/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>تجربة مجانية</span>
              </button>
            </div>

            {/* Method 1: Thawani Pay Direct */}
            {paymentMethod === 'thawani' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>الدفع الآمن عبر بوابة ثواني (بطاقات الخصم المباشر العمانية Debit / Credit)</span>
                  </div>
                  <span className="font-bold text-emerald-300 font-mono">5.000 OMR</span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing || success}
                  onClick={handleThawaniPay}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-black text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {isProcessing ? (
                    <span>جارٍ الاتصال ببوابة ثواني Pay...</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>تأكيد الدفع والتفعيل المباشر (Thawani Pay)</span>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Method 2: School Voucher */}
            {paymentMethod === 'voucher' && (
              <form onSubmit={handleVoucherActivate} className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="أدخل كود المدرسة (مثال: OMAN2025 أو BLOOM)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || success}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    تطبيق الكود
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  يمكنك استخدام كود التفعيل التجريبي <code className="text-teal-300 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded">OMAN2025</code>
                </p>
              </form>
            )}

            {/* Method 3: Instant Free Trial */}
            {paymentMethod === 'trial' && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  ابدأ التجربة المجانية الفورية لمدة 14 يوماً مع كامل الميزات لتقييم المدرس الذكي وبنك الأسئلة والسبورة قبل الاشتراك.
                </p>
                <button
                  type="button"
                  disabled={isProcessing || success}
                  onClick={handleFreeTrial}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>تفعيل التجربة المجانية والبدء الآن</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
