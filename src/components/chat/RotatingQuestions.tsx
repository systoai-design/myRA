import { useState, useEffect } from "react";

const questions = [
  "How much do I need to retire?",
  "When should I claim social security?",
  "How should I invest for retirement?",
  "How much should I be saving for retirement?",
  "How much will healthcare costs affect me?",
];

export const RotatingQuestions = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = questions[currentQuestionIndex];
      
      if (!isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        setTypingSpeed(100);

        if (displayText === fullText) {
          // Pause at the end of the question
          setTimeout(() => setIsDeleting(true), 4000);
        }
      } else {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        setTypingSpeed(40);

        if (displayText === "") {
          setIsDeleting(false);
          setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentQuestionIndex, typingSpeed]);

  return (
    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-inter font-medium text-xl sm:text-2xl lg:text-3xl">
      <span>{displayText}</span>
      <span className="w-1 h-8 bg-slate-400 dark:bg-white/50 animate-pulse ml-1" />
    </div>
  );
};
