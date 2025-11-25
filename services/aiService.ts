
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
题号直接1.xxx换行 2.xxx就行
没有特殊说明尽量不要出需要图片的题目。
请严格按照每道大题规定的题数出题，填空题12道，选择题4道，解答题5道。

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
    -   格式必须严格如下（必须连在一起，不要在”本大题满分 54 分“和”本大题共有 12 题“之间换行！！！）：
        
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
    -   难度：重点高中高二期中考试水平,难度高（普通题不要很简单，压轴题要有难度，尤其是12题、16题和20、21题的最后一小问）。
    -   可以搜索网络题库，不一定要自己原创，但是请简单检查一遍题目不要有错误。
6.  参考内容：请仔细分析下面这张试卷出题思路，模仿出一份难度差不多的卷子，不要照抄。
### 一、填空题 (本大题满分 54 分) 本大题共有 12 题，考生应在答题纸相应编号的空格内直接填写结果，第 1-6 题每个空格填对得 4 分，第 7-12 题每个空格填对得 5 分，否则一律得零分。

1.  直线 $\sqrt{2}x - 4y + 5 = 0$ 的倾斜角为\_\_\_\_\_。

2.  双曲线 $\frac{x^2}{9} - y^2 = 1$ 的实轴长为\_\_\_\_\_。

3.  若椭圆焦点为 $F_1(0, -3)$、$F_2(0, 3)$，且长半轴的长等于 5，则该椭圆的标准方程为\_\_\_\_\_。

4.  已知圆 $x^2 + y^2 - 4x - m = 0$ 的面积为 $\pi$，则实数 $m = \_\_\_\_\_$.

5.  焦点在 $x$ 轴正半轴上，且焦点到准线的距离是 4 的抛物线的标准方程为\_\_\_\_\_。

6.  已知直线 $MN$ 经过椭圆 $\frac{x^2}{4} + \frac{y^2}{2} = 1$ 的右焦点 $F_2$，并与椭圆交于 $M$、$N$ 两点，其左焦点为 $F_1$，则 $\triangle F_1MN$ 的周长为\_\_\_\_\_。

7.  若圆 $x^2+y^2=4$ 与圆 $x^2+y^2-2ax+a^2-1=0$ 内切，则实数 $a=\_\_\_\_\_$.

8.  如图，探照灯反射镜由抛物线的一部分绕对称轴旋转而成，已知灯口圆的直径为 60 cm，灯的深度为 40 cm，将反射镜的旋转轴与镜面的交点称为反射镜的顶点，为了保证发出的光线经过反射之后平行射出，光源应安置在抛物线的焦点位置，此时光源与顶点相距\_\_\_\_\_ cm。

9.  我们把由半椭圆 $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 (x \ge 0)$ 与半椭圆 $\frac{y^2}{b^2} + \frac{x^2}{c^2} = 1 (x \le 0)$ 合成的曲线称作“果圆”，其中 $a^2 = b^2 + c^2$, $a > b > 0$, $b > c > 0$。如图，点 $F_0, F_1, F_2$ 是相应椭圆的焦点，若 $\triangle F_0F_1F_2$ 是周长为 1 的等边三角形，则 $a+b+c = \_\_\_\_\_$.

10. 过抛物线 $y^2 = 4x$ 的焦点的直线与抛物线相交于 $A$、$B$ 两点，弦 $AB$ 中点的横坐标为 2，则弦 $AB$ 的长为\_\_\_\_\_。

11. 已知椭圆 $\frac{x^2}{4} + \frac{y^2}{3} = 1$，$A, B$ 是椭圆上的两点，线段 $AB$ 的垂直平分线与 $x$ 轴相交于点 $P(x_0, 0)$，则 $x_0$ 的取值范围是\_\_\_\_\_。

12. 设动点 $P$ 到两定点 $F_1(-1, 0)$ 和 $F_2(1, 0)$ 的距离分别为 $d_1$ 和 $d_2$，$\angle F_1PF_2 = 2\theta$，且存在常数 $\lambda (0 < \lambda < 1)$，使得 $d_1 d_2 \sin^2\theta = \lambda$。过点 $F_2$ 的直线与动点 $P$ 的轨迹交于 $A, B$ 两点，且 $A, B$ 两点的横坐标都大于 0，$\triangle F_1AB$ 是以点 $B$ 为直角顶点的等腰直角三角形，则 $\lambda = \_\_\_\_\_$.

---

### 二、选择题 (本大题满分 18 分) 本大题共有 4 题，每题有且只有一个正确答案，考生应在答题纸的相应编号上，将代表答案的小方格涂黑，第 13-14 题每题选对得 4 分，第 15-16 题每题选对得 5 分，否则一律得零分。

13. 用离心率作为衡量指标，下列四个椭圆中（ ）最接近圆。
    A. $\frac{x^2}{4} + \frac{y^2}{3} = 1$
    B. $\frac{x^2}{16} + \frac{y^2}{12} = 1$
    C. $x^2 + 4y^2 = 36$
    D. $5x^2 + 3y^2 = 30$

14. 已知曲线 $C: mx^2+ny^2=1$，则下列结论不正确的是（ ）。
    A. 若 $m=n>0$，则 $C$ 是两条直线
    B. 若 $m>n>0$，则 $C$ 是圆，其半径为 $\sqrt{n}$
    C. 若 $m>n>0$，则 $C$ 是椭圆，其焦点在 $y$ 轴上
    D. 若 $mn<0$，则 $C$ 是双曲线，其渐近线方程为 $y = \pm \sqrt{-\frac{m}{n}}x$

