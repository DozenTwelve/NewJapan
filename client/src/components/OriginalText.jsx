import React from "react";
import ModernButton from "./ModernButton";

function OriginalText({ sentences, onSentenceClick, onBack, onNext }) {
  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
            原文
          </h2>

          <div className="space-y-4 text-gray-800">
            {sentences.map((sentence, i) => (
              <p
                key={i}
                className="text-base leading-relaxed cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition"
                onClick={() => onSentenceClick(sentence)}
              >
                {sentence}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 justify-center">
        <ModernButton variant="green" onClick={onNext}>
          次のニュースへ
        </ModernButton>
        <ModernButton variant="gray" onClick={onBack}>
          戻る
        </ModernButton>
      </div>
    </>
  );
}

export default OriginalText;
