import React, { useState } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import { BodyRecord, OdetteTargetProfile } from '../types';

interface BodyCompositionTabProps {
  records: BodyRecord[];
  targetProfile: OdetteTargetProfile;
  onAddRecord: (record: Omit<BodyRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const BodyCompositionTab: React.FC<BodyCompositionTabProps> = ({
  records,
  targetProfile,
  onAddRecord,
  onDeleteRecord,
}) => {
  const latest = records[records.length - 1] || {
    weight: 45.2,
    bodyFat: 17.3,
    muscleMass: 34.3,
    date: '2026-09-27',
    condition: 'excellent',
  };

  const [weightInput, setWeightInput] = useState<string>(latest.weight.toString());
  const [bodyFatInput, setBodyFatInput] = useState<string>(latest.bodyFat.toString());
  const [muscleMassInput, setMuscleMassInput] = useState<string>(latest.muscleMass.toString());
  const [conditionInput, setConditionInput] = useState<BodyRecord['condition']>('good');
  const [notesInput, setNotesInput] = useState<string>('');
  const [selectedChartMetric, setSelectedChartMetric] = useState<'weight' | 'bodyFat' | 'muscleMass'>('weight');

  const weightDelta = Number((latest.weight - targetProfile.targetWeight).toFixed(1));
  const bodyFatDelta = Number((latest.bodyFat - targetProfile.targetBodyFat).toFixed(1));
  const muscleDelta = Number((latest.muscleMass - targetProfile.targetMuscleMass).toFixed(1));
  const currentPowerToWeight = ((latest.muscleMass / latest.weight) * 100).toFixed(1);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    const bf = parseFloat(bodyFatInput);
    const mm = parseFloat(muscleMassInput);
    if (!w || !bf || !mm) return;

    const todayStr = new Date().toISOString().split('T')[0];
    onAddRecord({
      date: todayStr,
      weight: w,
      bodyFat: bf,
      muscleMass: mm,
      condition: conditionInput,
      notes: notesInput,
    });
    setNotesInput('');
  };

  // SVG Chart Setup
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const chartWidth = 720;
  const chartHeight = 210;
  const paddingX = 36;
  const paddingY = 28;

  const getMetricValue = (r: BodyRecord) => {
    if (selectedChartMetric === 'weight') return r.weight;
    if (selectedChartMetric === 'bodyFat') return r.bodyFat;
    return r.muscleMass;
  };

  const getTargetValue = () => {
    if (selectedChartMetric === 'weight') return targetProfile.targetWeight;
    if (selectedChartMetric === 'bodyFat') return targetProfile.targetBodyFat;
    return targetProfile.targetMuscleMass;
  };

  const values = sortedRecords.map(getMetricValue);
  const targetVal = getTargetValue();
  const allVals = [...values, targetVal];
  const minVal = Math.min(...allVals) - 0.4;
  const maxVal = Math.max(...allVals) + 0.4;

  const getX = (index: number) => {
    if (sortedRecords.length <= 1) return chartWidth / 2;
    return paddingX + (index / (sortedRecords.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
  };

  const pointsString = sortedRecords
    .map((r, i) => `${getX(i)},${getY(getMetricValue(r))}`)
    .join(' ');

  // Gradient area points
  const areaPointsString = sortedRecords.length > 1
    ? `${pointsString} ${getX(sortedRecords.length - 1)},${chartHeight - paddingY} ${getX(0)},${chartHeight - paddingY}`
    : '';

  const targetLineY = getY(targetVal);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards: Current vs Target (2-column on mobile, 4-column on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Weight */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono tracking-wider">
              Weight / 体重
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-light font-mono text-slate-950 tabular-nums">
              {latest.weight}
              <span className="text-[11px] text-slate-400 font-sans ml-1">kg</span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 tabular-nums">
              目標 {targetProfile.targetWeight}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-sky-800 font-mono font-medium">
            {weightDelta > 0 ? `残り -${weightDelta} kg` : weightDelta === 0 ? '目標達成' : `${Math.abs(weightDelta)} kg 減`}
          </div>
        </div>

        {/* Body Fat */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono tracking-wider">
              Fat / 体脂肪率
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-light font-mono text-slate-950 tabular-nums">
              {latest.bodyFat}
              <span className="text-[11px] text-slate-400 font-sans ml-1">%</span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 tabular-nums">
              目標 {targetProfile.targetBodyFat}%
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-slate-600 font-mono">
            {bodyFatDelta > 0 ? `あと -${bodyFatDelta}%` : '目標到達'}
          </div>
        </div>

        {/* Muscle Mass */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono tracking-wider">
              Muscle / 筋肉量
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-light font-mono text-slate-950 tabular-nums">
              {latest.muscleMass}
              <span className="text-[11px] text-slate-400 font-sans ml-1">kg</span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 tabular-nums">
              目標 {targetProfile.targetMuscleMass}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-sky-800 font-mono font-medium">
            {muscleDelta >= 0 ? `+${muscleDelta}kg 維持` : `${muscleDelta}kg`}
          </div>
        </div>

        {/* Power-to-weight Ratio */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono tracking-wider">
              Power / 筋力比
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-light font-mono text-slate-950 tabular-nums">
              {currentPowerToWeight}
              <span className="text-[11px] text-slate-400 font-sans ml-1">%</span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500">
              基準 73%+
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-slate-500 font-serif-jp">
            白鳥の浮遊感ライン適合
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Record Form (4 cols on lg, full width on mobile) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>本日の体組成記録</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">DAILY LOG</span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-3.5">
            {/* 2-Column layout on mobile for Weight & Condition */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">状態</label>
                <select
                  value={conditionInput}
                  onChange={e => setConditionInput(e.target.value as BodyRecord['condition'])}
                  className="w-full px-2 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                >
                  <option value="excellent">絶好調（浮遊感）</option>
                  <option value="good">良好（安定軸）</option>
                  <option value="bloated">むくみ（水分調整）</option>
                  <option value="tired">疲労（筋肉疲労）</option>
                  <option value="heavy">重め（休息日）</option>
                </select>
              </div>
            </div>

            {/* 2-Column layout for Body Fat & Muscle Mass */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">体脂肪率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatInput}
                  onChange={e => setBodyFatInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">筋肉量 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={muscleMassInput}
                  onChange={e => setMuscleMassInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white tabular-nums"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">身体感覚・ポアントメモ</label>
              <input
                type="text"
                placeholder="例: ポアントの甲の押し出しが軽い、アダージョの引き上げ良好"
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors shadow-2xs"
            >
              計測値を保存
            </button>
          </form>
        </div>

        {/* Visual Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>オデット推移グラフ</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-sans">
                  白鳥の湖 目標基準ラインとの照合
                </p>
              </div>

              {/* Segmented Control */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-mono self-start sm:self-auto border border-slate-200/60">
                {(['weight', 'bodyFat', 'muscleMass'] as const).map(metric => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setSelectedChartMetric(metric)}
                    className={`min-h-[32px] px-3 py-1 rounded-md transition-all ${
                      selectedChartMetric === metric
                        ? 'bg-white text-sky-950 shadow-2xs font-semibold border border-sky-100'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {metric === 'weight' ? '体重' : metric === 'bodyFat' ? '体脂肪' : '筋肉量'}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 sm:h-52 select-none min-w-[500px] sm:min-w-0">
                <defs>
                  <linearGradient id="swanLakeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#f1f5f9" strokeWidth="1" />

                {/* Target Benchmark Line (Cool silver slate with subtle dash) */}
                <line
                  x1={paddingX}
                  y1={targetLineY}
                  x2={chartWidth - paddingX}
                  y2={targetLineY}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - paddingX}
                  y={targetLineY - 6}
                  textAnchor="end"
                  className="text-[9px] fill-slate-500 font-mono font-medium"
                >
                  ODETTE TARGET: {targetVal} {selectedChartMetric === 'bodyFat' ? '%' : 'kg'}
                </text>

                {/* Gradient area under trend line */}
                {sortedRecords.length > 1 && (
                  <polygon
                    points={areaPointsString}
                    fill="url(#swanLakeFill)"
                  />
                )}

                {/* Trend Polyline */}
                {sortedRecords.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />
                )}

                {/* Points */}
                {sortedRecords.map((r, i) => {
                  const val = getMetricValue(r);
                  const cx = getX(i);
                  const cy = getY(val);
                  return (
                    <g key={r.id}>
                      <circle cx={cx} cy={cy} r="3.5" className="fill-white stroke-sky-700 stroke-2" />
                      <text x={cx} y={cy - 9} textAnchor="middle" className="text-[9px] font-mono fill-slate-700 font-medium">
                        {val}
                      </text>
                      <text x={cx} y={chartHeight - 8} textAnchor="middle" className="text-[9px] font-mono fill-slate-400">
                        {r.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-600 rounded-full inline-block" />
                <span className="text-slate-600">実測推移</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-slate-400 border-dashed inline-block" />
                <span className="text-slate-500">オデット目標</span>
              </span>
            </div>
            <span>{sortedRecords.length} records</span>
          </div>
        </div>
      </div>

      {/* History Log: Mobile Card View + Desktop Table View */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-mono bg-slate-50/50">
          <span className="font-semibold text-slate-900 tracking-wider">MEASUREMENT LOG</span>
          <span className="text-slate-400">{sortedRecords.length} entries</span>
        </div>

        {/* Mobile View: Clean Card List */}
        <div className="sm:hidden divide-y divide-slate-100">
          {sortedRecords.slice().reverse().map(record => {
            const ratio = ((record.muscleMass / record.weight) * 100).toFixed(1);
            return (
              <div key={record.id} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-900">{record.date}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-100">
                      {record.condition === 'excellent' && '絶好調'}
                      {record.condition === 'good' && '良好'}
                      {record.condition === 'bloated' && 'むくみ'}
                      {record.condition === 'tired' && '疲労'}
                      {record.condition === 'heavy' && '重め'}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-[9px] text-slate-400">体重</span>
                    <span className="font-semibold text-slate-900">{record.weight.toFixed(1)}kg</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400">体脂肪</span>
                    <span className="text-slate-700">{record.bodyFat.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400">筋肉量</span>
                    <span className="text-slate-700">{record.muscleMass.toFixed(1)}kg</span>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-[11px] text-slate-500 font-sans line-clamp-2">
                    {record.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View: Wide Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-4 py-2.5">Weight (kg)</th>
                <th className="px-4 py-2.5">Body Fat (%)</th>
                <th className="px-4 py-2.5">Muscle (kg)</th>
                <th className="px-4 py-2.5">Ratio</th>
                <th className="px-4 py-2.5">State</th>
                <th className="px-5 py-2.5">Note</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedRecords.slice().reverse().map(record => {
                const ratio = ((record.muscleMass / record.weight) * 100).toFixed(1);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-2.5 text-slate-950">{record.date}</td>
                    <td className="px-4 py-2.5 text-slate-950 font-semibold tabular-nums">{record.weight.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">{record.bodyFat.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">{record.muscleMass.toFixed(1)}kg</td>
                    <td className="px-4 py-2.5 text-slate-900 tabular-nums">{ratio}%</td>
                    <td className="px-4 py-2.5 font-sans text-slate-500 text-[11px]">
                      {record.condition === 'excellent' && '絶好調'}
                      {record.condition === 'good' && '良好'}
                      {record.condition === 'bloated' && 'むくみ'}
                      {record.condition === 'tired' && '疲労'}
                      {record.condition === 'heavy' && '重め'}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
