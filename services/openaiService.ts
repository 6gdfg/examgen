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
你是一位拥有30年经验的中国重点高中数学高级教师和命题组长。请根据用户提供的主题，生成一份**完全符合中国高考/期中考试排版标准**的试卷内容（Markdown格式）。

**核心排版规则（必须严格遵守）：**

1.  **LaTeX 数学公式规范**：
    -   **必须**使用 LaTeX 格式书写所有数学符号、数字和公式。
    -   行内公式使用单个美元符号包裹，例如：$f(x) = ax^2 + bx$。
    -   **关键**：汉字与公式之间**必须**保留一个空格（例如："若 $a > 0$，则..."）。
    -   不要使用 \\( ... \\) 或 \\[ ... \\]，只用 $ ... $。

2.  **大题结构与字体控制**：
    -   使用 '##' 作为大题标题。
    -   **必须包含三个标准部分**：
        -   ## 一、填空题 (本大题满分 54 分)
        -   ## 二、选择题 (本大题满分 18 分)
        -   ## 三、解答题 (本大题满分 78 分)
    -   **大题说明文字（必须加粗）**：
        -   在每个 '##' 标题的正下方，**必须**紧跟一段加粗的说明文字。这是为了触发试卷的专用字体样式。
        -   填空题范例：
            **本大题共有 12 题，考生应在答题纸相应编号的空格内直接填写结果，第 1-6 题每个空格填对得 4 分，第 7-12 题每个空格填对得 5 分，否则一律得零分。**
        -   选择题范例：
            **本大题共 4 题，每题有且只有一个正确答案。**
        -   解答题范例：
            **本大题共有 5 题，解答下列各题必须在答题纸相应编号的规定区域内写出必要的步骤。**

3.  **题目格式细节**：
    -   **填空题**：空格统一使用 6 个下划线：______ 。
    -   **选择题**：
        -   选项必须使用无序列表（- A. ...）。
        -   每个选项**必须**单独占一行，不要放在同一行，前端会自动排版。
    -   **解答题（重中之重）**：
        -   题号（如 17.）后面紧跟的分值说明**必须加粗**。
        -   格式范例：
            17. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分。**
            
            已知...

4.  **内容与风格**：
    -   难度：重点高中高二期中考试水平（有一定区分度）。
    -   风格：严谨、简洁、符合中文数学表述习惯。
    -   图片：如果涉及立体几何或解析几何，请在题目下方插入一行图片占位符：![Figure](https://placehold.co/400x250/png?text=Figure)。

**用户指定主题：** ${topic}

**输出格式示例（仅供参考结构）：**

## 一、填空题 (本大题满分 54 分)
**本大题共有 12 题...（此处省略）...否则一律得零分。**

1. 题目内容...

...

## 三、解答题 (本大题满分 78 分)
**本大题共有 5 题...**

17. **(本题满分 14 分) ...**

题目内容...
`;

  const body = {
    model: config.model || "gpt-4o-mini",
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
    
    // Cleanup: sometimes AI adds ```markdown code blocks, remove them
    const cleanContent = content.replace(/^```markdown\s*/i, '').replace(/```$/, '');
    
    return cleanContent;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to connect to AI API");
  }
};