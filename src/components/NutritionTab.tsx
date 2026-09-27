import React, { useState, useRef } from 'react';
import { Camera, ChevronRight, Sparkles, Trash2, Award } from 'lucide-react';
import { MealRecord, OdetteTargetProfile } from '../types';

interface NutritionTabProps {
  records: MealRecord[];
  targetProfile: OdetteTargetProfile;
  onAddMealRecord: (record: Omit<MealRecord, 'id' | 'createdAt'>) => void;
  onDeleteMealRecord: (id: string) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  records,
  targetProfile,
  onAddMealRecord,
  onDeleteMealRecord,
}) => {
  const [mealType, setMealType] = useState<MealRecord['mealType']>('昼食');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealRecord | null>(records[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_MEALS = [
    {
      title: 'サーモンとキヌアの抗炎症プレート',
      type: '昼食' as const,
      desc: 'サーモンとアスパラガスのグリル、キヌア、アボカド、白茶。',
      photoUrl: '/src/assets/images/ballet_nutrition_plate_1790506697431.jpg',
    },
    {
      title: 'レッスン前 軽快エナジーチャージ',
      type: 'レッスン前捕食' as const,
      desc: 'オーツ麦バナナブレッド1切れ、生アーモンド5粒、マヌカハニーレモンティー。',
      photoUrl: '',
    },
    {
      title: '夜間リカバリー＆筋修復スープ',
      type: '夜間リカバリー' as const,
      desc: '鶏ささみと生姜の根菜スープ、ブロッコリーと温玉、少なめ玄米。',
      photoUrl: '',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: typeof PRESET_MEALS[0]) => {
    setMealType(preset.type);
    setDescription(preset.desc);
    if (preset.photoUrl) {
      setPhotoPreview(preset.photoUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !photoPreview) {
      setErrorMessage('写真または食事内容の説明を入力してください。');
      return;
    }
    setErrorMessage(null);
    setIsLoadingAdvice(true);

    try {
      const response = await fetch('/api/nutrition-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoPreview,
          mimeType: 'image/jpeg',
          mealType: mealType,
          mealDescription: description,
          targetProfile: targetProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('栄養アドバイスの取得に失敗しました。');
      }

      const advice = await response.json();

      const newRecord: Omit<MealRecord, 'id' | 'createdAt'> = {
        date: new Date().toISOString().split('T')[0],
        mealType: mealType,
        photoUrl: photoPreview || undefined,
        description: description,
        aiAdvice: advice,
      };

      onAddMealRecord(newRecord);
      setSelectedMealForDetail(newRecord as MealRecord);
      setDescription('');
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const filteredRecords = filterType === 'all'
    ? records
    : records.filter(r => r.mealType === filterType);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>食事記録と写真解析</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">AI DIETITIAN</span>
            </div>

            {/* Presets: Horizontal swipeable chips on mobile */}
            <div className="mb-3.5">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">
                Quick Presets
              </span>
              <div className="flex sm:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {PRESET_MEALS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-sky-200 hover:bg-sky-50/50 text-xs transition-colors flex items-center justify-between group whitespace-nowrap sm:whitespace-normal shrink-0 bg-slate-50/60"
                  >
                    <span className="text-slate-700 text-[11px] sm:text-xs truncate">{preset.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2 group-hover:text-sky-900 hidden sm:inline">適用</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {/* Photo Upload Zone */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">
                  Photo / 写真
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                    photoPreview ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200 hover:border-sky-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="relative group">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-36 sm:h-44 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono">
                        写真を変更
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 sm:py-5 flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-5 h-5 mb-1.5 text-sky-600" />
                      <span className="text-xs text-slate-700 font-medium">写真を撮影または選択</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">JPEG / PNG</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meal Type: Scrollable / Grid */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">Meal Timing</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs font-mono">
                  {(['朝食', '昼食', 'レッスン前捕食', '夕食', '夜間リカバリー'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`min-h-[38px] py-1.5 px-1.5 text-[11px] rounded-md border transition-colors flex items-center justify-center text-center ${
                        mealType === type
                          ? 'bg-sky-50 text-sky-950 border-sky-300 font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-mono">
                  Description / 食事内容
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="例: サーモンとアスパラガスのグリル、キヌア。午後のリハーサル前に摂取。"
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoadingAdvice}
                className="w-full min-h-[44px] py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-300 rounded-md transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                {isLoadingAdvice ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>管理栄養士が分析中...</span>
                  </span>
                ) : (
                  <span>写真を保存して栄養アドバイスを生成</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Advice Details & History (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Active Advice Card */}
          {selectedMealForDetail && selectedMealForDetail.aiAdvice ? (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {selectedMealForDetail.date} · {selectedMealForDetail.mealType}
                  </div>
                  <h3 className="text-sm sm:text-base font-medium font-serif-jp text-slate-950 mt-1 flex items-center gap-1.5">
                    <span>管理栄養士 評価レポート</span>
                  </h3>
                </div>

                <div className="text-right font-mono bg-sky-50/70 px-2.5 py-1 rounded-lg border border-sky-100">
                  <div className="text-[9px] text-sky-800 uppercase tracking-wider">Score</div>
                  <div className="text-lg sm:text-xl font-light text-sky-950 tabular-nums font-mono">
                    {selectedMealForDetail.aiAdvice.score}
                    <span className="text-[10px] text-sky-600">/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-serif-jp bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {selectedMealForDetail.aiAdvice.summary}
              </p>

              {/* Calorie & PFC Stats */}
              <div className="grid grid-cols-4 gap-2 py-2.5 border-y border-slate-100 text-center font-mono bg-slate-50/40 rounded-lg">
                <div>
                  <span className="block text-[9px] text-slate-400">Calories</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
                    {selectedMealForDetail.aiAdvice.estimatedCalories}
                    <span className="text-[9px] font-normal text-slate-400 ml-0.5">kcal</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">Protein</span>
                  <span className="text-xs sm:text-sm font-semibold text-sky-900 tabular-nums">
                    {selectedMealForDetail.aiAdvice.pfcBalance.proteinGrams}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">Fat</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 tabular-nums">
                    {selectedMealForDetail.aiAdvice.pfcBalance.fatGrams}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400">Carbs</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 tabular-nums">
                    {selectedMealForDetail.aiAdvice.pfcBalance.carbsGrams}
                  </span>
                </div>
              </div>

              {/* Positive Points */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Odette Compatibility / 白鳥の湖 適合ポイント
                </span>
                <ul className="space-y-1 text-xs text-slate-700 font-serif-jp">
                  {selectedMealForDetail.aiAdvice.positivePoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvement Advice */}
              <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-100 text-xs">
                <span className="block text-[10px] font-mono text-sky-800 uppercase tracking-wider mb-1 font-semibold">
                  次回への改善アドバイス
                </span>
                <p className="text-slate-700 leading-relaxed font-serif-jp">
                  {selectedMealForDetail.aiAdvice.improvementAdvice}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-slate-400">
              <Camera className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">写真または食事内容を送信すると、管理栄養士の詳細レポートが表示されます。</p>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-mono bg-slate-50/50">
              <span className="font-semibold text-slate-900 tracking-wider">MEAL LOG HISTORY</span>
              <span className="text-slate-400">{filteredRecords.length} records</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredRecords.map(meal => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealForDetail(meal)}
                  className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    selectedMealForDetail?.id === meal.id ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {meal.photoUrl ? (
                      <img
                        src={meal.photoUrl}
                        alt="Meal"
                        className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200/80"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {meal.mealType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{meal.date}</span>
                      </div>
                      <p className="text-xs text-slate-900 font-sans truncate mt-1">
                        {meal.description || '写真のみ記録'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {meal.aiAdvice && (
                      <span className="text-xs font-mono font-semibold text-sky-950 tabular-nums">
                        {meal.aiAdvice.score}点
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMealRecord(meal.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      aria-label="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
