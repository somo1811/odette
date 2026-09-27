import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse large JSON payloads for base64 meal photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI server-side with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Registered Dietitian Advice for Ballet Dancers
app.post('/api/nutrition-advice', async (req, res) => {
  try {
    const { imageBase64, mimeType, mealType, mealDescription, targetProfile } = req.body;

    const systemInstruction = `あなたはプロのクラシックバレエ団専属のトップ管理栄養士（スポーツ栄養士）です。
対象ダンサーは、発表会で「白鳥の湖」の主役【オデット姫】を演じるために、極限まで磨かれた美しい白鳥のライン（細くしなやかで浮遊感のある体型）と、過酷な第2幕グラン・アダージョや長時間のヴァリエーションを踊りきる筋持久力を両立する厳格なボディメイクを行っています。
極端な欠食や不健康な絶食を戒め、怪我予防（疲労骨折・筋腱断裂防止）、むくみ予防（チュチュの着こなし）、舞台本番のスタミナ維持を徹底重視したプロの栄養アドバイスを提供してください。
必ず指定されたJSONフォーマットで回答してください。`;

    const promptText = `【食事区分】: ${mealType || '未指定'}
【食事内容・メモ】: ${mealDescription || '写真から分析してください'}
【目標ダンサープロファイル】:
- 目標役柄: 白鳥の湖 オデット姫
- 目標体重/体脂肪率/筋肉量コンディション: ${JSON.stringify(targetProfile || {})}

ダンサーの写真・食事内容を分析し、オデット役としての体調管理・筋維持・発表会当日に向けた具体的な栄養評価とアドバイスを日本語で提供してください。`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: 'バレエ・オデット食としての適合スコア (1〜100)',
            },
            summary: {
              type: Type.STRING,
              description: '食事に対する総評（1〜2文で温かく的確に）',
            },
            estimatedCalories: {
              type: Type.INTEGER,
              description: '推定総カロリー (kcal)',
            },
            pfcBalance: {
              type: Type.OBJECT,
              properties: {
                proteinGrams: { type: Type.STRING, description: 'タンパク質推定量 (例: 24g)' },
                fatGrams: { type: Type.STRING, description: '脂質推定量 (例: 12g)' },
                carbsGrams: { type: Type.STRING, description: '炭水化物推定量 (例: 45g)' },
              },
              required: ['proteinGrams', 'fatGrams', 'carbsGrams'],
            },
            positivePoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'オデット役に適している優れたポイント（箇条書き2〜3点）',
            },
            improvementAdvice: {
              type: Type.STRING,
              description: 'さらに良くするための栄養学的アドバイス（タイミング、足すべき微量栄養素、むくみ対策など）',
            },
            timingAdvice: {
              type: Type.STRING,
              description: 'リハーサルやレッスンとの時間配分に関するアドバイス',
            },
          },
          required: ['score', 'summary', 'estimatedCalories', 'pfcBalance', 'positivePoints', 'improvementAdvice'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Nutrition Advice Error:', error);
    res.status(500).json({
      error: '栄養アドバイスの生成に失敗しました。',
      details: error.message,
    });
  }
});

// Endpoint: AI Ballet Master Lesson Journal Feedback
app.post('/api/lesson-feedback', async (req, res) => {
  try {
    const {
      lessonType,
      transcript,
      teacherNotes,
      selfReflection,
      fatigueLevel,
      painAreas,
      rehearsalPart,
    } = req.body;

    const systemInstruction = `あなたは世界的な名門バレエ団で数々のプリマを育て上げた、情熱的で愛のある元プリンシパル・指導バレエマスターです。
現在、生徒は発表会で「白鳥の湖」のオデット（白鳥）役に挑戦しています。
オデット役に必要なのは：
1. 白鳥としての儚く美しいポール・ド・ブラ（肩甲骨から指先までの羽ばたき）とエポールマン（首・視線の角度）
2. 息の長いアダージョを支える体幹の引き上げと、アン・ドゥオールの安定
3. 悲哀と愛を表現する音楽性と叙情性
4. 過酷な舞台を怪我なく乗り切るためのケア

生徒の日報・音声振り返り・先生からの注意点・身体の違和感を読み込み、プロの指導者として励ましと技術的・精神的アドバイス、および怪我防止のケア提案を返してください。`;

    const promptText = `【レッスン種別】: ${lessonType || 'クラシックバレエ'}
【練習したパート】: ${rehearsalPart || '白鳥の湖 第2幕 アダージョ・コーダ等'}
【音声入力/日報本文】: ${transcript || 'なし'}
【指導者からの注意点】: ${teacherNotes || '特になし'}
【自己反省・気付き】: ${selfReflection || 'なし'}
【疲労度 (1〜5)】: ${fatigueLevel || 3}
【違和感・痛みがある部位】: ${Array.isArray(painAreas) ? painAreas.join('、') : painAreas || '特になし'}

上記を基に、オデット役としての完成度を高める指導講評を生成してください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            masterPraise: {
              type: Type.STRING,
              description: 'バレエマスターからの温かい賛辞・励ましの言葉',
            },
            odetteArtistryTip: {
              type: Type.STRING,
              description: 'オデットの役作り・ポール・ド・ブラ・表現力に関する深いアドバイス',
            },
            technicalCorrection: {
              type: Type.STRING,
              description: '注意された点や課題を克服するための具体的な身体の使い方（骨盤、足裏、引き上げ等）',
            },
            injuryPreventionCare: {
              type: Type.STRING,
              description: '疲労や違和感部位に対する、今日の夜に行うべき具体的なリカバリー指導（アイシング、マッサージ、ストレッチ）',
            },
            tomorrowMantra: {
              type: Type.STRING,
              description: '明日のバーレッスンで意識する一言テーマ（例: 「背中から腕を生やして」）',
            },
          },
          required: ['masterPraise', 'odetteArtistryTip', 'technicalCorrection', 'injuryPreventionCare', 'tomorrowMantra'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Lesson Feedback Error:', error);
    res.status(500).json({
      error: '指導講評の生成に失敗しました。',
      details: error.message,
    });
  }
});

// Setup Vite in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