15. 若点 $A(-2, 6), B(12, 6)$ 到直线 $l$ 的距离都等于 7，则直线 $l$ 的不同位置有（ ）。
    A. 1 种
    B. 2 种
    C. 3 种
    D. 无数种

16. 在平面直角坐标系 $xOy$ 中，对于定点 $P(a, b)$，记点集 $M = \{(x,y) | |x-a| \le 1, |y-b| \le 1\}$ 中距离原点 $O$ 最近的点为点 $Q_P$，此最近距离为 $d_P$。当点 $P$ 在曲线 $x^2+y^2-8x-4y+16=0$ 上运动时，有如下两个命题：①点 $Q_P$ 的轨迹是一个圆；②$d_P$ 的取值范围是 $[\sqrt{10}-2, \sqrt{10}+2]$。则（ ）。
    A. ①成立，②成立
    B. ①成立，②不成立
    C. ①不成立，②成立
    D. ①不成立，②不成立

---

### 三、解答题 (本大题满分 78 分) 本大题共有 5 题，解答下列各题必须在答题纸相应编号的规定区域内写出必要的步骤。

17. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分。**
    已知直线 $l_1: 6x+(t-1)y-8=0$，直线 $l_2: (t+4)x+(t+6)y-16=0$。
    (1) 若 $l_1 \perp l_2$，求实数 $t$ 的值；
    (2) 若 $l_1 \parallel l_2$，求实数 $t$ 的值，并求平行直线 $l_1$ 和 $l_2$ 之间的距离。

18. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分。**
    已知双曲线 $\Gamma: \frac{x^2}{16} - \frac{y^2}{9} = 1$，其右顶点为 $P$，右焦点为 $F_2$。
    (1) 求以 $P$ 为圆心，且与双曲线 $\Gamma$ 的两条渐近线都相切的圆的标准方程；
    (2) 设直线 $l$ 经过 $F_2$ 且与 $\Gamma$ 的两条渐近线中的一条平行，与另一条相交且交点在第一象限，求直线 $l$ 被（1）中圆 $P$ 截得的弦长。

19. **(本题满分 14 分) 本题共有 2 个小题，第 1 小题满分 6 分，第 2 小题满分 8 分。**
    在沿海或岛屿上选择三个适当的地点，建立一个主导航台 $F_1$ 和两个副导航台 $F_2$，$F_3$。船 $S$ 上的定位仪仅能接收从三个台发来的无线电信号。现设导航台 $F_1$ 和 $F_2$ 相距 500 海里，在船 $S$ 的定位仪上读得两台同时发出的无线电信号到达的时间差为 $2000 \mu s$（$\mu s$ 表示微秒，$1 \mu s = 10^{-6} s$），已知无线电在空气中传播的速度为 161987 海里/秒，以 $\overrightarrow{F_1F_2}$ 的方向为 $x$ 轴正方向，线段 $F_1F_2$ 的垂直平分线为 $y$ 轴，建立平面直角坐标系。
    (1) 试确定船 $S$ 所在的曲线的方程（数值精确到整数）；
    (2) 已知副导航台 $F_3$ 的坐标为 $(0, -500)$，三个台同时发出无线电信号，船 $S$ 先收到了 $F_3$ 发来的信号，又读得 $F_1$ 和 $F_2$ 发出的无线电信号到达的时间差为 0，求船 $S$ 的位置（数值精确到整数）。

20. **(本题满分 18 分) 本题共有 3 个小题，第 1 小题满分 4 分，第 2 小题满分 6 分，第 3 小题满分 8 分。**
    已知抛物线 $C: y^2=2px (p>0)$，其准线方程为 $x+1=0$。直线 $l$ 过点 $T(t, 0) (t>0)$ 且与抛物线交于 $A$、$B$ 两点，$O$ 为坐标原点。
    (1) 求抛物线 $C$ 的方程；
    (2) 当 $t=2$ 时，求证：$\overrightarrow{OA} \cdot \overrightarrow{OB}$ 的值与直线 $l$ 的倾斜角的大小无关；
    (3) 若 $P$ 为抛物线上的动点，记 $|PT|$ 的最小值为 $d(t)$，求函数 $y=d(t)$ 的解析式。

21. **(本题满分 18 分) 本题共有 3 个小题，第 1 小题满分 4 分，第 2 小题满分 6 分，第 3 小题满分 8 分。**
    已知椭圆 $C: \frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 (a>b>0)$，定义第 $n (n \ge 1, n \in N)$ 次操作为：经过 $C$ 上点 $A_n(x_n, y_n)$ 作斜率为 $k$ 的直线与 $C$ 交于另一点 $B_n$，记 $B_n$ 关于 $x$ 轴的对称点为 $A_{n+1}$，若 $A_{n+1}$ 与 $B_n$ 重合，则操作停止；否则一直继续下去。
    (1) 若 $a=2, b=1, A_1(\sqrt{2}, \frac{\sqrt{2}}{2})$，$k = \frac{1}{2}$，求 $x_2, y_2$；
    (2) 若 $a=5, b=4$，点 $P$ 是椭圆 $C$ 上一点，且位于 $x$ 轴的上方，$F_1, F_2$ 是椭圆 $C$ 的两个焦点，$\triangle PF_1F_2$ 是等腰三角形，求点 $P$ 的坐标；
    (3) 若 $k = -\frac{b}{a}$，$A_1$ 是 $C$ 在第一象限与 $A_1(\frac{\sqrt{2}}{2}a, \frac{\sqrt{2}}{2}b)$ 不重合的一点，求证：$\triangle A_n A_{n+1} A_{n+2}$ 的面积为定值，并求出该定值。

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
