import React from "react";

function ScoreDisplay({ score }) {
  return (
    <div className="text-sm text-gray-600 font-medium">
      今日のスコア：{score} / 10
    </div>
  );
}

export default ScoreDisplay;
