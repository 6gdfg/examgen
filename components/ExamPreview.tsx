import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ExamMetadata } from '../types';

interface ExamPreviewProps {
  markdown: string;
  metadata: ExamMetadata;
}

const ExamPreview: React.FC<ExamPreviewProps> = ({ markdown, metadata }) => {
  return (
    <div className="w-full flex justify-center print:block print:w-full">
      {/* 
        A4 Paper Container 
        Standard A4 is 210mm x 297mm.
        Margins are handled inside to emulate the physical paper look on screen.
      */}
      <div 
        className={`
          print-container
          bg-white shadow-2xl print:shadow-none 
          w-[210mm] min-h-[297mm] relative flex flex-col
          text-black
          px-[25mm] py-[15mm] /* Adjusted padding */
        `}
      >
        {/* Authentic Exam Header */}
        <header className="text-center mb-4 select-none font-hei tracking-widest">
          {/* School & Subtitle - SimHei, Larger but Normal Weight */}
          <h1 className="text-2xl text-black leading-snug mb-2">
            {metadata.school} {metadata.subtitle}
          </h1>
          
          {/* Main Title (Subject) - SimHei, Slightly Smaller than School, Normal Weight */}
          <h2 className="text-xl mt-1 mb-3 text-black">
            {metadata.title}
          </h2>
          
          {/* Meta Info: Combined Parentheses, Songti */}
          <div className="flex justify-center items-center font-song text-[15px] mb-1">
            <span>(考试时间: {metadata.timeLimit} &nbsp; 卷面满分: {metadata.totalScore})</span>
          </div>

          <div className="flex justify-center items-center gap-16 text-[15px] font-song mt-1">
            <span>命题人: {metadata.setter}</span>
            <span>审题人: {metadata.reviewer}</span>
          </div>

          {/* Student Info Fields - kept minimal */}
          {metadata.studentFields && (
             <div className="mt-2" />
          )}
        </header>

        {/* Markdown Content Render */}
        <div className={`
           flex-1 text-justify font-song text-black
           ${metadata.columns === 2 ? 'columns-2 gap-10 [column-rule:1px_solid_#e5e7eb]' : ''}
        `}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Section Headers (Example: 一、填空题)
              h2: ({node, ...props}) => (
                <div className="break-after-avoid break-inside-avoid mt-6 mb-2">
                  <h3 className="text-[16px] font-hei font-bold text-black leading-relaxed" {...props} />
                </div>
              ),
              
              // Paragraphs
              p: ({node, ...props}) => <p className="mb-1.5 text-[15px] leading-[1.8] text-black" {...props} />,
              
              // Emphasis/Strong 
              // Used for: "本大题..." descriptions AND Big Question Intros "17. (本题...)"
              // Logic: Times New Roman (Bold) for numbers/Latin, SimSun (Bold) for Chinese
              strong: ({node, ...props}) => <span className="section-intro-bold mx-0.5" {...props} />,
              
              // Ordered Lists (Questions)
              // marker:font-math ensures numbers like "1.", "17." are Times New Roman
              // marker:font-bold ensures they are bold
              ol: ({node, ...props}) => (
                <ol className="list-decimal pl-6 space-y-2 mb-3 marker:font-math marker:font-bold marker:text-black" {...props} />
              ),
              
              // Unordered Lists (MCQ Options)
              ul: ({node, ...props}) => (
                <ul className="mcq-options list-none pl-1 mt-1 mb-2" {...props} />
              ),
              
              // List Items 
              li: ({node, ...props}) => (
                <li className="pl-1 relative leading-[1.8] text-[15px]" {...props} />
              ),

              // Images
              img: ({node, ...props}) => (
                 <span className="block w-full flex justify-center my-3">
                    <img 
                      {...props} 
                      className="max-w-[90%] max-h-[350px] object-contain" 
                    />
                 </span>
              )
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ExamPreview;