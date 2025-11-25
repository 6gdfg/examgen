
export type AIProvider = 'openai' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const generateExamContent = async (
  topic: string, 
  config: AIConfig
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("请在设置中填写 API Key");
  }

  const systemPrompt = `
你是一位拥有30年经验的中国重点高中数学高级教师和命题组长。请根据用户提供的主题，生成一份**完全符合中国高考/期中考试排版标准**的试卷内容（Markdown格式）。
直接输出试卷内容，不要客套话。
不要擅自主张加一些比如考试信息等无关的，我只要题目。从一、填空题开始你的回复。

**严厉的排版与内容规则（必须100%遵守）：**

1.  **标点与字体规范**：
    -   **所有中文句号（。）必须强制改为英文句号（.）**。这是数学试卷的标准。
    -   所有英文字母（如 x, y, a, b）和数字必须使用 LaTeX 格式（如 $x$）或依赖西文字体，不要使用全角字符。
    -   小题序号必须使用**中文括号**，但括号内的数字必须是 Times New Roman 字体（系统会自动处理，你只需写普通数字）。
    -   格式示例：**（1）** 而不是 (1)。

2.  **LaTeX 数学公式**：
    -   **必须**使用 LaTeX 格式书写所有数学符号、数字和公式。
    -   行内公式使用单个美元符号包裹，例如：$f(x) = ax^2 + bx$。
    -   汉字与公式之间**必须**保留一个空格。

3.  **大题结构（重要变更）**：
    -   **绝对不要使用 Markdown 的标题语法（如 ##）**。
    -   **大题标题与大题说明必须合并为同一段落，且整体加粗**。
    -   格式必须严格如下（注意连在一起）：
        
        **一、填空题 (本大题满分 54 分) 本大题共有 12 题，考生应在答题纸相应编号的空格内直接填写结果，第 1-6 题每个空格填对得 4 分，第 7-12 题每个空格填对得 5 分，否则一律得零分.**
        
        **二、选择题 (本大题满分 18 分) 本大题共 4 题，每题有且只有一个正确答案.**
        
        **三、解答题 (本大题满分 78 分) 本大题共有 5 题，解答下列各题必须在答题纸相应编号的规定区域内写出必要的步骤.**

4.  **题目格式细节**：
    -   **填空题**：空格统一使用 6 个下划线：______ .
    -   **选择题**：选项必须使用无序列表（- A. ...），每个选项单独占一行。
    -   **解答题（严格分值分布）**：
        -   必须严格按照以下题号和分值出题：
            -   **17. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分.**
            -   **18. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分.**
            -   **19. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分.**
            -   **20. **(本题满分 18 分) 本题共有 3 个小题，第 1 小题满分 4 分，第 2 小题满分 6 分，第 3 小题满分 8 分.**
            -   **21. **(本题满分 18 分) 本题共有 3 个小题，第 1 小题满分 4 分，第 2 小题满分 6 分，第 3 小题满分 8 分.**
        -   **强制换行**：在小题（1）、（2）之间，**必须**插入一个空行，绝对不能挤在同一行。
        -   格式范例：
            17. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分.**
            
            已知函数 $f(x) = ...$
            
            （1） 求 $f(x)$ 的定义域；
            
            （2） 若 $f(x) > 0$，求 $x$ 的取值范围.

5.  **内容要求**：
    -   主题：${topic}。
    -   难度：重点高中高二期中考试水平（压轴题要有难度）。
    -   图片：如需几何图形，插入: ![Figure](https://placehold.co/300x200/png?text=Figure).

`;

  // --- OpenAI Compatible Handler ---
  if (config.provider === 'openai') {
    let endpoint = config.baseUrl.trim();
    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
    // Auto-append /v1 if missing (common heuristic)
    if (!endpoint.includes('/v1') && !endpoint.includes('generate')) {
       endpoint = `${endpoint}/v1`;
    }
    const url = `${endpoint}/chat/completions`;

    const body = {
      model: config.model || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `请出卷：主题是“${topic}”` }
      ],
      temperature: 0.7,
      stream: false
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return cleanResponse(data.choices?.[0]?.message?.content);
  }

  // --- Gemini Handler ---
  else if (config.provider === 'gemini') {
    // Construct Gemini URL
    // Default Proxy: https://api-proxy.me/gemini
    // Target Format: {baseUrl}/v1beta/models/{model}:generateContent?key={apiKey}
    
    let baseUrl = config.baseUrl.trim();
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    // Safety check for path duplication if user pasted full path
    const model = config.model || "gemini-1.5-flash";
    const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const body = {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\n请出卷：主题是“${topic}”` }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) throw new Error("Gemini API returned empty content");
    return cleanResponse(content);
  }

  throw new Error("Unknown Provider");
};

const cleanResponse = (content: string | undefined) => {
  if (!content) return "";
  // Remove markdown code blocks if AI adds them
  return content.replace(/^```markdown\s*/i, '').replace(/```$/, '');
};
