import React from 'react';
import { ActiveTab, OdetteTargetProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  targetProfile: OdetteTargetProfile;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  targetProfile,
  onOpenSettings,
}) => {
  const calculateDaysLeft = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetProfile.stageDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();

  const navItems: { key: ActiveTab; label: string }[] = [
    { key: 'body', label: '体組成計測' },
    { key: 'nutrition', label: '食事写真・栄養' },
    { key: 'flexibility', label: '柔軟性・怪我予防' },
    { key: 'journal', label: '音声レッスン日報' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Zone */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('body')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-sky-100 flex items-center justify-center font-cormorant text-xs font-semibold tracking-wider ring-1 ring-slate-700/40">
                O
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-cormorant text-xl tracking-[0.28em] font-semibold text-slate-900 uppercase">
                  ODETTE
                </span>
                <span className="hidden sm:inline text-[10px] tracking-widest text-slate-400 font-serif-jp uppercase">
                  白鳥の湖
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`py-1.5 transition-colors whitespace-nowrap relative ${
                  activeTab === item.key
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
                {activeTab === item.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Zone: Pale blue countdown & silver accent button */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50/70 border border-sky-100/80 text-sky-950">
              <span className="text-[10px] tracking-widest text-sky-700/80 hidden lg:inline uppercase font-sans">
                STAGE
              </span>
              <span className="font-semibold tabular-nums">
                {daysLeft > 0 ? `D-${daysLeft}` : 'TODAY'}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-200/80" />

            <button
              onClick={onOpenSettings}
              className="min-h-[38px] px-2.5 py-1 text-xs text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/70 border border-slate-200/80 rounded transition-colors font-medium whitespace-nowrap"
            >
              目標調整
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
