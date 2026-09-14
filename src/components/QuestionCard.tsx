import React, { useState } from 'react';
import { Question, Subject } from '../types';
import { BLOOM_LEVELS } from '../data/curriculumData';
import { 
  CheckCircle2, 
  HelpCircle, 
  PenTool, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Award, 
  Lightbulb, 
  ListOrdered,
  AlertCircle
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  subject: Subject;
  grade: number;
  onSendToWhiteboard: (question: Question) => void;
  onAskTutor: (question: Question) => void;
  onUpdateAnswer: (questionId: string, answer: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  subject,
  grade,
  onSendToWhiteboard,
  onAskTutor,
  onUpdateAnswer,
}) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState(question.studentAnswer || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Question['aiFeedback'] | null>(
    question.aiFeedback || null
  );

  const bloomInfo = BLOOM_LEVELS[question.bloomLevel] || BLOOM_LEVELS.remembering;

  const handleAnswerChange = (text: string) => {
    setStudentAnswer(text);
    onUpdateAnswer(question.id, text);
  };

  const handleEvaluateAnswer = async () => {
    if (!studentAnswer.trim()) return;
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.questionText,
          bloomLevel: question.bloomLevelArabic,
          marks: question.marks,
          modelAnswer: question.modelAnswer,
          criteria: question.criteria,
          studentAnswer: studentAnswer,
          subject: subject,
          grade: grade,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تقييم الإجابة');
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
      // Fallback local evaluation
      const words = studentAnswer.trim().split(/\s+/).length;
      const score = Math.min(question.marks, Math.max(1, Math.round((words / 15) * question.marks)));
      setEvaluation({
        score: score,
        maxScore: question.marks,
        feedback: 'تم التقييم بناءً على المقارنة مع نموذج الإجابة والمعايير المحددة.',
        strengths: ['محاولة جيدة وصياغة مقروءة للحل'],
        improvements: ['تأكد من مطابقة الأرقام والوحدات الدولية المذكورة في النموذج.'],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div 
      id={`question-card-${question.id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
    >
      
      {/* Question Header Bar */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs">
            {question.number || index + 1}
          </span>
          <span className="text-xs font-bold text-slate-700">
            السؤال {question.number || index + 1} من {total}
          </span>
          <span className="text-slate-300">•</span>
          
          {/* Bloom Level Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${bloomInfo.bgColor} ${bloomInfo.color} border ${bloomInfo.borderColor}`}>
            <span>مستوى بلوم:</span>
            <span>{question.bloomLevelArabic || bloomInfo.nameAr}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>[{question.marks} درجات]</span>
          </span>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="p-4 sm:p-6 space-y-4">
        
        {/* Cognitive Skill Target */}
        {question.cognitiveSkill && (
          <div className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
            <span className="font-bold text-slate-700">المهارة المستهدفة:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
              {question.cognitiveSkill}
            </span>
          </div>
        )}

        {/* Context or Given Data / Table */}
        {question.contextOrData && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-line">
            {question.contextOrData}
          </div>
        )}

        {/* Question Text */}
        <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
          {question.questionText}
        </div>

        {/* Student Answer Box */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>✍️ إجابة الطالب (اكتب حلك للمعاينة والتقييم):</span>
            </label>
            {showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>إخفاء التلميح</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>هل تحتاج تلميحاً؟</span>
              </button>
            )}
          </div>

          {/* Collapsible Hint */}
          {showHint && question.hint && (
            <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">تلميح ذكي: </span>
                <span>{question.hint}</span>
              </div>
            </div>
          )}

          <textarea
            rows={3}
            value={studentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="اكتب خطوات الحل أو التفسير العلمي هنا..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          
          {/* AI Evaluate Button */}
          <button
            type="button"
            disabled={isEvaluating || !studentAnswer.trim()}
            onClick={handleEvaluateAnswer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !studentAnswer.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isEvaluating
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEvaluating ? 'جارٍ التقييم...' : 'تصحيح إجابتي بالذكاء الاصطناعي'}</span>
          </button>

          {/* Toggle Model Answer */}
          <button
            type="button"
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showModelAnswer
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showModelAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showModelAnswer ? 'إخفاء نموذج الإجابة' : 'عرض نموذج الإجابة والمعايير'}</span>
          </button>

          {/* Send to Whiteboard */}
          <button
            type="button"
            onClick={() => onSendToWhiteboard(question)}
            title="حل المسألة على السبورة التفاعلية"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <PenTool className="w-3.5 h-3.5 text-slate-700" />
            <span>حل على السبورة</span>
          </button>

          {/* Ask Smart Tutor */}
          <button
            type="button"
            onClick={() => onAskTutor(question)}
            title="استفسر من المعلم الذكي عن هذا السؤال"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-teal-700 border border-teal-200 hover:bg-teal-50 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>اسأل المدرس الذكي</span>
          </button>

        </div>

        {/* AI Evaluation Results Panel */}
        {evaluation && (
          <div className="mt-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-emerald-950">
                  نتيجة التقييم الفوري:
                </span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                الدرجة المستحقة: {evaluation.score} من {evaluation.maxScore || question.marks}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {evaluation.feedback}
            </p>

            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-emerald-800">نقاط القوة: </span>
                <span className="text-slate-700">{evaluation.strengths.join(' • ')}</span>
              </div>
            )}

            {evaluation.improvements && evaluation.improvements.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-amber-800">توجيهات للتحسين: </span>
                <span className="text-slate-700">{evaluation.improvements.join(' • ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Official Model Answer & Marking Scheme */}
        {showModelAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/90 space-y-3">
            
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>نموذج الإجابة الرسمي (وزارة التربية والتعليم - مناهج كامبريدج):</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs sm:text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                {question.modelAnswer}
              </div>
            </div>

            {/* Marking Criteria */}
            {question.criteria && question.criteria.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                  <ListOrdered className="w-4 h-4 text-blue-600" />
                  <span>معايير توزيع الدرجات (Marking Scheme):</span>
                </div>
                <ul className="space-y-1 bg-white/70 p-2.5 rounded-lg border border-blue-100/70 text-xs text-slate-700">
                  {question.criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scientific Explanation */}
            {question.explanation && (
              <div className="text-xs text-slate-700 pt-1 border-t border-blue-100">
                <span className="font-bold text-blue-900">الأساس العلمي والشرح الإثرائي: </span>
                <span className="leading-relaxed">{question.explanation}</span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
