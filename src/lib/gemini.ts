import { supabase } from './supabase';

const MODEL = 'gemini-2.0-flash';

let aiInitialized = false;

const requestLog: number[] = [];
let cooldownUntil = 0;
const responseCache = new Map<string, string>();

function isRateLimited(): boolean {
  const now = Date.now();
  const minuteAgo = now - 60000;
  while (requestLog.length && requestLog[0] < minuteAgo) requestLog.shift();
  return requestLog.length >= 10;
}

function getCachedResponse(key: string): string | undefined {
  return responseCache.get(key);
}

function cacheResponse(key: string, response: string) {
  responseCache.set(key, response);
  if (responseCache.size > 200) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
}

type Rule = { keywords: string[]; response: string };
const rules: Rule[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: "Hi there! Welcome to John Vince's portfolio. I'm his AI assistant. Feel free to ask me about his skills, experience, projects, or anything else!",
  },
  {
    keywords: ['how are you', 'how are you doing', 'what\'s up', 'sup'],
    response: "I'm doing great, thanks for asking! I'm here to help you learn more about John Vince Paisan. What would you like to know?",
  },
  {
    keywords: ['who are you', 'what are you'],
    response: "I'm John Vince Paisan's AI assistant! I can answer questions about his skills, work experience, projects, education, and more. Just ask away!",
  },
  {
    keywords: ['skills', 'technologies', 'tech stack', 'what does he know', 'proficient', 'expertise', 'technologies'],
    response: "John Vince's technical skills span three main areas:\n\n• Web Development: React, Node.js, Laravel, PHP, JavaScript, HTML, CSS, jQuery\n• Data & Systems: Python Automation, Data Analysis, MySQL, System Monitoring, Excel Macros, Financial Systems\n• Tools & Cloud: Google Cloud, Firebase, Git, VS Code, Google Sheets, Financial Reconciliation\n\nHe's worked with 20+ technologies overall!",
  },
  {
    keywords: ['experience', 'work', 'job', 'career', 'employment', 'background', 'professional'],
    response: "John Vince has 4+ years of professional experience:\n\n1. Settlement Associate at Guild Securities, Inc. (08/2025 - 01/2026) - Processed high-volume financial transactions with 99%+ accuracy\n2. Senior Data Input Associate at IQVIA (05/2023 - 05/2025) - Processed large-scale datasets with strict quality standards\n3. Junior Software Engineer at Acaciasoft Corporation (04/2022 - 04/2023) - Built web apps with Laravel, PHP, and MySQL\n4. Virtual Assistant / Data Support at Virtual Experts PH (04/2021 - 04/2022) - Automated workflows with Python scripts",
  },
  {
    keywords: ['education', 'degree', 'school', 'college', 'university', 'study', 'studied', 'academic', 'tesda'],
    response: "John Vince holds a Bachelor of Science in Information Systems from Advance Central College (2018-2022), where he graduated with honors and was recognized as Programmer of the Year. He also holds TESDA certifications in Java Programming NCIII and Visual Graphic Design NCIII.",
  },
  {
    keywords: ['project', 'portfolio', 'work sample', 'cloudnotes', 'financial reconciliation'],
    response: "John Vince has completed 15+ projects. Here are two featured ones:\n\n• CloudNotes: A secure cloud-based note management system with real-time data sync built with React, Supabase, and Auth. Live: cloudnotes-492733998894.asia-southeast1.run.app\n\n• Financial Reconciliation System: A high-accuracy transaction processing engine for settlement scenarios built with Python and data validation tools.\n\nCheck out his GitHub for more: https://github.com/jayveee07",
  },
  {
    keywords: ['contact', 'email', 'reach', 'message', 'get in touch', 'phone', 'number'],
    response: "You can reach John Vince through:\n• Email: jvpaisan@gmail.com\n• Phone: +63 970 763 9960\n• LinkedIn: https://www.linkedin.com/in/john-vince-p-b82409239\n• GitHub: https://github.com/jayveee07\n\nOr you can just keep chatting with me here and I'll pass along your message!",
  },
  {
    keywords: ['location', 'where is he based', 'where are you based', 'philippines', 'quezon city', 'manila'],
    response: "John Vince is based in Quezon City, Philippines. He speaks English and Filipino fluently.",
  },
  {
    keywords: ['resume', 'cv', 'curriculum vitae', 'hire', 'hiring', 'available'],
    response: "John Vince is available for projects! You can download his resume on the portfolio site or reach out directly at jvpaisan@gmail.com. He's open to full-time roles and project-based work.",
  },
  {
    keywords: ['github', 'git', 'repository', 'code', 'source'],
    response: "John Vince's GitHub profile is https://github.com/jayveee07. He has several projects including CloudNotes and a Financial Reconciliation System. Feel free to check out his repositories!",
  },
  {
    keywords: ['linkedin', 'profile', 'social'],
    response: "Connect with John Vince on LinkedIn: https://www.linkedin.com/in/john-vince-p-b82409239",
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
    response: "You're welcome! I'm glad I could help. If you have more questions about John Vince's work, feel free to ask. Otherwise, you can type 'agent' to speak directly with him!",
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'cya', 'take care'],
    response: "Thanks for stopping by! If you ever have more questions about John Vince's portfolio, just start a chat. Have a great day!",
  },
  {
    keywords: ['what can you do', 'help', 'commands', 'what do you do'],
    response: "I can tell you about John Vince's skills, work experience, education, projects, and contact info. Just ask me anything! You can also type 'agent' at any time to speak with John Vince directly.",
  },
  {
    keywords: ['agent', 'human', 'talk to human', 'talk to person', 'real person'],
    response: "\uD83D\uDD04 If you'd like to speak with John Vince directly, just type 'agent' in your next message and I'll hand you over to him!",
  },
];

