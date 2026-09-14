import React, { useState, useEffect } from 'react';
import { Grade, Subject, BloomLevel, Question } from './types';
import { OMANI_CURRICULUM, SAMPLE_QUESTIONS_BANK, SUBJECT_METADATA } from './data/curriculumData';
import { Header } from './components/Header';
import { CurriculumSelector } from './components/CurriculumSelector';
import { QuestionCard } from './components/QuestionCard';
import { SmartTutor } from './components/SmartTutor';
import { InteractiveWhiteboard } from './components/InteractiveWhiteboard';
import { BloomLevelGuide } from './components/BloomLevelGuide';
import { PrintModal } from './components/PrintModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './lib/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Share2
} from 'lucide-react';

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('physics');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('g10-phy-u1');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('g10-p-l1');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [selectedBloomLevels, setSelectedBloomLevels] = useState<BloomLevel[]>([]);
  
  const [activeTab, setActiveTab] = useState<'questions' | 'tutor' | 'whiteboard' | 'guide'>('questions');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const { currentUser, userProfile } = useAuth();

  // If a student logs in, automatically match grade if set
  useEffect(() => {
    if (userProfile?.role === 'student' && userProfile.grade) {
      setSelectedGrade(userProfile.grade);
    }
  }, [userProfile]);

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
        questionText: `احسب القيمة المجهولة في تجربة مخبرية متعلقة بـ ${focus} إذا كانت المعطيات كالتالي:\n- القيمة الابتدائية = 24 وحدة قياسية\n- معدل التغير = 4.5 وحدة لكل ثانية\n- الفترة الزمنية المستغرقة = 8 ثوانٍ\nاحسب الناتج النهائي مع توضيح خطوات التعويض وكتابة الوحدة الدولية.`,
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Tajawal',sans-serif] text-slate-900">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <p className="text-xs sm:text-sm font-bold leading-relaxed">
              {notification.text}
            </p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        grade={selectedGrade}
        subject={selectedSubject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Questions & Assessment */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            
            {/* Curriculum Selector Toolbar */}
            <CurriculumSelector
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedUnitId={selectedUnitId}
              selectedLessonId={selectedLessonId}
              customTopic={customTopic}
              selectedBloomLevels={selectedBloomLevels}
              isGenerating={isGenerating}
              onGradeChange={(g) => {
                setSelectedGrade(g);
                // When grade changes, find first unit
                const curr = OMANI_CURRICULUM.find((c) => c.grade === g && c.subject === selectedSubject);
                if (curr && curr.units.length > 0) {
                  setSelectedUnitId(curr.units[0].id);
                  if (curr.units[0].lessons.length > 0) {
                    setSelectedLessonId(curr.units[0].lessons[0].id);
                  }
                }
              }}
              onSubjectChange={(s) => {
                setSelectedSubject(s);
                const curr = OMANI_CURRICULUM.find((c) => c.grade === selectedGrade && c.subject === s);
                if (curr && curr.units.length > 0) {
                  setSelectedUnitId(curr.units[0].id);
                  if (curr.units[0].lessons.length > 0) {
                    setSelectedLessonId(curr.units[0].lessons[0].id);
                  }
                }
              }}
              onUnitChange={setSelectedUnitId}
              onLessonChange={setSelectedLessonId}
              onCustomTopicChange={setCustomTopic}
              onToggleBloomLevel={handleToggleBloomLevel}
              onGenerate={handleGenerateQuestions}
            />

            {/* Questions Header & Bloom Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-black text-slate-900">
                    بنك الأسئلة التقويمية المصنفة (5 أسئلة معتمدة)
                  </h2>
                </div>
                <p className="text-xs text-slate-700">
                  موزعة حسب مستويات بلوم الستة • مجهزة بنماذج الإجابة وسلم الدرجات الوزاري
                </p>
              </div>

              {/* Quick Action Badges */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('whiteboard')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  <PenTool className="w-3.5 h-3.5 text-slate-700" />
                  <span>فتح السبورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tutor')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition-all border border-teal-200"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span>المدرس الذكي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>طباعة الاختبار</span>
                </button>
              </div>
            </div>

            {/* Questions Cards List */}
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <QuestionCard
                  key={q.id || idx}
                  question={q}
                  index={idx}
                  total={questions.length}
                  subject={selectedSubject}
                  grade={selectedGrade}
                  onSendToWhiteboard={handleSendToWhiteboard}
                  onAskTutor={handleAskTutor}
                  onUpdateAnswer={handleUpdateStudentAnswer}
                />
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: Smart Science Tutor */}
        {activeTab === 'tutor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  نافذة المدرس الذكي
                </h2>
                <p className="text-xs text-slate-700">
                  مستشارك التربوي التفاعلي لمناهج سلطنة عُمان لمواد الفيزياء والكيمياء والأحياء
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>العودة للأسئلة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('whiteboard')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>السبورة التفاعلية</span>
                </button>
              </div>
            </div>

            <SmartTutor
              grade={selectedGrade}
              subject={selectedSubject}
              unitTitle={currentUnit?.title || ''}
              lessonTitle={currentLesson?.title || ''}
              activeQuestion={activeQuestionForTutor}
              onOpenWhiteboardWithText={handleOpenWhiteboardWithText}
            />
          </div>
        )}

        {/* TAB 3: Interactive Whiteboard */}
        {activeTab === 'whiteboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  السبورة العلمية التفاعلية
                </h2>
                <p className="text-xs text-slate-700">
                  سبورة رقمية متكاملة للرسم البياني، متجهات القوى، تراكيب الذرات والمعادلات الكيميائية
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
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
                  <span>استشارة المدرس الذكي</span>
                </button>
              </div>
            </div>

            <InteractiveWhiteboard
              initialText={whiteboardInitialText}
              onClearInitialText={() => setWhiteboardInitialText('')}
            />
          </div>
        )}

        {/* TAB 4: Bloom Level Educational Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  دليل تصنيف بلوم للأهداف التعليمية
                </h2>
                <p className="text-xs text-slate-700">
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

      </main>

      {/* Printable Exam Paper Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        questions={questions}
        grade={selectedGrade}
        subject={selectedSubject}
        unitTitle={currentUnit?.title || ''}
        lessonTitle={currentLesson?.title || ''}
      />

      {/* Login & Register Authentication Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-right">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">بلوم للعلوم</span>
              <span>•</span>
              <span>مبادرة تعليمية ذكية لطلبة المرحلة الثانوية بسلطنة عُمان 🇴🇲</span>
            </div>
            <div className="hidden sm:inline text-slate-300">•</div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-200 font-medium">
              <span>إعداد وتطوير:</span>
              <strong className="font-bold text-emerald-950">فراس بن ماجد بن سالم البادي</strong>
              <span className="text-emerald-400">|</span>
              <span className="text-emerald-800">طالب جامعة نزوى</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span>الفيزياء • الكيمياء • الأحياء</span>
            <span>•</span>
            <span>مستويات بلوم الستة</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
