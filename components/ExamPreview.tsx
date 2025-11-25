
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { ExamMetadata } from '../types';

interface ExamPreviewProps {
  markdown: string;
  metadata: ExamMetadata;
}

const ExamPreview: React.FC<ExamPreviewProps> = ({ markdown, metadata }) => {
  
  // Specific formatter for Header Numbers (120, 150)
  // Requirement: MUST match the "2025" font (SimHei).
  // Implementation: Wrap in a span with SimHei font family.
  const formatHeaderNumber = (text: string) => {
    const parts = text.split(/(\d+)/);
    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        // Strict SimHei enforcement for numbers to match the School Title's font
        return <span key={index} style={{ fontFamily: '"SimHei", "Heiti SC", sans-serif' }}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="w-full flex justify-center print:block print:w-full">
      {/* 
        A4 Paper Container 
        Standard A4 is 210mm wide.
        
        CRITICAL PRINT FIX:
        - print:min-h-0: Removes minimum height constraint
        - print:h-auto: Allows container to expand infinitely for pagination
        - print:shadow-none: Removes aesthetic shadow
      */}
      <div 
        className={`
          print-container
          bg-white shadow-2xl print:shadow-none 
          w-[210mm] min-h-[297mm] h-auto
          relative flex flex-col
          text-black
          px-[25mm] py-[15mm]
          box-border
          print:block print:w-full print:px-0 print:py-0
        `}
        style={{
          // Force the base font stack at the container level to be absolutely sure
          fontFamily: '"Times New Roman", "SimSun", "Songti SC", serif'
        }}
      >
        {/* Authentic Exam Header */}
        <header className="text-center mb-6 select-none border-b-0 border-black pb-2">
          {/* School & Subtitle - SimHei */}
          <div className="flex flex-col items-center justify-center mb-3 font-hei tracking-widest">
             <h1 className="text-[22px] text-black font-normal leading-snug">
               {metadata.school} {metadata.subtitle}
             </h1>
          </div>
          
          {/* Main Title (Subject) - SimHei
              Larger than school title.
          */}
          <h2 className="text-[26px] mb-4 text-black font-normal scale-y-105 inline-block font-hei">
            {metadata.title}
          </h2>
          
          {/* Meta Info: 
              - Whole line is slightly bold (font-medium).
              - Numbers are SimHei (via formatHeaderNumber).
              - Text is Songti.
          */}
          <div className="flex justify-center items-center font-song text-[15px] mb-2 font-medium">
            <span>
              (考试时间: {formatHeaderNumber(metadata.timeLimit)} &nbsp; 
              卷面满分: {formatHeaderNumber(metadata.totalScore)})
            </span>
          </div>

          <div className="flex justify-center items-center gap-16 text-[15px] font-song mt-1 font-medium">
            <span>命题人: {metadata.setter}</span>
            <span>审题人: {metadata.reviewer}</span>
          </div>
        </header>

        {/* Markdown Content Render */}
        <div className={`
           flex-1 text-justify text-black print:flex-none print:block
           ${metadata.columns === 2 ? 'columns-2 gap-10 [column-rule:1px_solid_#e5e7eb]' : ''}
        `}>
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkBreaks]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Paragraphs
              // Explicitly enforcing font-family style to override any browser defaults
              p: ({node, ...props}) => (
                <p 
                  className="mb-2 text-[15px] leading-[1.8] text-black" 
                  style={{ fontFamily: '"Times New Roman", "SimSun", "Songti SC", serif' }}
                  {...props} 
                />
              ),
              
              // Emphasis/Strong 
              // Used for: "本大题..." descriptions AND Big Question Intros "17. (本题...)"
              // section-intro-bold applies weight 700 + text-shadow hack in print
              strong: ({node, ...props}) => <span className="section-intro-bold mx-0.5" {...props} />,
              
              // Ordered Lists (Questions)
              // marker:font-math ensures numbers like "1.", "17." are Times New Roman
              ol: ({node, ...props}) => (
                <ol 
                  className="list-decimal pl-6 space-y-2 mb-3 marker:font-bold marker:text-black" 
                  style={{ fontFamily: '"Times New Roman", "SimSun", serif' }}
                  {...props} 
                />
              ),
              
              // Unordered Lists (MCQ Options)
              ul: ({node, ...props}) => (
                <ul 
                  className="mcq-options list-none pl-1 mt-1 mb-2" 
                  style={{ fontFamily: '"Times New Roman", "SimSun", serif' }}
                  {...props} 
                />
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
