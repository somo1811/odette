import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BodyCompositionTab } from './components/BodyCompositionTab';
import { NutritionTab } from './components/NutritionTab';
import { FlexibilityTab } from './components/FlexibilityTab';
import { LessonJournalTab } from './components/LessonJournalTab';
import { OdetteGoalModal } from './components/OdetteGoalModal';
import { Activity, Utensils, Zap, BookOpen } from 'lucide-react';
import {
  ActiveTab,
  OdetteTargetProfile,
  BodyRecord,
  MealRecord,
  StretchRecord,
  LessonJournal,
} from './types';
import {
  DEFAULT_ODETTE_PROFILE,
  INITIAL_BODY_RECORDS,
  INITIAL_MEAL_RECORDS,
  INITIAL_STRETCH_RECORDS,
  INITIAL_LESSON_JOURNALS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('body');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistent Target Profile
  const [targetProfile, setTargetProfile] = useState<OdetteTargetProfile>(() => {
    try {
      const saved = localStorage.getItem('odette_target_profile');
      return saved ? JSON.parse(saved) : DEFAULT_ODETTE_PROFILE;
    } catch {
      return DEFAULT_ODETTE_PROFILE;
    }
  });

  // Persistent Body Records
  const [bodyRecords, setBodyRecords] = useState<BodyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('odette_body_records');
      return saved ? JSON.parse(saved) : INITIAL_BODY_RECORDS;
    } catch {
      return INITIAL_BODY_RECORDS;
    }
  });

  // Persistent Meal Records
  const [mealRecords, setMealRecords] = useState<MealRecord[]>(() => {
    try {
      const saved = localStorage.getItem('odette_meal_records');
      return saved ? JSON.parse(saved) : INITIAL_MEAL_RECORDS;
    } catch {
      return INITIAL_MEAL_RECORDS;
    }
  });

  // Persistent Stretch Records
  const [stretchRecords, setStretchRecords] = useState<StretchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('odette_stretch_records');
      return saved ? JSON.parse(saved) : INITIAL_STRETCH_RECORDS;
    } catch {
      return INITIAL_STRETCH_RECORDS;
    }
  });

  // Persistent Lesson Journals
  const [lessonJournals, setLessonJournals] = useState<LessonJournal[]>(() => {
    try {
      const saved = localStorage.getItem('odette_lesson_journals');
      return saved ? JSON.parse(saved) : INITIAL_LESSON_JOURNALS;
    } catch {
      return INITIAL_LESSON_JOURNALS;
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('odette_target_profile', JSON.stringify(targetProfile));
  }, [targetProfile]);

  useEffect(() => {
    localStorage.setItem('odette_body_records', JSON.stringify(bodyRecords));
  }, [bodyRecords]);

  useEffect(() => {
    localStorage.setItem('odette_meal_records', JSON.stringify(mealRecords));
  }, [mealRecords]);

  useEffect(() => {
    localStorage.setItem('odette_stretch_records', JSON.stringify(stretchRecords));
  }, [stretchRecords]);

  useEffect(() => {
    localStorage.setItem('odette_lesson_journals', JSON.stringify(lessonJournals));
  }, [lessonJournals]);

  // Handlers
  const handleAddBodyRecord = (newRec: Omit<BodyRecord, 'id'>) => {
    const item: BodyRecord = { ...newRec, id: `b_${Date.now()}` };
    setBodyRecords(prev => [...prev, item]);
  };

  const handleDeleteBodyRecord = (id: string) => {
    setBodyRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleAddMealRecord = (newRec: Omit<MealRecord, 'id' | 'createdAt'>) => {
    const item: MealRecord = {
      ...newRec,
      id: `m_${Date.now()}`,
      createdAt: new Date().toLocaleString('ja-JP', { hour12: false }),
    };
    setMealRecords(prev => [item, ...prev]);
  };

  const handleDeleteMealRecord = (id: string) => {
    setMealRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleAddStretchRecord = (newRec: Omit<StretchRecord, 'id'>) => {
    const item: StretchRecord = { ...newRec, id: `s_${Date.now()}` };
    setStretchRecords(prev => [...prev, item]);
  };

  const handleDeleteStretchRecord = (id: string) => {
    setStretchRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleAddLessonJournal = (newRec: Omit<LessonJournal, 'id' | 'createdAt'>) => {
    const item: LessonJournal = {
      ...newRec,
      id: `j_${Date.now()}`,
      createdAt: new Date().toLocaleString('ja-JP', { hour12: false }),
    };
    setLessonJournals(prev => [item, ...prev]);
  };

  const handleDeleteLessonJournal = (id: string) => {
    setLessonJournals(prev => prev.filter(r => r.id !== id));
  };

  const calculateDaysLeft = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetProfile.stageDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysLeft = calculateDaysLeft();

  const mobileNavTabs: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
    { key: 'body', label: '体組成', icon: Activity },
    { key: 'nutrition', label: '食事写真', icon: Utensils },
    { key: 'flexibility', label: '柔軟性', icon: Zap },
    { key: 'journal', label: '日報', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetProfile={targetProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Minimal Modern Editorial Section Header (Refined for mobile & Odette world) */}
      <section className="border-b border-slate-200/80 bg-linear-to-b from-white via-white to-sky-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-serif-jp tracking-wider">
                <span className="truncate max-w-[210px] sm:max-w-none text-slate-600">{targetProfile.recitalName}</span>
                <span className="text-slate-300" aria-hidden="true">/</span>
                <span className="text-sky-950 font-medium whitespace-nowrap bg-sky-50/80 px-2 py-0.5 rounded border border-sky-100 text-[10px] sm:text-xs">
                  {targetProfile.roleName}
                </span>
              </div>
              <h1 className="mt-1.5 text-lg sm:text-3xl font-light tracking-tight font-serif-jp text-slate-950 flex items-center gap-2">
                <span>白鳥の湖 コンディショニング</span>
              </h1>
              <p className="hidden sm:block mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
                浮遊感のある白鳥のラインとアダージョの筋持久力を両立。体組成・食事・柔軟性・レッスン日報を統合管理。
              </p>
            </div>

            {/* Key Metrics Bar (Clean 3-metric strip) */}
            <div className="flex items-center gap-4 sm:gap-7 text-xs font-mono border-t sm:border-t-0 md:border-l border-slate-100 sm:border-slate-200/80 pt-2 sm:pt-0 md:pl-7">
              <div className="bg-white/80 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded border sm:border-0 border-slate-100">
                <span className="block text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest">Countdown</span>
                <span className="text-sm sm:text-lg font-semibold text-sky-950 tabular-nums">
                  {daysLeft > 0 ? `D-${daysLeft}` : 'Stage Day'}
                </span>
              </div>
              <div className="bg-white/80 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded border sm:border-0 border-slate-100">
                <span className="block text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest">Target Weight</span>
                <span className="text-sm sm:text-lg font-semibold text-slate-900 tabular-nums">
                  {targetProfile.targetWeight} <span className="text-[10px] font-normal text-slate-500">kg</span>
                </span>
              </div>
              <div className="bg-white/80 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded border sm:border-0 border-slate-100">
                <span className="block text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest">Splits</span>
                <span className="text-sm sm:text-lg font-semibold text-slate-900 tabular-nums">
                  {targetProfile.targetSplitsDeg}°
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content View with extra bottom padding for mobile bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'body' && (
          <BodyCompositionTab
            records={bodyRecords}
            targetProfile={targetProfile}
            onAddRecord={handleAddBodyRecord}
            onDeleteRecord={handleDeleteBodyRecord}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            records={mealRecords}
            targetProfile={targetProfile}
            onAddMealRecord={handleAddMealRecord}
            onDeleteMealRecord={handleDeleteMealRecord}
          />
        )}

        {activeTab === 'flexibility' && (
          <FlexibilityTab
            records={stretchRecords}
            targetProfile={targetProfile}
            onAddRecord={handleAddStretchRecord}
            onDeleteRecord={handleDeleteStretchRecord}
          />
        )}

        {activeTab === 'journal' && (
          <LessonJournalTab
            journals={lessonJournals}
            targetProfile={targetProfile}
            onAddJournal={handleAddLessonJournal}
            onDeleteJournal={handleDeleteLessonJournal}
          />
        )}
      </main>

      {/* Fixed Native-like Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex items-center justify-around h-15 pb-safe shadow-xs">
        {mobileNavTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 h-full flex flex-col items-center justify-center min-w-[48px] py-1 transition-all ${
                isActive
                  ? 'text-sky-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-700 active:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-full transition-colors ${isActive ? 'bg-sky-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] text-sky-700' : 'stroke-[1.6]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-medium text-slate-900' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && <span className="w-1 h-1 bg-sky-500 rounded-full mt-0.5 shadow-[0_0_6px_rgba(14,165,233,0.8)]" />}
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      <OdetteGoalModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targetProfile={targetProfile}
        onSave={setTargetProfile}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-5 text-zinc-400 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-cormorant font-semibold tracking-widest text-zinc-900">ODETTE</span>
            <span>·</span>
            <span>Ballet Conditioning Suite</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>{targetProfile.recitalName}</span>
            <span>·</span>
            <span>{targetProfile.stageDate}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
