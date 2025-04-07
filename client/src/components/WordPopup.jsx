import { useEffect, useRef } from "react";
import ModernButton from "./ModernButton";

export default function WordPopup({ selectedWord, onClose, lang = "vi" }) {
  const popupRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!selectedWord) return null;

  const translation = selectedWord[lang] || "（訳なし）";
  const reading = selectedWord.reading || "（読みなし）";
  const word = selectedWord.word || "";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-xs bg-white border border-gray-300 rounded-2xl shadow-xl p-4 text-sm leading-relaxed space-y-1">
      <div ref={popupRef}>
        <div className="font-bold text-base">{word}</div>
        <div className="text-gray-500">{reading}</div>
        <div className="mt-2 text-gray-800 whitespace-pre-wrap">{translation}</div>
        <div className="text-right mt-2">
          <ModernButton onClick={onClose} variant="gray">
            閉じる
          </ModernButton>
        </div>
      </div>
    </div>
  );
}
