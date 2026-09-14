import React, { useState, useEffect } from 'react';
import { Grade, Subject, BloomLevel } from '../types';
import { OMANI_CURRICULUM, SUBJECT_METADATA, BLOOM_LEVELS } from '../data/curriculumData';
import { BookOpen, Layers, CheckCircle2, Wand2, Atom, FlaskConical, Dna, Filter } from 'lucide-react';

interface CurriculumSelectorProps {
  selectedGrade: Grade;
  selectedSubject: Subject;
  selectedUnitId: string;
  selectedLessonId: string;
  customTopic: string;
  selectedBloomLevels: BloomLevel[];
  isGenerating: boolean;
  onGradeChange: (grade: Grade) => void;
  onSubjectChange: (subject: Subject) => void;
  onUnitChange: (unitId: string) => void;
  onLessonChange: (lessonId: string) => void;
  onCustomTopicChange: (topic: string) => void;
  onToggleBloomLevel: (level: BloomLevel) => void;
  onGenerate: () => void;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  selectedGrade,
  selectedSubject,
  selectedUnitId,
  selectedLessonId,
  customTopic,
  selectedBloomLevels,
  isGenerating,
  onGradeChange,
  onSubjectChange,
  onUnitChange,
  onLessonChange,
  onCustomTopicChange,
  onToggleBloomLevel,
  onGenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Find curriculum data for the selected grade and subject
  const currentCurriculum = OMANI_CURRICULUM.find(
    (c) => c.grade === selectedGrade && c.subject === selectedSubject
  );

  const units = currentCurriculum?.units || [];
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const lessons = currentUnit?.lessons || [];
  const currentLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  // Auto-sync when grade or subject changes if current unit/lesson does not belong
  useEffect(() => {
    if (units.length > 0) {
      if (!units.some((u) => u.id === selectedUnitId)) {
        onUnitChange(units[0].id);
        if (units[0].lessons.length > 0) {
          onLessonChange(units[0].lessons[0].id);
        }
      }
    }
  }, [selectedGrade, selectedSubject, units, selectedUnitId, onUnitChange, onLessonChange]);

  useEffect(() => {
    if (currentUnit && currentUnit.lessons.length > 0) {
      if (!currentUnit.lessons.some((l) => l.id === selectedLessonId)) {
        onLessonChange(currentUnit.lessons[0].id);
      }
    }
  }, [currentUnit, selectedLessonId, onLessonChange]);

  const subjectIcons: Record<Subject, React.ReactNode> = {
    physics: <Atom className="w-5 h-5" />,
    chemistry: <FlaskConical className="w-5 h-5" />,
    biology: <Dna className="w-5 h-5" />,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-6">
      
      {/* Top Bar: Grade and Subject Selection */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-5 border-b border-slate-100">
        
        {/* Grade Selection */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. حدد الصف الدراسي (المرحلة الثانوية)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([10, 11, 12] as Grade[]).map((g) => {
              const isSelected = selectedGrade === g;
              return (
                <button
                  key={g}
                  id={`grade-btn-${g}`}
                  type="button"
                  onClick={() => onGradeChange(g)}
                  className={`py-2.5 px-3 rounded-xl text-center font-bold text-sm transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>الصف {g === 10 ? 'العاشر' : g === 11 ? 'الحادي عشر' : 'الثاني عشر'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selection */}
        <div className="md:col-span-7">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. حدد المادة العلمية (مناهج كامبريدج - سلطنة عُمان)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['physics', 'chemistry', 'biology'] as Subject[]).map((sub) => {
              const isSelected = selectedSubject === sub;
              const meta = SUBJECT_METADATA[sub];
              return (
                <button
                  key={sub}
                  id={`subject-btn-${sub}`}
                  type="button"
                  onClick={() => onSubjectChange(sub)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all border ${
                    isSelected
                      ? `${sub === 'physics' ? 'bg-blue-600 border-blue-600' : sub === 'chemistry' ? 'bg-purple-600 border-purple-600' : 'bg-emerald-700 border-emerald-700'} text-white shadow-sm ring-2 ring-slate-200`
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {subjectIcons[sub]}
                  <span>{meta.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Middle Bar: Unit and Lesson Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        
        {/* Unit Dropdown */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>3. اختر الوحدة الدراسية:</span>
          </label>
          <select
            id="unit-select"
            value={selectedUnitId}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-colors"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.title} (الفصل {unit.semester === 1 ? 'الأول' : 'الثاني'})
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Dropdown */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>4. اختر الدرس المحدد:</span>
          </label>
          <select
            id="lesson-select"
            value={selectedLessonId}
            onChange={(e) => onLessonChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-colors"
          >
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Current Lesson Learning Outcomes Preview */}
      {currentLesson?.outcomes && currentLesson.outcomes.length > 0 && (
        <div className="mt-3.5 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-900">
              مخرجات التعلم المستهدفة في منهج كامبريدج:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentLesson.outcomes.map((outcome, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white text-emerald-800 border border-emerald-200"
              >
                {outcome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filter: Bloom levels filter & Custom Topic */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'إخفاء تخصيص مستويات بلوم' : 'تخصيص مستويات بلوم المستهدفة أو كتابة مفهوم مخصص'}</span>
          </button>

          {/* Generate Button */}
          <button
            id="generate-questions-btn"
            type="button"
            disabled={isGenerating}
            onClick={onGenerate}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm text-white shadow-md transition-all ${
              isGenerating
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 active:scale-98'
            }`}
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating ? 'جارٍ توليد الأسئلة ونموذج الإجابة...' : 'توليد 5 أسئلة مصنفة حسب بلوم'}
            </span>
          </button>

        </div>

        {/* Collapsible Advanced Section */}
        {showAdvanced && (
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Custom concept */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مفهوم دقيق أو مسألة معينة (اختياري):
              </label>
              <input
                id="custom-topic-input"
                type="text"
                value={customTopic}
                onChange={(e) => onCustomTopicChange(e.target.value)}
                placeholder="مثال: التصادم المرن وحساب السرعة النهائية، أو تفاعل المعايرة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Bloom Levels Badges Selector */}
            <div className="md:col-span-7">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تصفية مستويات بلوم المستهدفة (اتركها فارغة للتوزيع المتوازن عبر المستويات الستة):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(BLOOM_LEVELS) as BloomLevel[]).map((lvl) => {
                  const info = BLOOM_LEVELS[lvl];
                  const isSelected = selectedBloomLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onToggleBloomLevel(lvl)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all ${
                        isSelected
                          ? `${info.bgColor} ${info.color} ${info.borderColor} ring-1 ring-offset-1 ring-slate-300`
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80'
                      }`}
                    >
                      {info.nameAr}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
