import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    hasSerpApiKey: !!process.env.SERPAPI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

interface WebSearchSource {
  title: string;
  link: string;
  snippet?: string;
}

interface SerpApiSearchResult {
  sources: WebSearchSource[];
  summaryText: string;
}

// SerpApi Search Integration Function
async function searchWithSerpApi(query: string): Promise<SerpApiSearchResult | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('hl', 'ar');
    url.searchParams.set('gl', 'om');
    url.searchParams.set('num', '5');

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`SerpApi request failed with status: ${res.status}`);
      return null;
    }

    const data: any = await res.json();
    const sources: WebSearchSource[] = [];
    const snippets: string[] = [];

    // 1. Check Answer Box / Direct Answer
    if (data.answer_box) {
      const box = data.answer_box;
      const answer = box.answer || box.snippet || box.title || '';
      if (answer) {
        snippets.push(`[إجابة سريعة من Google]: ${answer}`);
        if (box.link) {
          sources.push({
            title: box.title || 'إجابة مباشرة من محرك البحث',
            link: box.link,
            snippet: answer,
          });
        }
      }
    }

    // 2. Check Knowledge Graph
    if (data.knowledge_graph) {
      const kg = data.knowledge_graph;
      const title = kg.title || '';
      const desc = kg.description || '';
      if (title || desc) {
        snippets.push(`[لوحة المعرفة]: ${title} - ${desc}`);
        if (kg.source?.link) {
          sources.push({
            title: title || 'معلومات موثقة',
            link: kg.source.link,
            snippet: desc,
          });
        }
      }
    }

    // 3. Check Organic Results
    if (Array.isArray(data.organic_results)) {
      for (const item of data.organic_results.slice(0, 4)) {
        if (item.title && item.link) {
          const snip = item.snippet || '';
          sources.push({
            title: item.title,
            link: item.link,
            snippet: snip,
          });
          snippets.push(`- مصدر: "${item.title}"\n  مقتطف: ${snip}\n  رابط: ${item.link}`);
        }
      }
    }

    if (sources.length === 0 && snippets.length === 0) {
      return null;
    }

    return {
      sources,
      summaryText: snippets.join('\n\n'),
    };
  } catch (error) {
    console.error('Error executing SerpApi web search:', error);
    return null;
  }
}

