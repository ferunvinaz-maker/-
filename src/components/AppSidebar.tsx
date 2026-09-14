import React from 'react';
import { Grade, Subject, BloomLevel } from '../types';
import { OMANI_CURRICULUM, SUBJECT_METADATA } from '../data/curriculumData';
import { useAuth } from '../lib/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Printer, 
  Award, 
  CreditCard, 
  LogOut, 
  GraduationCap, 
  School, 
  ChevronDown,
  Layers,
  Search,
  CheckCircle2,
  Zap,
  Globe,
  X
} from 'lucide-react';

interface AppSidebarProps {
  selectedGrade: Grade;
  selectedSubject: Subject;
  selectedUnitId: string;
  selectedLessonId: string;
  customTopic: string;
  selectedBloomLevels: BloomLevel[];
  isGenerating: boolean;
  activeTab: 'questions' | 'tutor' | 'whiteboard' | 'guide' | 'subscription';
  isOpenOnMobile: boolean;
  questionsCount: number;
  onGradeChange: (grade: Grade) => void;
  onSubjectChange: (subject: Subject) => void;
  onUnitChange: (unitId: string) => void;
  onLessonChange: (lessonId: string) => void;
  onCustomTopicChange: (val: string) => void;
  onToggleBloomLevel: (level: BloomLevel) => void;
  onGenerate: () => void;
  setActiveTab: (tab: 'questions' | 'tutor' | 'whiteboard' | 'guide' | 'subscription') => void;
  onOpenPrint: () => void;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  selectedGrade,
  selectedSubject,
  selectedUnitId,
  selectedLessonId,
  customTopic,
  selectedBloomLevels,
  isGenerating,
  activeTab,
  isOpenOnMobile,
  questionsCount,
  onGradeChange,
  onSubjectChange,
  onUnitChange,
  onLessonChange,
  onCustomTopicChange,
  onToggleBloomLevel,
  onGenerate,
  setActiveTab,
  onOpenPrint,
  onCloseMobile,
}) => {
  const { userProfile, currentUser, logout } = useAuth();

  // Find units and lessons for the active curriculum
  const currentCurriculum = OMANI_CURRICULUM.find(
    (c) => c.grade === selectedGrade && c.subject === selectedSubject
  );
  const units = currentCurriculum?.units || [];
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const lessons = currentUnit?.lessons || [];

  const isSubscribed = !!userProfile?.isSubscribed;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-app-sidebar"
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 sm:w-80 bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out font-['Tajawal',sans-serif] ${
          isOpenOnMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        
        {/* Sidebar Header / Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-white">
                  بَلُوم للعلوم
                </h1>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  عُمان 🇴🇲
                </span>
              </div>
              <p className="text-[11px] text-slate-400">مناهج كامبريدج المعتمدة</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge & Subscription Status */}
        <div className="p-3.5 mx-3 mt-3 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                {userProfile?.role === 'teacher' ? (
                  <School className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {userProfile?.displayName || currentUser?.displayName || 'طالب المنصة'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userProfile?.school || (userProfile?.role === 'teacher' ? 'معلم معتمد' : `الصف ${selectedGrade}`)}
                </div>
              </div>
            </div>

            {/* Subscription Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border transition-all ${
                isSubscribed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 animate-pulse'
              }`}
            >
              {isSubscribed ? '✅ مشترك (ثواني)' : '⚡ تفعيل الاشتراك'}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation & Selectors Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* CURRICULUM SELECTION SECTION (st.sidebar style) */}
          <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-black text-emerald-400">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>اختيار المنهج والدرس (سلطنة عُمان)</span>
              </div>
            </div>

            {/* 1. Grade Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                المرحلة الدراسية:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {([10, 11, 12] as Grade[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      onGradeChange(g);
                      const curr = OMANI_CURRICULUM.find((c) => c.grade === g && c.subject === selectedSubject);
                      if (curr && curr.units.length > 0) {
                        onUnitChange(curr.units[0].id);
                        if (curr.units[0].lessons.length > 0) {
                          onLessonChange(curr.units[0].lessons[0].id);
                        }
                      }
                    }}
                    className={`py-1.5 rounded-lg text-center font-bold text-[11px] transition-all ${
                      selectedGrade === g
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    الصف {g === 10 ? 'العاشر' : g === 11 ? '11' : '12'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Subject Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                المادة العلمية:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['physics', 'chemistry', 'biology'] as Subject[]).map((s) => {
                  const meta = SUBJECT_METADATA[s];
                  const isSelected = selectedSubject === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onSubjectChange(s);
                        const curr = OMANI_CURRICULUM.find((c) => c.grade === selectedGrade && c.subject === s);
                        if (curr && curr.units.length > 0) {
                          onUnitChange(curr.units[0].id);
                          if (curr.units[0].lessons.length > 0) {
                            onLessonChange(curr.units[0].lessons[0].id);
                          }
                        }
                      }}
                      className={`py-1.5 rounded-lg text-center font-bold text-[11px] transition-all ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {meta.nameAr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Unit Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                الوحدة الدراسية:
              </label>
              <div className="relative">
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    const uId = e.target.value;
                    onUnitChange(uId);
                    const unit = units.find((u) => u.id === uId);
                    if (unit && unit.lessons.length > 0) {
                      onLessonChange(unit.lessons[0].id);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 appearance-none font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 4. Lesson Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                الدرس المحدد:
              </label>
              <div className="relative">
                <select
                  value={selectedLessonId}
                  onChange={(e) => onLessonChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 appearance-none font-medium"
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 5. Custom Topic (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                تركيز أو موضوع فرعي (اختياري):
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => onCustomTopicChange(e.target.value)}
                placeholder="مثال: مسائل حساب المقاومة المكافئة"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              id="sidebar-generate-btn"
              disabled={isGenerating}
              onClick={() => {
                onGenerate();
                if (window.innerWidth < 1024) {
                  onCloseMobile();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {isGenerating ? (
                <span>جارٍ توليد الأسئلة...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد أسئلة بلوم معيارية ✨</span>
                </>
              )}
            </button>
          </div>

          {/* PLATFORM TOOLS & SECTIONS NAVIGATION */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              أقسام المنصة والأدوات
            </div>

            {/* 1. Questions & Assessment */}
            <button
              type="button"
              onClick={() => { setActiveTab('questions'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-xs ${
                activeTab === 'questions'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>الأسئلة وبنك التقييم</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'questions' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {questionsCount} أسئلة
              </span>
            </button>

            {/* 2. Smart AI Tutor */}
            <button
              type="button"
              onClick={() => { setActiveTab('tutor'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-xs ${
                activeTab === 'tutor'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>المدرّس الذكي (AI Tutor)</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-1.5 py-0.5 rounded">
                <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>SerpApi</span>
              </span>
            </button>

            {/* 3. Interactive Whiteboard */}
            <button
              type="button"
              onClick={() => { setActiveTab('whiteboard'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-xs ${
                activeTab === 'whiteboard'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PenTool className="w-4 h-4" />
                <span>السبورة العلمية التفاعلية</span>
              </div>
            </button>

            {/* 4. Print / Export Exam Paper */}
            <button
              type="button"
              onClick={() => { onOpenPrint(); onCloseMobile(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>طباعة وتحميل الاختبار</span>
              </div>
              <span className="text-[10px] text-slate-400">PDF / كامبريدج</span>
            </button>

            {/* 5. Bloom Taxonomy Guide */}
            <button
              type="button"
              onClick={() => { setActiveTab('guide'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-xs ${
                activeTab === 'guide'
                  ? 'bg-purple-900/70 text-purple-200 border border-purple-600/50 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-400" />
                <span>دليل مستويات بلوم الستة</span>
              </div>
            </button>

            {/* 6. Subscription & Thawani Pay details */}
            <button
              type="button"
              onClick={() => { setActiveTab('subscription'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-xs ${
                activeTab === 'subscription'
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>بوابة ثواني والاشتراك</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">5 ر.ع</span>
            </button>

          </div>

        </div>

        {/* Sidebar Footer: Developer Credit & Logout */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 shrink-0 space-y-2.5">
          
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-snug">
            <div className="text-slate-300 font-bold mb-0.5">إعداد وتطوير:</div>
            <div className="text-emerald-400 font-bold">فراس بن ماجد بن سالم البادي</div>
            <div className="text-[10px] text-slate-500">طالب جامعة نزوى • سلطنة عُمان</div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من المنصة</span>
          </button>

        </div>

      </aside>
    </>
  );
};
