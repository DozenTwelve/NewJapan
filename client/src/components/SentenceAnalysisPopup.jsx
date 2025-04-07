import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ModernButton from "./ModernButton";

function SentenceAnalysisPopup({ analyzingSentence, analysisResult, onClose }) {
  if (!analyzingSentence) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-lg z-50 backdrop-blur-sm">
      <h3 className="text-base font-bold text-indigo-600 mb-2">文法分析</h3>
      <p className="text-sm text-gray-600 mb-4">
        🔍 対象文：{analyzingSentence}
      </p>

      <div className="prose prose-sm max-w-none text-gray-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {analysisResult}
        </ReactMarkdown>
      </div>

      <div className="mt-6 text-center">
        <ModernButton variant="gray" onClick={onClose}>
          閉じる
        </ModernButton>
      </div>
    </div>
  );
}

export default SentenceAnalysisPopup;
