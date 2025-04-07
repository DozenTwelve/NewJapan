import React from "react";
import ModernButton from "./ModernButton";

function QuestionModal({
  questionText,
  correctAnswer,
  isCorrect,
  answerSelected,
  onAnswer,
  onClose,
  onNext,
  onShowOriginal,   
}) {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">質問</h3>
          <p className="text-gray-700 mb-6">{questionText}</p>

          {!answerSelected ? (
            <div className="flex justify-center gap-4">
              <ModernButton variant="green" onClick={() => onAnswer("〇")}>
                〇
              </ModernButton>
              <ModernButton variant="red" onClick={() => onAnswer("×")}>
                ×
              </ModernButton>
            </div>
          ) : (
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? "正解！" : "不正解。"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                正しい答え：{correctAnswer}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <ModernButton variant="green" onClick={onNext}>
                  次のニュースへ
                </ModernButton>
                <ModernButton variant="gray" onClick={onShowOriginal}>
                  原文を見る
                </ModernButton>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <ModernButton variant="gray" onClick={onClose}>
              閉じる
            </ModernButton>
          </div>
        </div>
      </div>

  );
}

export default QuestionModal;
