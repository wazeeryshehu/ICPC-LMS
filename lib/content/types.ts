export type QuestionType =
  | "mcq"
  | "multi"
  | "true_false"
  | "fill"
  | "matching"
  | "short_answer"
  | "essay";

export interface QuestionSeed {
  type: QuestionType;
  prompt: string;
  options?: string[];
  correct?: number | number[] | boolean | string[] | Record<string, string> | string;
  explanation?: string;
  points?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface KnowledgeCheckSeed {
  title: string;
  questions: QuestionSeed[];
}

export interface LessonSeed {
  title: string;
  minutes: number;
  type?: "reading" | "video";
  videoUrl?: string;
  content: string;
}

export interface ModuleSeed {
  title: string;
  description: string;
  lessons: LessonSeed[];
  knowledgeCheck?: KnowledgeCheckSeed;
}

export interface AssignmentSeed {
  title: string;
  instructions: string;
  prompt: string;
  points: number;
}

export interface CourseSeed {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  mandatory?: boolean;
  legalDemo?: boolean;
  cpdPoints: number;
  passMark: number;
  maxAttempts: number;
  examMinutes: number;
  objectives: string[];
  prerequisites?: string[];
  instructorStaffId: string;
  modules: ModuleSeed[];
  finalExam: QuestionSeed[];
  assignment?: AssignmentSeed;
}
