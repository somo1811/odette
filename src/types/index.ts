export interface OdetteTargetProfile {
  recitalName: string;
  stageDate: string; // YYYY-MM-DD
  roleName: string;
  heightCm: number;
  targetWeight: number; // kg
  targetBodyFat: number; // %
  targetMuscleMass: number; // kg
  targetSplitsDeg: number; // e.g. 180 (左右開脚)
  targetFrontSplitsDeg: number; // e.g. 180 (前後開脚)
  targetTurnoutDeg: number; // e.g. 175 (ターンアウト)
  targetCambreDeg: number; // e.g. 145 (カンブレ後屈)
  notes?: string;
}

export interface BodyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFat: number;
  muscleMass: number;
  condition: 'excellent' | 'good' | 'tired' | 'bloated' | 'heavy';
  notes?: string;
}

export interface PFCBalance {
  proteinGrams: string;
  fatGrams: string;
  carbsGrams: string;
}

export interface DietitianAdvice {
  score: number; // 1 - 100
  summary: string;
  estimatedCalories: number;
  pfcBalance: PFCBalance;
  positivePoints: string[];
  improvementAdvice: string;
  timingAdvice?: string;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: '朝食' | '昼食' | 'レッスン前捕食' | '夕食' | '夜間リカバリー';
  photoUrl?: string;
  description: string;
  aiAdvice?: DietitianAdvice;
  createdAt: string;
}

export interface StretchRecord {
  id: string;
  date: string;
  splitsDeg: number; // 左右開脚 (度)
  frontSplitsRightDeg: number; // 右足前開脚 (度)
  frontSplitsLeftDeg: number; // 左足前開脚 (度)
  turnoutDeg: number; // アンドゥオール (度)
  cambreDeg: number; // カンブレ後屈 (度)
  instepScore: number; // 甲の出方 (1-10)
  completedRoutines: string[];
  notes?: string;
}

export interface LessonJournal {
  id: string;
  date: string;
  lessonType: 'バー＆センター' | 'オデットVa (第2幕)' | 'グラン・パ・ド・ドゥ' | '全幕通しリハーサル';
  durationMinutes: number;
  audioTranscript: string;
  teacherNotes: string;
  selfReflection: string;
  fatigueLevel: number; // 1 - 5
  painAreas: string[];
  createdAt: string;
}

export type ActiveTab = 'body' | 'nutrition' | 'flexibility' | 'journal';
