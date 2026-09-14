import React from 'react';
import { BLOOM_LEVELS } from '../data/curriculumData';
import { BloomLevel } from '../types';
import { Award, BookOpen, Lightbulb, CheckCircle, BrainCircuit } from 'lucide-react';

export const BloomLevelGuide: React.FC = () => {
  const levels = Object.keys(BLOOM_LEVELS) as BloomLevel[];

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl text-white p-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <BrainCircuit className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-xs font-bold">
                الإطار التربوي
              </span>
              <span className="text-purple-200 text-xs">مناهج كامبريدج - سلطنة عُمان</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              هرم بلوم المعرفي لتصنيف مستويات التعلم والتقييم
            </h2>
            <p className="text-sm text-purple-100 mt-1 max-w-3xl leading-relaxed">
              يُعتبر تصنيف بلوم المعدّل الركيزة الأساسية في صياغة أسئلة الامتحانات الوطنية والدولية لمادتي الفيزياء والكيمياء والأحياء. يتدرج التصنيف من المهارات الإدراكية الدنيا (التذكر والفهم) وصولاً إلى المهارات العليا (التحليل والتقييم والابتكار).
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 6 Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((lvl) => {
          const info = BLOOM_LEVELS[lvl];
          return (
            <div
              key={lvl}
              className={`rounded-2xl border ${info.borderColor} bg-white shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div>
                {/* Level Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg ${info.bgColor} ${info.color} flex items-center justify-center font-black text-sm border ${info.borderColor}`}>
                      {info.order}
                    </span>
                    <h3 className={`font-black text-base ${info.color}`}>
                      {info.nameAr}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-600 uppercase">
                    {info.nameEn}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {info.description}
                </p>

                {/* Action Verbs */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600" />
                    <span>أفعال الأهداف الامتحانية:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {info.actionVerbs.map((verb, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${info.bgColor} ${info.color}`}
                      >
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Example Question Stem */}
              <div className="pt-3 border-t border-slate-100 mt-2 bg-slate-50/70 p-2.5 rounded-xl text-xs">
                <div className="text-slate-700 font-bold mb-1 flex items-center gap-1 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>مثال وزاري نموذجي:</span>
                </div>
                <p className="text-slate-800 italic leading-snug">
                  "{info.exampleStem}"
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Advice for Omani students */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex items-start gap-3">
        <Award className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-950">
          <h4 className="font-bold text-emerald-900 mb-1">
            نصيحة ذهبية لطلاب دبلوم التعليم العام والصفوف (10، 11، 12):
          </h4>
          <p className="leading-relaxed">
            امتحانات العلوم لا تكتفي بأسئلة التذكر المباشر، بل تركز بنسبة تفوق 60% على التطبيق وحل المسائل وتحليل المنحنيات البيانية وتقييم خطوات التجارب المعملية. استعن بـ <strong>المعلم الذكي</strong> لمساعدتك في استخراج المعطيات وتطبيق القوانين، واستخدم <strong>السبورة التفاعلية</strong> للرسم البياني وتوضيح مخططات القوى والتراكيب الجزيئية.
          </p>
        </div>
      </div>

    </div>
  );
};