// Standalone Web Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'يرجى تقديم استعلام البحث' });
    }
    const result = await searchWithSerpApi(query);
    return res.json({
      success: !!result,
      hasKey: !!process.env.SERPAPI_API_KEY,
      result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint: Generate 5 Bloom-taxonomy classified questions
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { grade, subject, unitTitle, lessonTitle, customTopic, focusLevels } = req.body;

    const subjectArabicMap: Record<string, string> = {
      physics: 'الفيزياء',
      chemistry: 'الكيمياء',
      biology: 'الأحياء',
    };
    const subjectName = subjectArabicMap[subject] || subject;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'لم يتم العثور على مفتاح API، يرجى تهيئة المفتاح في الإعدادات أو استخدام بنك الأسئلة المدمج.',
        fallback: true,
      });
    }

    const systemPrompt = `أنت خبير تربوي ومستشار أول لمناهج كامبريدج المطبقة في سلطنة عمان لصفوف المرحلة الثانوية (10، 11، 12) في مواد العلوم (الفيزياء، الكيمياء، الأحياء).
قاعدة صارمة وإلزامية: يجب الالتزام التام والحصري بقائمة الوحدات والدروس الرسمية المعتمدة في سلطنة عُمان، ولا يُسمح لك نهائياً بتأليف أو اختراع أو إضافة أي وحدة أو درس خارج المنهج المعتمد.
مهمتك توليد 5 أسئلة علمية باللغة العربية الفصحى مع مصطلحات كامبريدج المعتمدة في عمان، موزعة بدقة على مستويات تصنيف بلوم للأهداف التعليمية:
1. التذكر (Remembering): استرجاع تعريف، صيغة، وحدة، أو حقيقة علمية.
2. الفهم (Understanding): تفسير، تعليل، مقارنة، توضيح سبب ظاهرة علمية.
3. التطبيق (Applying): مسألة حسابية رقمية أو تطبيق قانون علمي مع خطوات تعويض ووحدات دولية.
4. التحليل (Analyzing): تحليل رسم بياني أو جدول بيانات تجريبية واستنتاج علاقات أو حساب ميل.
5. التقييم (Evaluating): نقد تجربة، تحديد مصادر خطأ عملي، أو تبرير اختيار علمي.
6. الابتكار (Creating): تصميم تجربة أو اقتراح حل لمشكلة علمية أو بيئية.

يجب أن تكون الأسئلة الـ 5 عالية الجودة، متوافقة بدقة مع مخرجات التعلم في سلطنة عمان للدرس والوحدة المحددين، وتتضمن:
- نص السؤال بدقة وصياغة امتحانية وزارية.
- نموذج إجابة نموذجي مفصل يوضح خطوات الحل، القوانين، والتعويض الرياضي إن وجد.
- معايير تصحيح (Rubric/Marking Scheme) بالدرجات لكل خطوة.
- توضيح المهارة الإدراكية والتفسير العلمي وتلميح مساعد للطالب.`;

    const userPrompt = `قم بتوليد 5 أسئلة في مادة: ${subjectName}
الصف: ${grade} (المرحلة الثانوية - سلطنة عمان)
الوحدة: ${unitTitle || 'عامة'}
الدرس: ${lessonTitle || 'الدرس المختار'}
${customTopic ? `التركيز الخاص على المفهوم: ${customTopic}` : ''}
${focusLevels && focusLevels.length > 0 ? `المستويات المستهدفة بشكل خاص: ${focusLevels.join(', ')}` : 'يجب أن تغطي الأسئلة الـ 5 تنوعاً متوازناً من مستويات بلوم (تذكر، فهم، تطبيق، تحليل، تقييم/ابتكار)'}

المطلوب إرجاع مصفوفة JSON تحتوي على 5 كائنات أسئلة точно وفق الـ Schema المحددة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'مصفوفة تحتوي على 5 أسئلة علمية مصنفة حسب مستويات بلوم',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              number: { type: Type.INTEGER },
              bloomLevel: {
                type: Type.STRING,
                description: 'أحد القيم: remembering, understanding, applying, analyzing, evaluating, creating',
              },
              bloomLevelArabic: { type: Type.STRING },
              cognitiveSkill: { type: Type.STRING, description: 'المهارة الإدراكية المستهدفة' },
              questionText: { type: Type.STRING },
              contextOrData: { type: Type.STRING, description: 'بيانات، سياق تجريبي، أو قيم عددية' },
              marks: { type: Type.INTEGER },
              modelAnswer: { type: Type.STRING, description: 'نموذج الإجابة الكامل والمفصل' },
              explanation: { type: Type.STRING, description: 'الشرح والأساس العلمي' },
              hint: { type: Type.STRING, description: 'تلميح ذكي لا يكشف الحل كاملاً' },
              criteria: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'معايير توزيع الدرجات',
              },
            },
            required: [
              'number',
              'bloomLevel',
              'bloomLevelArabic',
              'cognitiveSkill',
              'questionText',
              'marks',
              'modelAnswer',
              'explanation',
              'hint',
              'criteria',
            ],
          },
        },
      },
    });

    const responseText = response.text?.trim() || '[]';
    const questions = JSON.parse(responseText);

    // Ensure IDs and numbers are clean
    const formattedQuestions = questions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `gen-${Date.now()}-${idx + 1}`,
      number: idx + 1,
    }));

    return res.json({ success: true, questions: formattedQuestions });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'حدث خطأ أثناء توليد الأسئلة',
      fallback: true,
    });
  }
});

// API endpoint: Smart Science Tutor
app.post('/api/smart-tutor', async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      context,
      enableWebSearch = true 
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح الذكاء الاصطناعي غير متوفر حالياً.',
        reply: 'أهلاً بك يا بطل العلوم! مفتاح الذكاء الاصطناعي قيد التجهيز، ولكن يمكنك استكشاف الأسئلة والسبورة التفاعلية الآن.',
      });
    }

    const { grade = 11, subject = 'الفيزياء', unitTitle = '', lessonTitle = '', mode = 'explain', currentQuestion } = context || {};

    let modeInstruction = '';
    switch (mode) {
      case 'socratic':
        modeInstruction = 'استخدم الطريقة السقراطية: لا تعطِ الإجابة النهائية مباشرة للطالب، بل اطرح عليه سؤالاً تفكيرياً يقوده إلى الخطوة التالية، وقدّم له تلميحاً محفزاً يشجعه على الاستنتاج بنفسه.';
        break;
      case 'step_by_step':
        modeInstruction = 'قدّم حلاً نموذجياً خطوة بخطوة: ابدأ بكتابة المعطيات والمطلوب، ثم القانون الرياضي أو المعادلة الكيميائية، ثم التعويض بالأرقام مع الوحدات الدولية بدقة تامة.';
        break;
      case 'lab':
        modeInstruction = 'ركز على الجانب العملي والمخبري: اشرح خطوات التجربة المعملية، أدوات القياس (مثل الميكرومتر، البوابات الضوئية، السحاحة)، مصادر الخطأ التجريبي، واحتياطات السلامة والأمان المخبري المعتمدة في عمان.';
        break;
      default:
        modeInstruction = 'قدّم شرحاً علمياً سلساً ومبسّطاً: اربط المفهوم بأمثلة واقعية من البيئة العمانية والصناعات المحلية كلما أمكن، واستخدم تشبيهات تقرب الفكرة لعقل الطالب.';
    }

    // Perform real-time web search via SerpApi if enabled and API key is present
    let searchResult: SerpApiSearchResult | null = null;
    if (enableWebSearch && process.env.SERPAPI_API_KEY && message) {
      try {
        const searchQuery = `${message.trim()} ${lessonTitle ? lessonTitle : subject}`.slice(0, 100);
        searchResult = await searchWithSerpApi(searchQuery);
      } catch (searchErr) {
        console.warn('SerpApi search execution warning:', searchErr);
      }
    }

    const webSearchContext = searchResult
      ? `\n\n[أحدث نتائج البحث الحيّة من شبكة الإنترنت عبر محرك البحث Google / SerpApi]:
