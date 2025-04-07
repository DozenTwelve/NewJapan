// components/ScoreSummaryModal.jsx
import React from "react";
import ModernButton from "./ModernButton";

export default function ScoreSummaryModal({ score, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-indigo-600 mb-4">今日のスコア</h2>
        <p className="text-gray-700 text-lg mb-6">あなたの得点は <strong>{score}</strong> / 10 です！</p>
        <div className="text-center">
          <ModernButton onClick={onClose} variant="green">
            閉じる
          </ModernButton>
        </div>
      </div>
    </div>
  );
}
