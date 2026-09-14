import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Printer, 
  Award, 
  Compass, 
  LogIn, 
  User, 
  LogOut, 
  GraduationCap, 
  School,
  ChevronDown
} from 'lucide-react';
import { Grade, Subject } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumData';
import { useAuth } from '../lib/AuthContext';

interface HeaderProps {
  grade: Grade;
  subject: Subject;
  activeTab: 'questions' | 'tutor' | 'whiteboard' | 'guide';
  setActiveTab: (tab: 'questions' | 'tutor' | 'whiteboard' | 'guide') => void;
  onOpenPrint: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  grade,
  subject,
  activeTab,
  setActiveTab,
  onOpenPrint,
  onOpenAuth,
}) => {
  const currentSubjectInfo = SUBJECT_METADATA[subject];
  const { currentUser, userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-emerald-600 via-teal-700 to-cyan-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/15 ring-2 ring-emerald-100">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 font-['Tajawal']">
                  بَلُوم للعلوم
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  سلطنة عُمان 🇴🇲
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">
                المنصة الذكية لمناهج كامبريدج للعلوم (الفيزياء • الكيمياء • الأحياء)
              </p>
            </div>
          </div>

          {/* Current Selection Indicators */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>الصف {grade === 10 ? 'العاشر' : grade === 11 ? 'الحادي عشر' : 'الثاني عشر'}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className={`flex items-center gap-1 font-bold ${currentSubjectInfo.color}`}>
              <span>{currentSubjectInfo.nameAr}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 font-medium">مستويات بلوم الستة</span>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-questions-btn"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'questions'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">الأسئلة والتقييم</span>
              <span className="sm:hidden">الأسئلة</span>
            </button>

            <button
              id="nav-tutor-btn"
              onClick={() => setActiveTab('tutor')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'tutor'
                  ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">المدرّس الذكي</span>
              <span className="sm:hidden">المدرّس</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 animate-ping" />
            </button>

            <button
              id="nav-whiteboard-btn"
              onClick={() => setActiveTab('whiteboard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'whiteboard'
                  ? 'bg-slate-800 text-white shadow-sm shadow-slate-800/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>السبورة</span>
            </button>

            <button
              id="nav-guide-btn"
              onClick={() => setActiveTab('guide')}
              title="دليل تصنيف بلوم"
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
            </button>

            <button
              id="print-exam-btn"
              onClick={onOpenPrint}
              title="تصدير وطباعة ورقة الاختبار"
              className="hidden md:flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>طباعة الاختبار</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">
                    {userProfile?.role === 'teacher' ? (
                      <School className="w-3.5 h-3.5" />
                    ) : (
                      <GraduationCap className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[120px] truncate">
                    {userProfile?.displayName || currentUser.displayName || 'حسابي'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50 text-xs text-slate-800 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="border-b border-slate-100 pb-2.5 mb-2.5">
                      <div className="font-bold text-slate-900 text-sm mb-0.5">
                        {userProfile?.displayName || currentUser.displayName}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {userProfile?.role === 'teacher' ? 'معلم معتمد' : `طالب (الصف ${userProfile?.grade || grade})`}
                        </span>
                        {userProfile?.school && (
                          <span className="text-[10px] text-slate-600 truncate">
                            • {userProfile.school}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 py-2 px-2.5 rounded-xl text-rose-700 hover:bg-rose-50 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول</span>
                </button>

                <button
                  id="header-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>حساب جديد</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
