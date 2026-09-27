import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ChevronRight, Clock, Trash2, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { LessonJournal, OdetteTargetProfile } from '../types';

interface LessonJournalTabProps {
  journals: LessonJournal[];
  targetProfile: OdetteTargetProfile;
  onAddJournal: (journal: Omit<LessonJournal, 'id' | 'createdAt'>) => void;
  onDeleteJournal: (id: string) => void;
}

export const LessonJournalTab: React.FC<LessonJournalTabProps> = ({
  journals,
  targetProfile,
  onAddJournal,
  onDeleteJournal,
}) => {
  const [lessonType, setLessonType] = useState<LessonJournal['lessonType']>('オデットVa (第2幕)');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [transcript, setTranscript] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [selfReflection, setSelfReflection] = useState<string>('');
  const [fatigueLevel, setFatigueLevel] = useState<number>(3);
  const [selectedPainAreas, setSelectedPainAreas] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [selectedJournalForDetail, setSelectedJournalForDetail] = useState<LessonJournal | null>(journals[0] || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const recognitionRef = useRef<any>(null);

  const BALLET_PAIN_AREAS = [
    'アキレス腱',
    '足裏・母趾球',
    '甲・三角骨',
    '膝・側副靭帯',
    '股関節',
    '腰',
    '首・僧帽筋',
  ];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ja-JP';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => (prev ? `${prev} ` : '') + currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition not available:', e);
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('お使いのブラウザはWeb音声入力APIに対応していません。キーボードで直接ご入力いただけます。');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTogglePainArea = (area: string) => {
    if (selectedPainAreas.includes(area)) {
      setSelectedPainAreas(selectedPainAreas.filter(a => a !== area));
    } else {
      setSelectedPainAreas([...selectedPainAreas, area]);
    }
  };

  const insertSampleVoiceLog = () => {
    setTranscript('第2幕オデットのヴァリエーション。カンブレの時に肩甲骨を下げて、首を長く保つこと。白鳥の羽ばたきは腕だけでなく呼吸と背中から。アラスゴンドの回転の軸はブレずに回れたが、最後のパ・ド・ブレで足裏の音が少し鳴ってしまった。');
    setTeacherNotes('「視線をもっと遠く、王子の瞳を見つめるように。肩に力が入ると白鳥の儚さが消えてしまいます」');
    setSelfReflection('ポアントで床を撫でるように静かに移動することを意識する。');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() && !teacherNotes.trim() && !selfReflection.trim()) {
      setErrorMessage('音声入力または振り返り内容を入力してください。');
      return;
    }

    setErrorMessage(null);

    const newJournal: Omit<LessonJournal, 'id' | 'createdAt'> = {
      date: new Date().toISOString().split('T')[0],
      lessonType,
      durationMinutes,
      audioTranscript: transcript,
      teacherNotes,
      selfReflection,
      fatigueLevel,
      painAreas: selectedPainAreas,
    };

    onAddJournal(newJournal);
    setSelectedJournalForDetail(newJournal as LessonJournal);
    // Reset form
    setTranscript('');
    setTeacherNotes('');
    setSelfReflection('');
    setSelectedPainAreas([]);
  };

  const filteredJournals = filterType === 'all'
    ? journals
    : journals.filter(j => j.lessonType === filterType);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Logging Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-950 font-serif-jp tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>音声入力レッスン日報</span>
              </h2>
              <button
                type="button"
                onClick={insertSampleVoiceLog}
                className="text-[11px] text-slate-400 hover:text-sky-900 transition-colors font-mono"
              >
                サンプル挿入
              </button>
            </div>

            {/* Voice Recording Box with Swan Lake Ring Pulse */}
            <div className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              isListening
                ? 'bg-sky-50/70 border-sky-300 ring-4 ring-sky-100/70'
                : 'bg-slate-50/70 border-slate-200/80 hover:border-sky-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-900 flex items-center gap-1.5 font-serif-jp">
                    {isListening ? (
                      <span className="flex items-center gap-1.5 text-sky-800 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                        音声録音中...
                      </span>
                    ) : (
                      '音声入力で振り返りを記録'
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    マイクを押して稽古の感覚を話してください
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-xs ${
                    isListening
                      ? 'bg-sky-600 text-white shadow-[0_0_12px_rgba(2,132,199,0.5)]'
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950'
                  }`}
                  title={isListening ? '録音停止' : '録音開始'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {/* Lesson Type & Duration */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">稽古種別</label>
                  <select
                    value={lessonType}
                    onChange={e => setLessonType(e.target.value as LessonJournal['lessonType'])}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-sky-700"
                  >
                    <option value="バー＆センター">バー＆センター</option>
                    <option value="オデットVa (第2幕)">オデットVa (第2幕)</option>
                    <option value="グラン・パ・ド・ドゥ">グラン・パ・ド・ドゥ</option>
                    <option value="全幕通しリハーサル">全幕通しリハーサル</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">時間 (分)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 font-mono bg-white tabular-nums"
                  />
                </div>
              </div>

              {/* Speech Transcript */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  音声入力テキスト / 振り返り本文
                </label>
                <textarea
                  rows={3}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="音声入力した言葉が自動入力されます。直接入力も可能です。"
                  className="w-full p-2.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 leading-relaxed bg-white"
                />
              </div>

              {/* Teacher Notes */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  先生・指導者からの注意点
                </label>
                <input
                  type="text"
                  placeholder="例: 「肩を落とし、肩甲骨から羽を生やすように」"
                  value={teacherNotes}
                  onChange={e => setTeacherNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                />
              </div>

              {/* Self Reflection */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  自己反省・課題
                </label>
                <input
                  type="text"
                  placeholder="例: アダージョの静止バランスは安定。パ・ド・ブレの音を消したい。"
                  value={selfReflection}
                  onChange={e => setSelfReflection(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base sm:text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-700 bg-white"
                />
              </div>

              {/* Fatigue level (1-5) */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span>身体疲労度</span>
                  <span className="font-mono text-sky-950 font-semibold">Lv. {fatigueLevel} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFatigueLevel(lvl)}
                      className={`min-h-[38px] py-1 text-xs font-mono rounded-md border transition-colors flex items-center justify-center ${
                        fatigueLevel === lvl
                          ? 'bg-sky-50 text-sky-950 border-sky-300 font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain Areas */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  違和感・張りがある部位（怪我予防チェック）
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BALLET_PAIN_AREAS.map(area => {
                    const isSelected = selectedPainAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleTogglePainArea(area)}
                        className={`min-h-[34px] px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-50 text-sky-950 border-sky-300 font-medium'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 active:bg-slate-200'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>日報を保存</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Selected Journal Detail & Timeline Archive (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Selected Journal Detail View */}
          {selectedJournalForDetail ? (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="font-mono text-xs text-slate-400">
                    {selectedJournalForDetail.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 font-serif-jp bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {selectedJournalForDetail.lessonType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedJournalForDetail.durationMinutes}分
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    疲労 Lv.{selectedJournalForDetail.fatigueLevel}
                  </span>
                  <button
                    onClick={() => {
                      onDeleteJournal(selectedJournalForDetail.id);
                      setSelectedJournalForDetail(null);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reflection text */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Reflection & Notes
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-serif-jp whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                  {selectedJournalForDetail.audioTranscript || '振り返りメモなし'}
                </p>
              </div>

              {/* Teacher instructions */}
              {selectedJournalForDetail.teacherNotes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Teacher's Feedback / 先生の注意
                  </span>
                  <div className="text-xs text-slate-800 p-3 rounded-lg bg-sky-50/40 border border-sky-100 font-serif-jp">
                    {selectedJournalForDetail.teacherNotes}
                  </div>
                </div>
              )}

              {/* Self Reflection */}
              {selectedJournalForDetail.selfReflection && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Personal Focus / 自己反省
                  </span>
                  <div className="text-xs text-slate-800 p-3 rounded-lg bg-slate-50/70 border border-slate-100 font-serif-jp">
                    {selectedJournalForDetail.selfReflection}
                  </div>
                </div>
              )}

              {/* Pain areas */}
              {selectedJournalForDetail.painAreas.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono">注意部位:</span>
                  {selectedJournalForDetail.painAreas.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-slate-400">
              <p className="text-xs">日報を選択すると詳細が表示されます。</p>
            </div>
          )}

          {/* Timeline Archive List */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-mono bg-slate-50/50">
              <span className="font-semibold text-slate-900 tracking-wider">LESSON JOURNAL ARCHIVE</span>
              <span className="text-slate-400">{filteredJournals.length} entries</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredJournals.map(journal => (
                <div
                  key={journal.id}
                  onClick={() => setSelectedJournalForDetail(journal)}
                  className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    selectedJournalForDetail?.id === journal.id ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {journal.lessonType}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{journal.date}</span>
                      <span className="text-[10px] font-mono text-slate-400">{journal.durationMinutes}分</span>
                    </div>
                    <p className="text-xs text-slate-900 font-serif-jp truncate mt-1">
                      {journal.audioTranscript || journal.teacherNotes || '稽古記録'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJournal(journal.id);
                        if (selectedJournalForDetail?.id === journal.id) {
                          setSelectedJournalForDetail(null);
                        }
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
