import React, { useState } from 'react';
import { Question, Grade, Subject } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumData';
import { Printer, X, CheckSquare, FileText, Download } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  grade: Grade;
  subject: Subject;
  unitTitle: string;
  lessonTitle: string;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  questions,
  grade,
  subject,
  unitTitle,
  lessonTitle,
}) => {
  const [includeModelAnswers, setIncludeModelAnswers] = useState(false);

  if (!isOpen) return null;

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Controls Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">معاينة وطباعة ورقة الاختبار (نموذج سلطنة عُمان)</h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                checked={includeModelAnswers}
                onChange={(e) => setIncludeModelAnswers(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>إرفاق نموذج الإجابة في نهاية الورقة</span>
            </label>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Examination Paper Preview */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 bg-white font-['Tajawal']" id="printable-exam-paper">
          
          {/* Omani Official Exam Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between text-center mb-3">
              <div className="text-right text-xs leading-relaxed font-bold">
                <p>سلطنة عُمان</p>
                <p>وزارة التربية والتعليم</p>
                <p>المديرية العامة للمناهج</p>
              </div>

              <div className="text-center">
                <h1 className="text-xl font-black text-slate-900">
                  اختبار تقويمي وفق مستويات بلوم
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  مناهج كامبريدج للعلوم • العام الدراسي 2026 / 2027 م
                </p>
              </div>

              <div className="text-left text-xs leading-relaxed font-bold">
                <p>الصف: {grade === 10 ? 'العاشر' : grade === 11 ? 'الحادي عشر' : 'الثاني عشر'}</p>
                <p>المادة: {SUBJECT_METADATA[subject].nameAr}</p>
                <p>الزمن: 45 دقيقة</p>
              </div>
            </div>

            {/* Student Info Table */}
            <div className="grid grid-cols-12 border border-slate-400 text-xs font-bold divide-x divide-slate-400 rtl:divide-x-reverse bg-slate-50/60">
              <div className="col-span-6 p-2">اسم الطالب: ................................................................</div>
              <div className="col-span-3 p-2">الشعبة: ..............</div>
              <div className="col-span-3 p-2 text-emerald-800 font-black">الدرجة الكلية: [ {totalMarks} درجات ]</div>
            </div>

            {/* Scope */}
            <div className="mt-2 text-xs text-slate-600 font-medium">
              <span>الوحدة: {unitTitle}</span> • <span>الدرس: {lessonTitle}</span>
            </div>
          </div>

          {/* Exam Questions */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="border-b border-slate-200 pb-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="text-sm font-bold leading-relaxed">
                    <span className="font-black text-slate-950 ml-1">س {idx + 1})</span>
                    <span>{q.questionText}</span>
                  </div>
                  <div className="shrink-0 text-xs font-bold border border-slate-400 px-2 py-0.5 rounded bg-slate-50 text-slate-800">
                    [{q.marks} درجات] • {q.bloomLevelArabic}
                  </div>
                </div>

                {q.contextOrData && (
                  <div className="my-2 p-2.5 border border-dashed border-slate-300 rounded text-xs font-mono bg-slate-50">
                    {q.contextOrData}
                  </div>
                )}

                {/* Empty Lines for student writing */}
                <div className="mt-3 space-y-3 pt-1">
                  <div className="border-b border-dashed border-slate-300 h-4" />
                  <div className="border-b border-dashed border-slate-300 h-4" />
                  <div className="border-b border-dashed border-slate-300 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Exam Sheet Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>منصة بلوم للعلوم • مناهج كامبريدج - سلطنة عُمان</span>
            <span>إعداد وتطوير: فراس بن ماجد بن سالم البادي (طالب جامعة نزوى)</span>
          </div>

          {/* Optional Model Answers Attached Sheet */}
          {includeModelAnswers && (
            <div className="mt-12 pt-8 border-t-4 border-slate-900 page-break-before">
              <div className="text-center mb-6">
                <h2 className="text-lg font-black text-slate-900">
                  ملحق نموذج الإجابة وسلم توزيع الدرجات الرسمي
                </h2>
                <p className="text-xs text-slate-600">
                  خاص بالمعلم / التقييم الذاتي
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 border border-slate-300 rounded-lg text-xs leading-relaxed">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      <span>س {idx + 1} - مستوى بلوم: {q.bloomLevelArabic}</span>
                      <span>الدرجة: {q.marks}</span>
                    </div>
                    <div className="font-medium whitespace-pre-line text-slate-800 mb-2">
                      <strong className="text-blue-900">الإجابة النموذجية: </strong>
                      {q.modelAnswer}
                    </div>
                    {q.criteria && q.criteria.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700">
                        <strong className="text-emerald-900">معايير التصحيح: </strong>
                        {q.criteria.join(' | ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
