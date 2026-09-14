export type Grade = 10 | 11 | 12;

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  grade?: Grade;
  school?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Subject = 'physics' | 'chemistry' | 'biology';

export type BloomLevel = 
  | 'remembering'   // التذكر
  | 'understanding' // الفهم
  | 'applying'      // التطبيق
  | 'analyzing'     // التحليل
  | 'evaluating'    // التقييم
  | 'creating';     // الابتكار / الإبداع

export interface BloomLevelInfo {
  level: BloomLevel;
  nameAr: string;
  nameEn: string;
  order: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  actionVerbs: string[];
  exampleStem: string;
}

export interface Lesson {
  id: string;
  title: string;
  outcomes: string[];
  keyTerms?: string[];
}

export interface Unit {
  id: string;
  title: string;
  semester: 1 | 2;
  lessons: Lesson[];
}

export interface CurriculumData {
  grade: Grade;
  subject: Subject;
  subjectNameAr: string;
  units: Unit[];
}

export interface Question {
  id: string;
  number: number;
  bloomLevel: BloomLevel;
  bloomLevelArabic: string;
  cognitiveSkill: string; // e.g. "استرجاع تعريف", "حساب تسارع", "تفسير رسم بياني"
  questionText: string;
  contextOrData?: string; // situational context, table data, or diagram reference
  marks: number;
  modelAnswer: string;
  explanation: string;
  hint: string;
  criteria: string[];
  studentAnswer?: string;
  aiFeedback?: {
    score: number;
    maxScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
  mode?: 'explain' | 'socratic' | 'step_by_step' | 'lab';
  questionReferenceId?: string;
}

export type TutorMode = 'explain' | 'socratic' | 'step_by_step' | 'lab';

export interface GenerateQuestionsRequest {
  grade: Grade;
  subject: Subject;
  unitTitle: string;
  lessonTitle: string;
  focusLevels?: BloomLevel[];
  customTopic?: string;
}

export interface EvaluateAnswerRequest {
  questionText: string;
  bloomLevel: string;
  marks: number;
  modelAnswer: string;
  criteria: string[];
  studentAnswer: string;
  subject: string;
  grade: number;
}
