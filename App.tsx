import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Settings, 
  Sparkles, 
  LayoutTemplate, 
  ChevronLeft, 
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react';
import ExamPreview from './components/ExamPreview';
import Button from './components/Button';
import { ExamMetadata, DEFAULT_MARKDOWN } from './types';
import { generateExamContent } from './services/geminiService';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [metadata, setMetadata] = useState<ExamMetadata>({
    school: "华东师大二附中",
    subtitle: "2025 学年第一学期期中考试卷",
    title: "高二 数学",
    setter: "丁纪元",
    reviewer: "甄德文",
    studentFields: true,
    totalScore: "150 分",
    timeLimit: "120 分钟",
    paperSize: 'A4',
    columns: 1
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptTopic, setPromptTopic] = useState("");

  // --- Handlers ---

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = async () => {
    if (!promptTopic) return;
    
    setIsGenerating(true);
    try {
      if (!process.env.API_KEY) {
         alert("Please configure the API_KEY in the environment variables to use AI features.");
         setIsGenerating(false);
         return;
      }
      
      const content = await generateExamContent(promptTopic, "High School Advanced");
      setMarkdown(content);
    } catch (e) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMetadata = (key: keyof ExamMetadata, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#525659] text-gray-800 font-sans">
      
      {/* Left Sidebar - Editor & Config (Hidden on Print) */}
      <div 
        className={`
          flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out no-print z-20 h-full
          ${isSidebarOpen ? 'w-[420px]' : 'w-0 overflow-hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
            <div className="bg-blue-600 text-white p-1 rounded">
              <FileText size={20} />
            </div>
            ExamForge <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500 font-normal">Pro</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* AI Generator Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
              <Sparkles size={14} className="text-blue-600" />
              AI Question Generator
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Topic (e.g. Calculus, Tang Dynasty)"
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleGenerate} 
                disabled={isGenerating || !promptTopic}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 shadow-sm"
              >
                {isGenerating ? '...' : 'Create'}
              </Button>
            </div>
          </section>

          {/* Paper Settings */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Settings size={14} /> Paper Config
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">School Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.school}
                    onChange={(e) => updateMetadata('school', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Semester / Subtitle</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.subtitle}
                    onChange={(e) => updateMetadata('subtitle', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject Title</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={metadata.title}
                    onChange={(e) => updateMetadata('title', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex gap-1 items-center"><User size={10}/> Setter (命题)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.setter}
                    onChange={(e) => updateMetadata('setter', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex gap-1 items-center"><GraduationCap size={10}/> Reviewer (审题)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.reviewer}
                    onChange={(e) => updateMetadata('reviewer', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.timeLimit}
                    onChange={(e) => updateMetadata('timeLimit', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Score</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={metadata.totalScore}
                    onChange={(e) => updateMetadata('totalScore', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-600">Student Info Row</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle" 
                    checked={metadata.studentFields}
                    onChange={(e) => updateMetadata('studentFields', e.target.checked)}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-blue-600 border-gray-300"
                  />
                  <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${metadata.studentFields ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                </div>
              </div>

               <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <LayoutTemplate size={14} /> Two Columns
                </span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => updateMetadata('columns', 1)}
                    className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${metadata.columns === 1 ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    1 Col
                  </button>
                  <button 
                    onClick={() => updateMetadata('columns', 2)}
                    className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${metadata.columns === 2 ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    2 Col
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Markdown Editor */}
          <section className="flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText size={14} /> Questions (Markdown)
            </h3>
            <textarea 
              className="w-full flex-1 border border-gray-300 rounded p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[500px] leading-relaxed"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter markdown content here..."
            />
          </section>

        </div>
      </div>

      {/* Toggle Sidebar Button (Absolute) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          absolute top-1/2 transform -translate-y-1/2 z-30 bg-white border border-gray-300 p-1.5 rounded-full shadow-lg hover:bg-gray-50 text-gray-600 transition-all duration-300 no-print
          ${isSidebarOpen ? 'left-[408px]' : 'left-4'}
        `}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Preview Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* Top Bar (Actions) */}
        <div className="h-14 bg-[#323639] border-b border-black flex items-center justify-between px-6 shadow-md z-10 no-print shrink-0">
           <div className="text-gray-300 text-sm font-medium">
              {metadata.title} - Preview
           </div>
           <div className="flex gap-3">
             <Button 
                variant="primary" 
                onClick={handlePrint} 
                className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-md text-sm py-1.5"
                icon={<Printer size={16}/>}
              >
               Download PDF
             </Button>
           </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-auto bg-[#525659] relative flex justify-center p-8 print:p-0 print:overflow-visible custom-scrollbar">
           <ExamPreview markdown={markdown} metadata={metadata} />
        </div>
      </div>

    </div>
  );
};

export default App;