function matchRule(text: string): string | null {
  const lower = text.toLowerCase().trim();
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) return rule.response;
    }
  }
  return null;
}

function smartFallback(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  if (/skill|know|tech|language|stack|tool/.test(lower)) {
    return matchRule('skills')!;
  }
  if (/job|work|experience|company|employ|role|position/.test(lower)) {
    return matchRule('experience')!;
  }
  if (/project|build|create|develop|app|application/.test(lower)) {
    return matchRule('project')!;
  }
  if (/educat|degree|school|college|study|graduate/.test(lower)) {
    return matchRule('education')!;
  }
  if (/contact|email|phone|reach|message/.test(lower)) {
    return matchRule('contact')!;
  }
  if (/about|who|tell|bio|background|profile|yourself/.test(lower)) {
    return "John Vince Paisan is a Full-Stack Developer, Data Operations Specialist, and Systems Administrator based in Quezon City, Philippines. With 4+ years of experience, he's built web applications, automated data workflows, and processed high-volume financial transactions. He's passionate about building digital experiences and solving real-world problems through code.";
  }

  const greetings = ["I'm not sure I understand, but I'd love to help! You can ask me about John Vince's skills, experience, projects, or education. Or type 'agent' to speak with him directly.",
    "Great question! While I may not have the exact answer, I can tell you about John Vince's background, projects, or technical expertise. What would you like to know?",
    "I'm still learning! Feel free to ask about John Vince's work experience, skills, or projects. For anything else, just type 'agent' to connect with him directly."];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

async function callEdgeFunction(action: string, params: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || anonKey}`,
      },
      body: JSON.stringify({ action, ...params }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function generateChatResponse(userMessage: string, visitorName: string) {
  if (!aiInitialized) {
    try {
      const testResponse = await callEdgeFunction('chat', { message: 'ping', visitorName: 'system' });
      if (testResponse) aiInitialized = true;
    } catch {
      return smartFallback(userMessage);
    }
  }

  if (Date.now() < cooldownUntil) return smartFallback(userMessage);

  const cacheKey = userMessage.toLowerCase().trim().slice(0, 100);
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  if (isRateLimited()) return smartFallback(userMessage);

  requestLog.push(Date.now());

  try {
    const response = await callEdgeFunction('chat', { message: userMessage, visitorName });
    const text = response.text || smartFallback(userMessage);
    cacheResponse(cacheKey, text);
    return text;
  } catch (err: any) {
    console.error('Gemini generateChatResponse error:', err);
    if (err?.status === 429 || err?.code === 429) {
      cooldownUntil = Date.now() + 120000;
    }
    return smartFallback(userMessage);
  }
}

export async function suggestAdminResponse(messages: unknown[], visitorName: string) {
  try {
    const history = (messages as Array<{ text: string; senderName: string }>)
      .slice(-10)
      .map(m => `${m.senderName}: ${m.text}`)
      .join('\n');

    const response = await callEdgeFunction('suggest', { history, visitorName });
    return response.text || null;
  } catch (err) {
    console.error('Gemini suggestAdminResponse error:', err);
    return null;
  }
}
