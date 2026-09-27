import React, { useState } from 'react';
import { X, Sparkles, Feather } from 'lucide-react';
import { OdetteTargetProfile } from '../types';

interface OdetteGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: OdetteTargetProfile;
  onSave: (updated: OdetteTargetProfile) => void;
}

export const OdetteGoalModal: React.FC<OdetteGoalModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  onSave,
}) => {
  const [formData, setFormData] = useState<OdetteTargetProfile>({
    ...targetProfile,
    targetFrontSplitsDeg: targetProfile.targetFrontSplitsDeg ?? 180,
  });

  if (!isOpen) return null;

  // Auto-calculate Odette standard benchmark based on height
  const handleAutoCalculate = () => {
    const height = formData.heightCm || 164;
    setFormData(prev => ({
      ...prev,
      targetWeight: Number((height * 0.273).toFixed(1)), // ~44.8kg for 164cm
      targetBodyFat: 17.2,
      targetMuscleMass: Number((height * 0.208).toFixed(1)), // ~34.1kg
      targetSplitsDeg: 180,
      targetFrontSplitsDeg: 180,
      targetTurnoutDeg: 175,
      targetCambreDeg: 145,
      notes: '白鳥としての儚いラインと、第2幕アダージョの静止バランスに耐えるインナーマッスルを両立。過度な減量による疲労骨折を絶対回避。',
    }));
  };

  const muscleRatio = formData.targetWeight > 0
    ? ((formData.targetMuscleMass / formData.targetWeight) * 100).toFixed(1)
    : '0.0';
  const bmi = formData.heightCm > 0
    ? (formData.targetWeight / ((formData.heightCm / 100) ** 2)).toFixed(1)
    : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/45 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-9 h-1 bg-slate-200 rounded-full mx-auto my-2 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-linear-to-r from-sky-50/40 via-white to-slate-50/40 shrink-0">
          <div className="flex items-center gap-2">
            <Feather className="w-3.5 h-3.5 text-sky-600/80" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-serif-jp tracking-wide">
                オデット目標設定
              </h2>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Swan Lake Odette Benchmarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Odette Unified Target Overview Banner */}
          <div className="p-3 sm:p-3.5 bg-linear-to-r from-sky-50/60 to-slate-50/70 border border-sky-100/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 font-serif-jp">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                <span>白鳥の湖 主役・オデット基準</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                純白の儚いラインと、第2幕アダージョの静止バランスに耐える体幹筋力を両立する統一基準です。
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="min-h-[38px] px-3 py-1.5 text-xs text-sky-950 bg-white hover:bg-sky-50/80 active:bg-sky-100/60 border border-sky-200 rounded transition-colors flex items-center justify-center gap-1.5 font-mono shrink-0 shadow-2xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>標準値に自動再計算</span>
            </button>
          </div>

          {/* Recital Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-mono">公演・発表会名</label>
              <input
                type="text"
                value={formData.recitalName}
                onChange={e => setFormData({ ...formData, recitalName: e.target.value })}
                className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-mono">公演初日 (Stage Date)</label>
              <input
                type="date"
                value={formData.stageDate}
                onChange={e => setFormData({ ...formData, stageDate: e.target.value })}
                className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white"
                required
              />
            </div>
          </div>

          {/* Physical Targets: Exactly 2 Columns on mobile & desktop
              Row 1: 身長 (Col 1), 目標体重 (Col 2)
              Row 2: 体脂肪率 (Col 1), 目標筋肉量 (Col 2)
          */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 uppercase text-[10px] tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-1 h-3 bg-sky-500 rounded-full inline-block" />
                Physical Targets
              </span>
              <span className="text-slate-600 text-[11px] tabular-nums">
                筋力比 <span className="text-sky-900 font-semibold">{muscleRatio}%</span> · BMI {bmi}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 font-mono">
              {/* Row 1 Col 1: 身長 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">身長 (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.heightCm}
                  onChange={e => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                  required
                />
              </div>

              {/* Row 1 Col 2: 目標体重 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">目標体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeight}
                  onChange={e => setFormData({ ...formData, targetWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                  required
                />
              </div>

              {/* Row 2 Col 1: 体脂肪率 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">体脂肪率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetBodyFat}
                  onChange={e => setFormData({ ...formData, targetBodyFat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                  required
                />
              </div>

              {/* Row 2 Col 2: 目標筋肉量 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">目標筋肉量 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetMuscleMass}
                  onChange={e => setFormData({ ...formData, targetMuscleMass: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                  required
                />
              </div>
            </div>
          </div>

          {/* Flexibility Targets: Exactly 2 Columns on mobile & desktop
              Row 1: 左右開脚 (°), 前後開脚 (°)
              Row 2: ターンアウト (°), カンブレ後屈 (°)
          */}
          <div className="space-y-2 pt-3 border-t border-slate-100 font-mono">
            <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1.5">
              <span className="w-1 h-3 bg-slate-400 rounded-full inline-block" />
              Flexibility Targets
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Row 1 Col 1: 左右開脚 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">左右開脚 (°)</label>
                <input
                  type="number"
                  value={formData.targetSplitsDeg}
                  onChange={e => setFormData({ ...formData, targetSplitsDeg: parseInt(e.target.value) || 180 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                />
              </div>

              {/* Row 1 Col 2: 前後開脚 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">前後開脚 (°)</label>
                <input
                  type="number"
                  value={formData.targetFrontSplitsDeg ?? 180}
                  onChange={e => setFormData({ ...formData, targetFrontSplitsDeg: parseInt(e.target.value) || 180 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                />
              </div>

              {/* Row 2 Col 1: ターンアウト */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">ターンアウト (°)</label>
                <input
                  type="number"
                  value={formData.targetTurnoutDeg}
                  onChange={e => setFormData({ ...formData, targetTurnoutDeg: parseInt(e.target.value) || 175 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                />
              </div>

              {/* Row 2 Col 2: カンブレ後屈 */}
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70 hover:border-sky-200/80 transition-colors">
                <label className="block text-[11px] text-slate-600 mb-1 font-sans">カンブレ後屈 (°)</label>
                <input
                  type="number"
                  value={formData.targetCambreDeg}
                  onChange={e => setFormData({ ...formData, targetCambreDeg: parseInt(e.target.value) || 145 })}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-sky-700 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">コンディショニング方針メモ</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
              placeholder="例: 白鳥としての儚いラインと、第2幕アダージョの静止バランスに耐えるインナーマッスルを両立。"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors shadow-xs"
            >
              オデット目標を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