${searchResult.summaryText}

توجيه خاص بالبحث:
لقد تم تزويدك بنتائج ومعلومات حية وموثقة من الإنترنت بناءً على استفسار الطالب. وظّف هذه النتائج لتقديم معلومات علمية دقيقة ومحدثة مع الإشارة إلى التطبيقات العلمية الحديثة ومصادر المعرفة الموثوقة بروح تربوية مشجعة.`
      : '';

    const systemPrompt = `أنت "المعلم الذكي" في تطبيق 'بلوم للعلوم'، معلم علوم عماني ودود، متخصص وخبير في مناهج كامبريدج في سلطنة عمان للمرحلة الثانوية.
أنت تتحدث مع طالب في الصف ${grade} يدرس مادة: ${subject}.
الدرس الحالي: ${lessonTitle || 'درس العلوم'}${unitTitle ? ` ضمن ${unitTitle}` : ''}.
${currentQuestion ? `سؤال الاختبار النشط الذي يدرسه الطالب حالياً:
[المستوى: ${currentQuestion.bloomLevelArabic}]
[نص السؤال: ${currentQuestion.questionText}]
[نموذج الإجابة: ${currentQuestion.modelAnswer}]` : ''}

أسلوبك وتوجيهاتك:
1. ${modeInstruction}
2. تحدّث باللغة العربية الفصحى التربوية اللطيفة والواثقة، مشجعاً الطالب (يا بطل العلوم، يا عالم المستقبل، أحسنت التفكير...).
3. استخدم الترميز الرياضي والعلمي الواضح (مثل الصيغ الكيميائية والوحدات: m/s, kg, mol, pH).
4. حافظ على إجابات ذات طول معتدل ومنظمة في نقاط أو فقرات قصيرة سهلة القراءة.
5. يمكنك تشجيع الطالب على استخدام "السبورة التفاعلية" لرسم المسألة أو المخطط البياني.
6. التزم التزاماً صارماً بوحدة ودرس المنهج العماني الرسمي المعتمد للطالب ولا تؤلف أو تبتكر وحدات أو دروساً خارجها.${webSearchContext}`;

    const chatHistory = conversationHistory.slice(-6).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Generate content using gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'عذراً يا بطل، لم أستطع صياغة الإجابة بدقة، هل يمكنك إعادة صياغة سؤالك؟';

    return res.json({ 
      reply: replyText,
      isWebSearchUsed: !!searchResult,
      webSources: searchResult?.sources || [],
    });
  } catch (error: any) {
    console.error('Error in smart tutor:', error);
    return res.status(500).json({
      error: error.message || 'حدث خطأ أثناء التواصل مع المعلم الذكي',
      reply: 'أهلاً بك! واجهت صعوبة في الاتصال مؤقتاً، يرجى المحاولة مرة أخرى.',
    });
  }
});

// API endpoint: Evaluate student's answer
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { questionText, bloomLevel, marks = 4, modelAnswer, criteria = [], studentAnswer, subject, grade } = req.body;

    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'إجابة الطالب فارغة' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Basic heuristic grading if API is not available
      const wordCount = studentAnswer.trim().split(/\s+/).length;
      const estimatedScore = Math.min(marks, Math.max(1, Math.round((wordCount / 20) * marks)));
      return res.json({
        score: estimatedScore,
        maxScore: marks,
        feedback: 'تم التقييم المبدئي استناداً إلى المعايير العامة. للحصول على تحليل تفصيلي بالذكاء الاصطناعي، يرجى ربط المفتاح.',
        strengths: ['المحاولة والمشاركة الفعالة في صياغة الحل'],
        improvements: ['قارن حلك بنموذج الإجابة الرسمي في الأسفل لتدقيق المصطلحات والوحدات.'],
      });
    }

    const systemPrompt = `أنت مصحح امتحانات خبير في وزارة التربية والتعليم بسلطنة عمان لمناهج كامبريدج للعلوم للمرحلة الثانوية.
