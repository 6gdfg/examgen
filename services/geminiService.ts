import { GoogleGenAI } from "@google/genai";

export const generateExamContent = async (topic: string, difficulty: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    You are a professional high school teacher creating a formal exam paper.
    
    Subject/Topic: ${topic}
    Difficulty: ${difficulty}
    
    Please generate a structured exam in Markdown format containing:
    1. A "Fill in the blank" section (5 questions).
    2. A "Multiple Choice" section (4 questions).
    3. A "Calculation/Proof" section (2 complex questions).
    
    Formatting Rules:
    - Use LaTeX for ALL mathematical expressions, wrapped in single dollar signs like $x^2$.
    - Do NOT use code blocks (\`\`\`). Just return raw markdown text.
    - Use '##' for Section Headers (e.g., ## 一、填空题).
    - Use ordered lists or numbers for questions.
    - Add a placeholder '______' for blanks.
    - Ensure the math is complex enough for the specified difficulty.
    - If the language is Chinese, use standard Chinese exam phrasing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Error generating content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
