import React from "react";

function ScoreDisplay({ score = 0, answered = 0 }) {
  const percentage = answered > 0 ? Math.round((score / answered) * 100) : 0;

  return (
    <div className="text-sm text-gray-600 font-medium">
      今日のスコア：{score} / {answered}（正答率 {percentage}%）
    </div>
  );
}

export default ScoreDisplay;