مهمتك تقييم إجابة الطالب بدقة وإنصاف بناءً على:
- نص السؤال
- المستوى الإدراكي لتصنيف بلوم: ${bloomLevel}
- الدرجة الكلية: ${marks}
- نموذج الإجابة الرسمي
- معايير التصحيح (Marking Scheme)

يجب عليك:
1. تقدير الدرجة المستحقة بدقة من ${marks} (عدد صحيح أو نصف درجة).
2. تقديم تعليق تقييمي بنّاء ومشجع للطالب يوضح أين أصاب وأين نقصت إجابته.
3. استخراج نقاط القوة في الإجابة.
4. تحديد أوجه التحسين أو الكلمات المفتاحية الناقصة (مثل الوحدات الدولية، خطوات التعويض، أو المصطلحات العلمية الدقيقة).`;

    const userPrompt = `بيانات السؤال:
السؤال: ${questionText}
الدرجة القصوى: ${marks}
مستوى بلوم: ${bloomLevel}
نموذج الإجابة:
${modelAnswer}
معايير التصحيح:
${criteria.join('\n')}

إجابة الطالب المقدمة:
"${studentAnswer}"

قم بتقييم الإجابة وأرجع النتيجة كـ JSON strictly حسب الـ Schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'الدرجة التي حصل عليها الطالب' },
            maxScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING, description: 'التغذية الراجعة التقييمية الشاملة' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'نقاط القوة في إجابة الطالب',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'نقاط تحتاج للتحسين وتدقيق',
            },
          },
          required: ['score', 'maxScore', 'feedback', 'strengths', 'improvements'],
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({
      score: 0,
      maxScore: req.body.marks || 4,
      feedback: 'تعذر تقييم الإجابة آلياً في الوقت الراهن، يُرجى الرجوع لنموذج الإجابة.',
      strengths: [],
      improvements: [],
    });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`بلوم للعلوم - الخادم يعمل بنجاح على المنفذ http://localhost:${PORT}`);
  });
}

startServer();
