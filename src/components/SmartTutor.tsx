import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Grade, Subject, Question, TutorMode, WebSource } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  HelpCircle, 
  Calculator, 
  FlaskConical, 
  PenTool, 
  RotateCcw,
  BookOpen,
  Globe,
  ExternalLink,
  Search
} from 'lucide-react';
import { SUBJECT_METADATA } from '../data/curriculumData';

interface SmartTutorProps {
  grade: Grade;
  subject: Subject;
  unitTitle: string;
  lessonTitle: string;
  activeQuestion?: Question | null;
  onOpenWhiteboardWithText?: (text: string) => void;
}

export const SmartTutor: React.FC<SmartTutorProps> = ({
  grade,
  subject,
  unitTitle,
  lessonTitle,
  activeQuestion,
  onOpenWhiteboardWithText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'tutor',
      text: `مرحباً بك يا بطل العلوم! أنا "معلمك الذكي" لمناهج كامبريدج في سلطنة عمان.
أنا هنا لمساعدتك في فهم المفاهيم الصعبة لمادة ${SUBJECT_METADATA[subject].nameAr} للصف ${grade === 10 ? 'العاشر' : grade === 11 ? 'الحادي عشر' : 'الثاني عشر'}، حل المسائل خطوة بخطوة، أو الاستعداد للتجارب العملية.

✨ ميزة البحث المباشر في الويب (SerpApi) مفعّلة لجلب أحدث الاكتشافات والمعلومات العلمية فوراً! ما الذي تود أن نبدأ به اليوم؟`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<TutorMode>('explain');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState<boolean>(true);
  const [hasSerpApiKey, setHasSerpApiKey] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check health and SerpApi status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasSerpApiKey === 'boolean') {
          setHasSerpApiKey(data.hasSerpApiKey);
        }
      })
      .catch((err) => console.warn('Health check fetch error:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // If activeQuestion changes and was set from a question card, add a prompt
  useEffect(() => {
    if (activeQuestion) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ref-${Date.now()}`,
          sender: 'tutor',
          text: `لقد حددت السؤال رقم (${activeQuestion.number}) [${activeQuestion.bloomLevelArabic}]:
"${activeQuestion.questionText}"

كيف تحب أن نتعاون في حله؟ هل تريد شرحاً للمفهوم، أم تفضل أن أعطيك تلميحاً سقراطياً لتبدأ الحل بنفسك؟`,
          timestamp: Date.now(),
          questionReferenceId: activeQuestion.id,
        },
      ]);
    }
  }, [activeQuestion]);

  // Audio Speech Synthesis for Arabic
  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    if (isSpeaking && speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown asterisks and code blocks for smoother speech
    const cleanText = text.replace(/[*#`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setIsSpeaking(true);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/smart-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages,
          enableWebSearch: isWebSearchEnabled,
          context: {
            grade,
            subject: SUBJECT_METADATA[subject].nameAr,
            unitTitle,
            lessonTitle,
            mode,
            currentQuestion: activeQuestion || undefined,
          },
        }),
      });

      const data = await response.json();
      const tutorReply = data.reply || 'شكراً على سؤالك يا بطل! لنواصل التفكير معاً.';

      const tutorMsg: ChatMessage = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: tutorReply,
        timestamp: Date.now(),
        mode,
        isWebSearchUsed: !!data.isWebSearchUsed,
        webSources: data.webSources || [],
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          sender: 'tutor',
          text: 'أعتذر عن التأخير البسيط في الإجابة. تذكر دائماً مراجعة القوانين الفيزيائية والمعادلات الكيميائية الأساسية، وجرّب صياغة سؤالك بصورة أخرى وسأساعدك فوراً!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'tutor',
        text: `تم بدء جلسة جديدة. أنا مستعد لمساعدتك في مادة ${SUBJECT_METADATA[subject].nameAr}. اسألني عن أي قانون، ظاهرة، أو مسألة!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const quickPills = [
    { label: '🌐 أحدث الاكتشافات العلمية', prompt: `ابحث في الإنترنت عن أحدث الاكتشافات العلمية والتطبيقات الحديثة لدرس (${lessonTitle}).` },
    { label: '🇴🇲 أحدث المشاريع في سلطنة عُمان', prompt: `ابحث في الإنترنت عن مشاريع سلطنة عُمان الحديثة والمبادرات الوطنية المرتبطة بموضوع (${lessonTitle}).` },
    { label: '🌟 شرح مبسط للمفهوم', prompt: `اشرح لي درس (${lessonTitle}) بأسلوب مبسط مدعوماً بأمثلة تطبيقية.` },
    { label: '💡 تلميح سقراطي', prompt: 'اطرح عليّ أسئلة سقراطية متدرجة تقودني لاكتشاف الحل بنفسي.' },
    { label: '📐 مسألة تطبيقية خطوة بخطوة', prompt: 'أعطني مسألة حسابية نموذجية على هذا الدرس مع خطوات الحل التفصيلية.' },
    { label: '🔬 تجربة معملية ومصادر الخطأ', prompt: 'ما هي التجربة المعملية الرئيسية لهذا الدرس وما أبرز مصادر الخطأ التجريبي واحتياطات السلامة؟' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px] overflow-hidden">
      
      {/* Tutor Top Banner */}
      <div className="bg-linear-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 backdrop-blur-xs">
              <Bot className="w-7 h-7" />
            </div>
            <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg text-white font-['Tajawal']">
                المعلّم الذكي
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950">
                مناهج عُمان
              </span>
            </div>
            <p className="text-xs text-teal-200">
              الصف {grade} • {SUBJECT_METADATA[subject].nameAr} • {lessonTitle || 'الدرس المختار'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SerpApi Search Toggle */}
          <button
            type="button"
            onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
            title={isWebSearchEnabled ? 'بحث الويب المباشر نشط (SerpApi) - انقر للتعطيل' : 'انقر لتفعيل البحث المباشر في الويب (SerpApi)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isWebSearchEnabled
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30 shadow-xs'
                : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isWebSearchEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">بحث الويب (SerpApi):</span>
            <span className={isWebSearchEnabled ? 'text-emerald-300' : 'text-slate-400'}>
              {isWebSearchEnabled ? 'مفعّل' : 'معطّل'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            title="مسح المحادثة وبدء جلسة جديدة"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-500 font-bold shrink-0 ml-1">أسلوب الشرح:</span>
        <button
          type="button"
          onClick={() => setMode('explain')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            mode === 'explain'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>شرح وتبسيط</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('socratic')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            mode === 'socratic'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>توجيه سقراطي (تلميحات)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('step_by_step')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            mode === 'step_by_step'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>خطوات الحل الرياضي</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('lab')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            mode === 'lab'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>التجارب والمختبر</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isTutor ? '' : 'flex-row-reverse'}`}
            >
              {isTutor ? (
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                  طالب
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                  isTutor
                    ? 'bg-white border border-slate-200 text-slate-900 rounded-tr-xs'
                    : 'bg-teal-700 text-white rounded-tl-xs font-medium'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* SerpApi Real-time Web Sources */}
                {isTutor && msg.isWebSearchUsed && msg.webSources && msg.webSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 bg-emerald-50/60 -mx-4 -mb-4 p-3 rounded-b-2xl border-t border-emerald-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>أحدث المعلومات والمصادر المباشرة من الإنترنت (SerpApi):</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.webSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-emerald-200/90 hover:border-emerald-400 hover:bg-emerald-50 text-xs transition-all group shadow-2xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-1">
                              {source.title}
                            </div>
                            {source.snippet && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                {source.snippet}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mt-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tutor Message Utility Toolbar */}
                {isTutor && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors ${
                          speakingMessageId === msg.id ? 'text-teal-700 font-bold' : ''
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                            <span>إيقاف الصوت</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>استمع للشرح</span>
                          </>
                        )}
                      </button>

                      {onOpenWhiteboardWithText && (
                        <button
                          type="button"
                          onClick={() => onOpenWhiteboardWithText(msg.text)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>رسم على السبورة</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-700">
                      {new Date(msg.timestamp).toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tr-xs p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              <span className="mr-1 font-medium flex items-center gap-1.5">
                {isWebSearchEnabled ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>المعلم الذكي يبحث في الإنترنت (SerpApi) ويصيغ الإجابة...</span>
                  </>
                ) : (
                  <span>المعلم الذكي يكتب الإجابة...</span>
                )}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pills Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-700 shrink-0 ml-1">اقتراحات سريعة:</span>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(pill.prompt)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 whitespace-nowrap transition-colors shrink-0 font-medium"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="tutor-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اطرح سؤالك على المعلم الذكي (مثال: اشرح لي تجربة حساب التسارع...)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
          />
          <button
            id="tutor-send-btn"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-2.5 rounded-xl text-white shadow-xs transition-all ${
              !inputText.trim() || isTyping
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 active:scale-95 shadow-teal-700/20'
            }`}
          >
            <Send className="w-5 h-5 rtl:rotate-180" />
          </button>
        </form>
      </div>

    </div>
  );
};
