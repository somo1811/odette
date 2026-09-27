import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Check, Trash2, Sparkles, Activity } from 'lucide-react';
import { StretchRecord, OdetteTargetProfile } from '../types';

interface FlexibilityTabProps {
  records: StretchRecord[];
  targetProfile: OdetteTargetProfile;
  onAddRecord: (record: Omit<StretchRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const FlexibilityTab: React.FC<FlexibilityTabProps> = ({
  records,
  targetProfile,
  onAddRecord,
  onDeleteRecord,
}) => {
  const latest = records[records.length - 1] || {
    splitsDeg: 178,
    frontSplitsRightDeg: 180,
    frontSplitsLeftDeg: 178,
    turnoutDeg: 172,
    cambreDeg: 142,
    instepScore: 9,
    date: '2026-09-27',
    completedRoutines: [],
  };

  const [splitsInput, setSplitsInput] = useState<string>(latest.splitsDeg.toString());
  const [frontSplitsInput, setFrontSplitsInput] = useState<string>((latest.frontSplitsRightDeg ?? 180).toString());
  const [turnoutInput, setTurnoutInput] = useState<string>(latest.turnoutDeg.toString());
  const [cambreInput, setCambreInput] = useState<string>(latest.cambreDeg.toString());
  const [instepInput, setInstepInput] = useState<number>(latest.instepScore || 9);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([
    'アキレス腱・足首ディープストレッチ',
    '股関節外旋ターンアウト',
    '胸椎カンブレストレッチ',
  ]);
  const [notesInput, setNotesInput] = useState<string>('');

  // Stretch Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [initialSeconds, setInitialSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentTimerRoutine, setCurrentTimerRoutine] = useState<string>('アキレス腱・足首ディープストレッチ');

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = (sec = 60) => {
    setIsTimerRunning(false);
    setTimerSeconds(sec);
    setInitialSeconds(sec);
  };

  const STRETCH_ROUTINES_LIST = [
    {
      id: 'r1',
      title: 'アキレス腱・足首ディープストレッチ',
      target: '足関節・ヒラメ筋・アキレス腱',
      purpose: 'ポアント稽古・跳躍着地時のアキレス腱炎および三角骨障害を予防',
      durationSec: 60,
    },
    {
      id: 'r2',
      title: '股関節外旋ターンアウト',
      target: '外閉鎖筋・梨状筋・深層外旋六筋',
      purpose: '膝や足首をねじる代償動作を防ぎ、骨盤直下からのアンドゥオールを定着',
      durationSec: 90,
    },
    {
      id: 'r3',
      title: '胸椎カンブレストレッチ',
      target: '胸椎伸展・広背筋・肩甲骨下角',
      purpose: 'オデット特有の背中から羽ばたくポール・ド・ブラと後屈アーチを強化',
      durationSec: 60,
    },
    {
      id: 'r4',
      title: 'ハムストリングス＆腸腰筋ディープ',
      target: '大腿二頭筋・腸腰筋',
      purpose: 'グラン・ジュテやパンシェの股関節可動域拡張と骨盤前傾の修正',
      durationSec: 90,
    },
    {
      id: 'r5',
      title: '足裏アーチ内在筋トレーニング',
      target: '母趾外転筋・足底腱膜・タオルギャザー',
      purpose: 'トウシューズでのルルヴェ立ちきり、中足骨疲労骨折の予防',
      durationSec: 60,
    },
  ];

  const handleToggleRoutineCheck = (title: string) => {
    if (selectedRoutines.includes(title)) {
      setSelectedRoutines(selectedRoutines.filter(r => r !== title));
    } else {
      setSelectedRoutines([...selectedRoutines, title]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(splitsInput);
    const fs = parseInt(frontSplitsInput) || s;
    const t = parseInt(turnoutInput);
    const c = parseInt(cambreInput);
    if (!s || !t || !c) return;

    onAddRecord({
      date: new Date().toISOString().split('T')[0],
      splitsDeg: s,
      frontSplitsRightDeg: fs,
      frontSplitsLeftDeg: fs - 2,
      turnoutDeg: t,
      cambreDeg: c,
      instepScore: instepInput,
      completedRoutines: selectedRoutines,
      notes: notesInput,
    });
    setNotesInput('');
  };

  // SVG Chart Setup
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const chartWidth = 720;
  const chartHeight = 200;
  const paddingX = 36;
  const paddingY = 24;

  const minDeg = 120;
  const maxDeg = 190;

  const getX = (index: number) => {
    if (sortedRecords.length <= 1) return chartWidth / 2;
    return paddingX + (index / (sortedRecords.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - ((val - minDeg) / (maxDeg - minDeg)) * (chartHeight - paddingY * 2);
  };

  const splitsPoints = sortedRecords.map((r, i) => `${getX(i)},${getY(r.splitsDeg)}`).join(' ');
  const turnoutPoints = sortedRecords.map((r, i) => `${getX(i)},${getY(r.turnoutDeg)}`).join(' ');
  const cambrePoints = sortedRecords.map((r, i) => `${getX(i)},${getY(r.cambreDeg)}`).join(' ');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Routines & Timer (6 cols) */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Minimalist Odette Stretch Timer (Robust Mobile-First Layout) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-3.5">
            {/* Header: Label + Selected Routine Badge */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
                STRETCH TIMER
              </span>
              <div className="flex items-center gap-1 text-[11px] text-sky-950 font-sans bg-sky-50/90 px-2 py-0.5 rounded-md border border-sky-100 max-w-full">
                <span className="text-slate-400 font-mono text-[9px] uppercase shrink-0">ROUTINE:</span>
                <span className="truncate">{currentTimerRoutine}</span>
              </div>
            </div>

            {/* Time display & hairline progress indicator */}
            <div className="bg-linear-to-b from-slate-50/80 to-sky-50/25 p-3.5 sm:p-4 rounded-xl border border-slate-100/90 flex flex-col items-center justify-center text-center">
              <div className="text-4xl sm:text-5xl font-extralight font-mono text-slate-950 tabular-nums tracking-tight">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                {isTimerRunning ? 'COUNTDOWN IN PROGRESS' : 'READY TO STRETCH'}
              </span>

              {/* Thin Elegant Progress Bar */}
              <div className="w-full bg-slate-200/70 h-1 rounded-full mt-2.5 overflow-hidden max-w-xs">
                <div
                  className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (timerSeconds / (initialSeconds || 60)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Duration Preset Selector: 4 clean buttons in a grid */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Set Duration / 秒数プリセット
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[30, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => resetTimer(sec)}
                    className={`min-h-[36px] py-1 px-1 rounded-lg text-xs font-mono border transition-all flex items-center justify-center ${
                      timerSeconds === sec && !isTimerRunning
                        ? 'bg-sky-50 text-sky-950 border-sky-300 font-semibold shadow-2xs'
                        : 'bg-slate-50/80 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200/60'
                    }`}
                  >
                    {sec}秒
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Thumb-friendly 44px+ controls */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={toggleTimer}
                className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>一時停止 (Pause)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>ストレッチ開始 (Start)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => resetTimer(initialSeconds || 60)}
                className="min-h-[44px] min-w-[44px] px-3 py-2.5 text-slate-500 hover:text-slate-900 active:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-mono shrink-0"
                title="タイマーをリセット"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">リセット</span>
              </button>
            </div>
          </div>

          {/* Routine Checklist */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>怪我予防ルーティン実施</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedRoutines.length} / {STRETCH_ROUTINES_LIST.length} 完了
              </span>
            </div>

            <div className="space-y-2">
              {STRETCH_ROUTINES_LIST.map(routine => {
                const isChecked = selectedRoutines.includes(routine.title);
                return (
                  <div
                    key={routine.id}
                    onClick={() => handleToggleRoutineCheck(routine.title)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-sky-200/90 bg-sky-50/40'
                        : 'border-slate-100 hover:border-slate-200 active:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-2" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-900 font-serif-jp">{routine.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{routine.target}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTimerRoutine(routine.title);
                        resetTimer(routine.durationSec);
                      }}
                      className="min-h-[36px] px-2.5 py-1 text-[11px] font-mono text-slate-500 hover:text-sky-950 hover:bg-white rounded transition-colors shrink-0"
                    >
                      {routine.durationSec}s
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Flexibility Input (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>可動域・柔軟性の記録</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Stage Benchmark</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3.5">
              白鳥の湖 主役オデットの開脚・後屈目標との照合
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-3.5">
              {/* 2-Column Grid on Mobile:
                  Row 1: 左右開脚 (°), 前後開脚 (°)
                  Row 2: ターンアウト (°), 胸椎カンブレ (°)
              */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 font-mono">
                {/* 左右開脚 */}
                <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-sans">
                    <label>左右開脚 (°)</label>
                    <span className="text-[10px] text-slate-400 font-mono">目標 {targetProfile.targetSplitsDeg}°</span>
                  </div>
                  <input
                    type="number"
                    value={splitsInput}
                    onChange={e => setSplitsInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                    required
                  />
                </div>

                {/* 前後開脚 */}
                <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-sans">
                    <label>前後開脚 (°)</label>
                    <span className="text-[10px] text-slate-400 font-mono">目標 {targetProfile.targetFrontSplitsDeg ?? 180}°</span>
                  </div>
                  <input
                    type="number"
                    value={frontSplitsInput}
                    onChange={e => setFrontSplitsInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                    required
                  />
                </div>

                {/* ターンアウト */}
                <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-sans">
                    <label>ターンアウト (°)</label>
                    <span className="text-[10px] text-slate-400 font-mono">目標 {targetProfile.targetTurnoutDeg}°</span>
                  </div>
                  <input
                    type="number"
                    value={turnoutInput}
                    onChange={e => setTurnoutInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                    required
                  />
                </div>

                {/* 胸椎カンブレ */}
                <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-sans">
                    <label>胸椎カンブレ (°)</label>
                    <span className="text-[10px] text-slate-400 font-mono">目標 {targetProfile.targetCambreDeg}°</span>
                  </div>
                  <input
                    type="number"
                    value={cambreInput}
                    onChange={e => setCambreInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                    required
                  />
                </div>
              </div>

              {/* Instep score */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">足首の甲スコア (ポアント推進力)</label>
                <select
                  value={instepInput}
                  onChange={e => setInstepInput(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white"
                >
                  {[10, 9, 8, 7, 6, 5, 4].map(s => (
                    <option key={s} value={s}>
                      {s}点 - {s >= 9 ? '高水準アーチ（甲が美しく出ている）' : s >= 7 ? '良好（引き上げ安定）' : '要ストレッチケア'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">身体感覚メモ</label>
                <input
                  type="text"
                  placeholder="例: 右股関節の詰まりが取れ、カンブレで呼吸が楽になった"
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors shadow-2xs"
              >
                柔軟性ログを保存
              </button>
            </form>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed font-serif-jp bg-slate-50/50 p-2.5 rounded-lg">
            白鳥の羽ばたきは腕ではなく胸椎伸展から生まれます。腰椎を無理に反らせず、みぞおちの裏から反る意識でカンブレを行ってください。
          </div>
        </div>
      </div>

      {/* Progression Graph */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>柔軟性 推移グラフ</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              SPLITS (180°) · TURNOUT · CAMBRE
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-900 inline-block" />
              <span className="text-slate-600">左右開脚</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
              <span className="text-slate-600">ターンアウト</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-400 inline-block" />
              <span className="text-slate-600">胸椎カンブレ</span>
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 sm:h-52 select-none min-w-[500px] sm:min-w-0">
            {[180, 160, 140].map(deg => {
              const y = getY(deg);
              return (
                <g key={deg}>
                  <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={paddingX - 6} y={y + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400">
                    {deg}°
                  </text>
                </g>
              );
            })}

            {/* 180° Benchmark Line */}
            <line
              x1={paddingX}
              y1={getY(180)}
              x2={chartWidth - paddingX}
              y2={getY(180)}
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text x={chartWidth - paddingX} y={getY(180) - 5} textAnchor="end" className="text-[9px] fill-sky-700 font-mono font-medium">
              オデット開脚基準 (180°)
            </text>

            {/* Splits */}
            {sortedRecords.length > 1 && (
              <polyline fill="none" stroke="#0f172a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" points={splitsPoints} />
            )}
            {/* Turnout */}
            {sortedRecords.length > 1 && (
              <polyline fill="none" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={turnoutPoints} />
            )}
            {/* Cambre */}
            {sortedRecords.length > 1 && (
              <polyline fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={cambrePoints} />
            )}

            {sortedRecords.map((r, i) => {
              const cx = getX(i);
              return (
                <g key={r.id}>
                  <circle cx={cx} cy={getY(r.splitsDeg)} r="3" className="fill-white stroke-slate-900 stroke-1.5" />
                  <circle cx={cx} cy={getY(r.turnoutDeg)} r="2.5" className="fill-white stroke-sky-600 stroke-1.5" />
                  <circle cx={cx} cy={getY(r.cambreDeg)} r="2.5" className="fill-white stroke-slate-400 stroke-1.5" />
                  <text x={cx} y={chartHeight - 8} textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">
                    {r.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* History Log Table + Mobile Card View */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-mono bg-slate-50/50">
          <span className="font-semibold text-slate-900 tracking-wider">FLEXIBILITY LOG</span>
          <span className="text-slate-400">{sortedRecords.length} entries</span>
        </div>

        {/* Mobile View: Clean Card List */}
        <div className="sm:hidden divide-y divide-slate-100">
          {sortedRecords.slice().reverse().map(record => (
            <div key={record.id} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-900">{record.date}</span>
                <button
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  aria-label="削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono bg-slate-50/70 p-2 rounded-lg border border-slate-100 text-center">
                <div>
                  <span className="block text-[9px] text-slate-400">開脚</span>
                  <span className="font-semibold text-slate-900">{record.splitsDeg}°</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">ターン</span>
                  <span className="text-sky-900">{record.turnoutDeg}°</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">カンブレ</span>
                  <span className="text-slate-700">{record.cambreDeg}°</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">甲スコア</span>
                  <span className="text-slate-700">{record.instepScore}/10</span>
                </div>
              </div>

              {record.completedRoutines?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {record.completedRoutines.map(r => (
                    <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-100">
                      {r.replace('ディープストレッチ', '').replace('トレーニング', '')}
                    </span>
                  ))}
                </div>
              )}

              {record.notes && (
                <p className="text-[11px] text-slate-500 font-sans line-clamp-2">
                  {record.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Wide Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-4 py-2.5">Splits (°)</th>
                <th className="px-4 py-2.5">Turnout (°)</th>
                <th className="px-4 py-2.5">Cambre (°)</th>
                <th className="px-4 py-2.5">Instep</th>
                <th className="px-5 py-2.5">Routines</th>
                <th className="px-5 py-2.5">Note</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedRecords.slice().reverse().map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-2.5 text-slate-950">{record.date}</td>
                  <td className="px-4 py-2.5 text-slate-950 font-semibold tabular-nums">{record.splitsDeg}°</td>
                  <td className="px-4 py-2.5 text-sky-900 tabular-nums">{record.turnoutDeg}°</td>
                  <td className="px-4 py-2.5 text-slate-600 tabular-nums">{record.cambreDeg}°</td>
                  <td className="px-4 py-2.5 text-slate-600 tabular-nums">{record.instepScore}/10</td>
                  <td className="px-5 py-2.5 font-sans text-slate-500 text-[11px] max-w-xs truncate">
                    {record.completedRoutines?.join(', ') || '-'}
                  </td>
                  <td className="px-5 py-2.5 font-sans text-slate-500 text-[11px] truncate max-w-xs">
                    {record.notes || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs transition-colors p-1"
                      aria-label="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
