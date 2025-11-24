export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const generateExamContentOpenAI = async (
  topic: string, 
  config: AIConfig
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("请在设置中填写 API Key");
  }

  // Normalize URL: remove trailing slash if present, ensure /v1/chat/completions
  let endpoint = config.baseUrl.trim();
  if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
  if (!endpoint.endsWith('/v1')) {
     // If user provided just the domain (e.g. https://api.openai.com), append /v1
     // If user provided full path, respect it.
     // Heuristic: if it doesn't have /v1, add it.
     if (!endpoint.includes('/v1')) {
        endpoint = `${endpoint}/v1`;
     }
  }
  const url = `${endpoint}/chat/completions`;

  const systemPrompt = `
你是一位严谨的高中数学出题老师。请根据用户提供的主题，生成一份标准的高中数学试卷内容（Markdown格式）。

**格式严格要求：**
1. **数学公式**：所有数学公式必须使用 LaTeX 格式。
   - 行内公式用单个美元符号包裹，例如 $f(x) = x^2$。
   - 必须使用标准的 LaTeX 语法。
2. **大题标题**：
   - 使用 '##' 作为大题标题（例如：## 一、填空题）。
   - 必须包含三个部分：一、填空题；二、选择题；三、解答题。
3. **小题格式**：
   - 使用数字列表（1. 2. 3.）。
   - 填空题的空格使用 "______"（6个下划线）。
   - 题目内容要专业，符合中国高中数学命题风格。
4. **大题介绍**：
   - 在每个大题标题下，必须有一段加粗的说明文字。
   - 填空题说明示例：**本大题共有 12 题，考生应在答题纸相应编号的空格内直接填写结果，第 1-6 题每个空格填对得 4 分，第 7-12 题每个空格填对得 5 分，否则一律得零分。**
   - 选择题说明示例：**本大题共 4 题，每题有且只有一个正确答案。**
   - 解答题说明示例：**本大题共有 5 题，解答下列各题必须在答题纸相应编号的规定区域内写出必要的步骤。**
   - 必须保留上述示例中的加粗格式（使用 **包裹）。
5. **解答题特殊格式**：
   - 解答题的大题号（如 17. 18.）后面紧跟分值说明。
   - 格式示例：17. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分。**
6. **不要**使用代码块（\`\`\`markdown），直接返回纯文本内容。
7. **图片**：如果题目涉及几何图形，请在适当位置插入一个示例 Markdown 图片语法：![Figure](https://placehold.co/400x300?text=Geometry+Figure)。

**内容要求：**
- 难度：高中二年级期中考试水平。
- 主题：${topic}
`;

  const body = {
    model: config.model || "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `请出卷：主题是“${topic}”` }
    ],
    temperature: 0.7,
    stream: false
  };

  try {
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
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("API returned empty content");
    
    return content;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to connect to AI API");
  }
};
