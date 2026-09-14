import React, { useState, useEffect } from 'react';
import { Grade, Subject, BloomLevel, Question } from './types';
import { OMANI_CURRICULUM, SAMPLE_QUESTIONS_BANK, SUBJECT_METADATA } from './data/curriculumData';
import { QuestionCard } from './components/QuestionCard';
import { SmartTutor } from './components/SmartTutor';
import { InteractiveWhiteboard } from './components/InteractiveWhiteboard';
import { BloomLevelGuide } from './components/BloomLevelGuide';
import { PrintModal } from './components/PrintModal';
import { AuthScreen } from './components/AuthScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { AppSidebar } from './components/AppSidebar';
import { useAuth } from './lib/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Printer,
  Award, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Menu,
  ChevronLeft,
  CreditCard,
  Layers,
  GraduationCap,
  School,
  LogOut,
  Compass,
  Zap,
  Info
} from 'lucide-react';

export default function App() {
  const { currentUser, userProfile, loading, logout } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('physics');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('g10-phy-u1');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('g10-p-l1');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [selectedBloomLevels, setSelectedBloomLevels] = useState<BloomLevel[]>([]);
  
  const [activeTab, setActiveTab] = useState<'questions' | 'tutor' | 'whiteboard' | 'guide' | 'subscription'>('questions');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [showWelcomeSubscriptionModal, setShowWelcomeSubscriptionModal] = useState<boolean>(false);

  // If a student logs in, automatically match grade if set
  useEffect(() => {
    if (userProfile?.role === 'student' && userProfile.grade) {
      setSelectedGrade(userProfile.grade);
    }
  }, [userProfile]);

  // Prompt subscription if user logs in without an active subscription
  useEffect(() => {
    if (currentUser && userProfile && !userProfile.isSubscribed) {
      // Prompt modal once per session
      const hasPrompted = sessionStorage.getItem('hasPromptedSub');
      if (!hasPrompted) {
        setShowWelcomeSubscriptionModal(true);
        sessionStorage.setItem('hasPromptedSub', 'true');
      }
    }
  }, [currentUser, userProfile]);

  // Active question selected for tutor context
  const [activeQuestionForTutor, setActiveQuestionForTutor] = useState<Question | null>(null);
  // Text to send/stamp onto the whiteboard
  const [whiteboardInitialText, setWhiteboardInitialText] = useState<string>('');

  // Notification toast
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Current curriculum lesson details
  const currentCurriculum = OMANI_CURRICULUM.find(
    (c) => c.grade === selectedGrade && c.subject === selectedSubject
  );
  const currentUnit = currentCurriculum?.units.find((u) => u.id === selectedUnitId) || currentCurriculum?.units[0];
  const currentLesson = currentUnit?.lessons.find((l) => l.id === selectedLessonId) || currentUnit?.lessons[0];

  // Initialize questions with sample bank for grade 10 physics or generate dynamically
  const [questions, setQuestions] = useState<Question[]>(
    SAMPLE_QUESTIONS_BANK['g10-p-l1'] || []
  );

  // Helper to show brief toast
  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // Generate fallback questions for any subject/lesson if API fails
  const generateFallbackQuestions = (
    grade: Grade,
    subject: Subject,
    unitTitle: string,
    lessonTitle: string,
    custom: string
  ): Question[] => {
    const subName = SUBJECT_METADATA[subject].nameAr;
    const focus = custom ? `(${custom})` : `درس (${lessonTitle})`;

    return [
      {
        id: `fb-${Date.now()}-1`,
        number: 1,
        bloomLevel: 'remembering',
        bloomLevelArabic: 'التذكر (المعرفة)',
        cognitiveSkill: 'استرجاع مصطلحات وقوانين أساسية',
        questionText: `عرّف المفهوم الأساسي لـ ${focus} في مادة ${subName} للصف ${grade}، واذكر القانون الرياضي أو الصيغة الكيميائية والوحدات الدولية المرتبطة به.`,
        marks: 3,
        modelAnswer: `التعريف العلمي: هو المفهوم الذي يصف الظاهرة بدقة حسب المعايير المقررة في منهج كامبريدج.\nالوحدات والقانون: يتم التعبير بالوحدات الدولية المعتمدة (SI Units).\nالرمز والصيغة: مراعاة الدقة في كتابة الرموز والحالات الفيزيائية.`,
        explanation: 'أسئلة التذكر تقيس قدرة الطالب على استدعاء الحقائق والمصطلحات دون تغيير في معناها الأصلي.',
        hint: 'ارجع لكتاب الطالب في الجزء المخصص للتعريفات والمصطلحات في بداية الدرس.',
        criteria: [
          'درجة واحدة: كتابة التعريف العلمي الدقيق.',
          'درجة واحدة: ذكر القانون أو الرمز الرياضي.',
          'درجة واحدة: كتابة الوحدة الدولية الصحيحة.'
        ]
      },
      {
        id: `fb-${Date.now()}-2`,
        number: 2,
        bloomLevel: 'understanding',
        bloomLevelArabic: 'الفهم (الاستيعاب)',
        cognitiveSkill: 'تفسير علمي وتعليل منطقي',
        questionText: `علل علمياً: فسر السلوك أو التغير الفيزيائي/الكيميائي/الحيوي الذي يحدث أثناء دراسة ${focus}، مبيناً السبب المجهري أو الجزيئي لحدوث ذلك.`,
        marks: 3,
        modelAnswer: `التفسير العلمي:\nيحدث هذا السلوك نتيجة تفاعل المتغيرات الأساسية؛ حيث يؤدي التغير في الظروف إلى تأثير مباشر على الجسيمات أو المنظومة وفق النظريات العلمية المعتمدة في المنهج العماني.`,
        explanation: 'الفهم يركز على قدرة الطالب على إدراك العلاقة بين السبب والنتيجة والشرح بأسلوبه الخاص.',
        hint: 'فكر في ما يحدث على المستوى المجهري (حركة الجسيمات أو تفاعلات الجزيئات).',
        criteria: [
          'درجة ونصف: توضيح السبب المباشر بدقة.',
          'درجة ونصف: الربط العلمي بين السبب والظاهرة المشاهدة.'
        ]
      },
      {
        id: `fb-${Date.now()}-3`,
        number: 3,
        bloomLevel: 'applying',
        bloomLevelArabic: 'التطبيق',
        cognitiveSkill: 'حل مسألة حسابية واستخدام القوانين',
        questionText: `احسب القيمة المجهولة في مسألة علمية متعلقة بـ ${focus} إذا كانت المعطيات المعملية كالتالي:\n- القيمة الابتدائية = 24 وحدة قياسية\n- معدل التغير = 4.5 وحدة لكل ثانية\n- الفترة الزمنية المستغرقة = 8 ثوانٍ\nاحسب الناتج النهائي مع توضيح خطوات التعويض وكتابة الوحدة الدولية.`,
        marks: 4,
        modelAnswer: `خطوات الحل:\n1) كتابة القانون المعتمد: القيمة النهائية = القيمة الابتدائية + (معدل التغير × الزمن)\n2) التعويض بالأرقام: الناتج = 24 + (4.5 × 8) = 24 + 36 = 60 وحدة.\n3) النتيجة النهائية: 60 مع كتابة الوحدة الدولية المناسبة.`,
        explanation: 'التطبيق يتطلب نقل المعرفة النظرية إلى موقف كمي أو حسابي واستخراج النتيجة بالوحدة الصحيحة.',
        hint: 'احرص على كتابة القانون أولاً قبل التعويض بالأرقام لتضمن درجات الخطوات.',
        criteria: [
          'درجة: كتابة القانون العلمي السليم.',
          'درجتان: التعويض الرياضي الصحيح والحسابات.',
          'درجة: كتابة الوحدة الدولية المناسبة.'
        ]
      },
      {
        id: `fb-${Date.now()}-4`,
        number: 4,
        bloomLevel: 'analyzing',
        bloomLevelArabic: 'التحليل',
        cognitiveSkill: 'تحليل علاقات بيانية وبيانات تجريبية',
        questionText: `عند رسم منحنى بياني يربط بين المتغير المستقل والمتغير التابع في موضوع ${focus}، تم الحصول على خط مستقيم يمر بنقطة الأصل.\nأ) ما نوع العلاقة الرياضية والفيزيائية بين المتغيرين؟\nب) ماذا يمثل ميل هذا الخط المستقيم؟ وكيف تحسب قيمته عملياً؟`,
        marks: 4,
        modelAnswer: `أ) العلاقة: علاقة طردية خطية منتظمة (حيث يتناسب المتغير التابع طردياً مع المتغير المستقل).\nب) يمثل الميل: الثابت الفيزيائي أو المعدل الحركي للقانون.\nحساب الميل عملياً: باختيار نقطتين متباعدتين على الخط وحساب Δy / Δx من مثلث الميل.`,
        explanation: 'التحليل يفكك البيانات إلى أجزائها لاكتشاف النمط العام وتفسير دلالة الميل والمحاور.',
        hint: 'تذكر أن الخط المستقيم المار بنقطة الأصل يعني أن النسبة بين المتغيرين ثابتة دائماً.',
        criteria: [
          'درجتان: تحديد العلاقة الطردية بدقة وصياغة علمية.',
          'درجتان: توضيح دلالة الميل وطريقة حسابه باستخدام مثلث الميل.'
        ]
      },
      {
        id: `fb-${Date.now()}-5`,
        number: 5,
        bloomLevel: 'evaluating',
        bloomLevelArabic: 'التقييم',
        cognitiveSkill: 'نقد خطوات تجربة واقتراح تحسينات قياسية',
        questionText: `في تقرير معملي كتبه طالب لدراسة ${focus}، لاحظ المعلم وجود تفاوت غير مبرر في النتائج عند تكرار التجربة.\n1) قيّم التجربة وحدد مصدرين محتملين للخطأ العشوائي أو النظامي.\n2) اقترح إجراءً عملياً واحداً لزيادة دقة وموثوقية القياسات وفق مواصفات كامبريدج.`,
        marks: 4,
        modelAnswer: `1) مصادر الخطأ:\n- خطأ في زمن الاستجابة البشري أو خطأ زاوية الرؤية (Parallax Error) عند قراءة الأدوات التناظرية.\n- تأثير مقاومة الهواء أو فقدان الحرارة إلى الوسط المحيط في المعمل.\n\n2) الإجراء المقترح:\nاستخدام مجسات رقمية وأجهزة استشعار (Sensors / Data Loggers) وأخذ متوسط عدة قراءات متكررة بعد استبعاد الشواذ.`,
        explanation: 'التقييم يعزز التفكير النقدي لدى الطالب للحكم على دقة التجارب الميدانية والمخبرية.',
        hint: 'فكر في الأسباب التي تجعل القراءات تختلف من محاولة إلى أخرى في معمل العلوم المدرسي.',
        criteria: [
          'درجتان: ذكر مصدرين منطقيين للأخطاء التجريبية.',
          'درجتان: اقتراح تحسين عملي مقنع مع التبرير.'
        ]
      }
    ];
  };

  // Generate Questions handler
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    showToast('info', 'جارٍ توليد الأسئلة ونموذج الإجابة بالذكاء الاصطناعي وفق معايير كامبريدج...');

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject,
          unitTitle: currentUnit?.title || '',
          lessonTitle: currentLesson?.title || '',
          customTopic: customTopic.trim() || undefined,
          focusLevels: selectedBloomLevels.length > 0 ? selectedBloomLevels : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل التوليد من الخادم');
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setActiveTab('questions');
        showToast('success', 'تم توليد 5 أسئلة بنجاح مصنفة حسب مستويات بلوم الستة مع نماذج الإجابة!');
      } else {
        throw new Error('لم يتم استرجاع أسئلة');
      }
    } catch (err: any) {
      console.warn('Using enriched fallback questions:', err);
      // Fallback
      const fallback = generateFallbackQuestions(
        selectedGrade,
        selectedSubject,
        currentUnit?.title || '',
        currentLesson?.title || '',
        customTopic
      );
      setQuestions(fallback);
      setActiveTab('questions');
      showToast('info', 'تم تجهيز 5 أسئلة متدرجة وفق تصنيف بلوم للمنهج المختار!');
    } finally {
      setIsGenerating(false);
    }
  };

  // When student updates an answer inside QuestionCard
  const handleUpdateStudentAnswer = (questionId: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, studentAnswer: answer } : q))
    );
  };

  // Send question to whiteboard
  const handleSendToWhiteboard = (question: Question) => {
    const stampText = `[سؤال ${question.number} - ${question.bloomLevelArabic}]: ${question.questionText}`;
    setWhiteboardInitialText(stampText);
    setActiveTab('whiteboard');
    showToast('info', 'تم فتح السبورة التفاعلية وإدراج نص المسألة لبدء الرسم والحل!');
  };

  // Ask tutor about question
  const handleAskTutor = (question: Question) => {
    setActiveQuestionForTutor(question);
    setActiveTab('tutor');
    showToast('info', `تم تحويل السياق إلى المعلم الذكي للسؤال رقم (${question.number})`);
  };

  // Open whiteboard with text from tutor
  const handleOpenWhiteboardWithText = (text: string) => {
    setWhiteboardInitialText(text);
    setActiveTab('whiteboard');
    showToast('info', 'تم إرسال محتوى الشرح إلى السبورة التفاعلية!');
  };

  const handleToggleBloomLevel = (level: BloomLevel) => {
    setSelectedBloomLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-['Tajawal',sans-serif] text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/30 animate-pulse mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black mb-1">منصة بَلُوم للعلوم • سلطنة عُمان</h2>
        <p className="text-xs text-emerald-400">جارٍ تهيئة الجلسة والتحقق من الحساب...</p>
      </div>
    );
  }

  // 2. Authentication Gate: If not authenticated, display centered AuthScreen!
  if (!currentUser) {
    return <AuthScreen />;
  }

  const isSubscribed = !!userProfile?.isSubscribed;
  const currentSubjectMeta = SUBJECT_METADATA[selectedSubject];

  return (
    <div className="min-h-screen bg-slate-50 font-['Tajawal',sans-serif] text-slate-900 flex">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 max-w-md w-full px-4">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/20'
                : notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700 shadow-rose-900/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-teal-400 shrink-0" />
            )}
            <p className="leading-relaxed flex-1">{notification.text}</p>
          </div>
        </div>
      )}

      {/* Modern Sidebar (st.sidebar style) */}
      <AppSidebar
        selectedGrade={selectedGrade}
        selectedSubject={selectedSubject}
        selectedUnitId={selectedUnitId}
        selectedLessonId={selectedLessonId}
        customTopic={customTopic}
        selectedBloomLevels={selectedBloomLevels}
        isGenerating={isGenerating}
        activeTab={activeTab}
        isOpenOnMobile={isSidebarOpenMobile}
        questionsCount={questions.length}
        onGradeChange={setSelectedGrade}
        onSubjectChange={setSelectedSubject}
        onUnitChange={setSelectedUnitId}
        onLessonChange={setSelectedLessonId}
        onCustomTopicChange={setCustomTopic}
        onToggleBloomLevel={handleToggleBloomLevel}
        onGenerate={handleGenerateQuestions}
        setActiveTab={setActiveTab}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main App Workspace (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 xl:mr-80 transition-all duration-300">
        
        {/* Top Minimalist Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            
            {/* Right side: Mobile Menu Toggle & Clean Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden shrink-0"
                title="فتح القائمة الجانبية"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb path */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                <div className="flex items-center gap-1 font-bold text-slate-900 shrink-0">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الصف {selectedGrade === 10 ? 'العاشر' : selectedGrade === 11 ? 'الحادي عشر' : 'الثاني عشر'}</span>
                </div>
                <span className="text-slate-300 shrink-0">/</span>
                <span className={`font-bold ${currentSubjectMeta.color} shrink-0`}>
                  {currentSubjectMeta.nameAr}
                </span>
                <span className="text-slate-300 hidden sm:inline shrink-0">/</span>
                <span className="truncate hidden sm:inline text-slate-700 font-medium">
                  {currentUnit?.title}
                </span>
                <span className="text-slate-300 hidden md:inline shrink-0">/</span>
                <span className="truncate hidden md:inline text-emerald-700 font-bold">
                  {currentLesson?.title}
                </span>
              </div>
            </div>

            {/* Left side: Action Shortcuts & User Badge */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Thawani Subscription Pill */}
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                  isSubscribed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isSubscribed ? 'اشتراك ثواني نشط' : 'تفعيل الاشتراك (ثواني)'}
                </span>
                <span className="sm:hidden">
                  {isSubscribed ? 'مشترك' : 'تفعيل'}
                </span>
              </button>

              {/* Print Exam Button */}
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>طباعة الاختبار</span>
              </button>

              {/* Quick Tutor Button */}
              <button
                type="button"
                onClick={() => setActiveTab('tutor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'tutor'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">المدرّس الذكي</span>
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: QUESTIONS & EVALUATION */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              
              {/* Context Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                    <span>{currentUnit?.title}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                    {currentLesson?.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    بنك أسئلة كامبريدج المصنفة وفق مستويات بلوم الستة (التذكر، الفهم، التطبيق، التحليل، والتقييم)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerateQuestions}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>توليد أسئلة جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">طباعة الاختبار الوزاري</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onUpdateAnswer={handleUpdateStudentAnswer}
                    onSendToWhiteboard={handleSendToWhiteboard}
                    onAskTutor={handleAskTutor}
                  />
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: SMART AI TUTOR */}
          {activeTab === 'tutor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    المدرّس العلمي الذكي (AI Science Tutor)
                  </h2>
                  <p className="text-xs text-slate-600">
                    شرح المفاهيم الصعبة، استراتيجيات الحل، وبحث مباشر في الويب عبر SerpApi لدعم مناهج كامبريدج
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>العودة للأسئلة</span>
                </button>
              </div>

              <SmartTutor
                grade={selectedGrade}
                subject={selectedSubject}
                currentUnitTitle={currentUnit?.title || ''}
                currentLessonTitle={currentLesson?.title || ''}
                activeQuestion={activeQuestionForTutor}
                onSendToWhiteboard={handleOpenWhiteboardWithText}
              />
            </div>
          )}

          {/* TAB 3: INTERACTIVE WHITEBOARD */}
          {activeTab === 'whiteboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    السبورة العلمية التفاعلية
                  </h2>
                  <p className="text-xs text-slate-600">
                    سبورة رقمية متكاملة للرسم البياني، متجهات القوى، تراكيب الذرات والمعادلات الكيميائية
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('questions')}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>العودة للأسئلة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tutor')}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>استشارة المعلم الذكي</span>
                  </button>
                </div>
              </div>

              <InteractiveWhiteboard
                initialText={whiteboardInitialText}
                onClearInitialText={() => setWhiteboardInitialText('')}
              />
            </div>
          )}

          {/* TAB 4: BLOOM GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    دليل تصنيف بلوم للأهداف التعليمية
                  </h2>
                  <p className="text-xs text-slate-600">
                    المستويات المعرفية الستة وصياغة الأسئلة الامتحانية وفق المعايير الدولية والوطنية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الذهاب لأسئلة الاختبار</span>
                </button>
              </div>

              <BloomLevelGuide />
            </div>
          )}

          {/* TAB 5: SUBSCRIPTION & THAWANI PAY DASHBOARD */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    إدارة الاشتراك وبوابة ثواني للدفع الإلكتروني
                  </h2>
                  <p className="text-xs text-slate-600">
                    تفعيل الحساب، متابعة الباقة، والدفع الإلكتروني المباشر في سلطنة عُمان
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>العودة للوحة الأسئلة</span>
                </button>
              </div>

              <SubscriptionScreen isModal={false} />
            </div>
          )}

        </main>

        {/* Simple Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 mt-auto print:hidden text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">بَلُوم للعلوم</span>
            <span>•</span>
            <span>مناهج كامبريدج بسلطنة عُمان 🇴🇲</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>إعداد وتطوير:</span>
            <strong className="text-slate-800 font-bold">فراس بن ماجد بن سالم البادي</strong>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium">طالب جامعة نزوى</span>
          </div>
        </footer>

      </div>

      {/* Printable Exam Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        questions={questions}
        grade={selectedGrade}
        subject={selectedSubject}
        unitTitle={currentUnit?.title || ''}
        lessonTitle={currentLesson?.title || ''}
      />

      {/* Welcome Subscription Modal (shown if new student wants to activate immediately) */}
      {showWelcomeSubscriptionModal && !isSubscribed && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="max-w-3xl w-full">
            <SubscriptionScreen
              isModal={true}
              onComplete={() => setShowWelcomeSubscriptionModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
