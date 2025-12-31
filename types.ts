
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type FeedbackLanguage = 'ES' | 'EN' | 'DE';
export type AvatarId = 'max' | 'linda';

export interface UserSettings {
  name: string;
  level: Level;
  avatar: AvatarId;
  feedbackLanguage: FeedbackLanguage;
  teacherName: string;
  darkMode: boolean;
}

export interface UserStats {
  xp: number;
  streak: number;
  dialoguesCompleted: number;
  level: number; // User gamification level
  stars: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: Level;
  role: string;
  objective: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GrammarError {
  type: string; // e.g., 'Verb Tense', 'Article', 'Preposition', 'Word Order'
  original: string;
  corrected: string;
  explanation: string;
}

export interface PronunciationIssue {
  word: string;
  targetPhoneme: string; // e.g., "/th/"
  tip: string;
}

export interface FeedbackData {
  score: number;
  summary: string;
  pronunciationAnalysis: PronunciationIssue[];
  grammarAnalysis: GrammarError[];
  positivePoints: string[];
  practicePhrases: string[];
  skillRadar?: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    coherence: number;
  };
  missionObjectives?: {
    objective: string;
    completed: boolean;
  }[];
}

export enum AppStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  PROCESSING_FEEDBACK = 'processing_feedback',
  FEEDBACK_READY = 'feedback_ready',
  ERROR = 'error'
}
