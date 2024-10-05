import React, { useState, useEffect } from "react";
import * as TestService from "../Services/TestService";
import { ITest } from "../Types/types";

interface TheDoorTestProps {
  role: string;
  answers?: Record<number, string>;
  currentQuestionIndex?: number;
  currentPhase?: string;
  onChangePhase?: (currentPhase: string) => void;
  onAnswerSelection?: (
    questionIndex: number,
    answer: string,
    score: number
  ) => void;
  onNextQuestion?: (questionIndex: number) => void;
  onComplete?: (
    score: number,
    evaluation: string,
    test_name: string | null,
    difficult: string | null
  ) => void;
  getScore?: number;
}

const TheDoorTest: React.FC<TheDoorTestProps> = ({
  role,
  currentQuestionIndex = 0,
  currentPhase = "start",
  onAnswerSelection,
  onChangePhase,
  onNextQuestion,
  onComplete,
  getScore,
  answers = {},
}) => {
  const [questions, setQuestions] = useState<ITest[]>([]);
  const [score, setScore] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [isTestB, setIsTestB] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string | number;
  }>({});

  useEffect(() => {
    const fetchTestByName = async () => {
      try {
        const fetchedQuestions = await TestService.getTestByName("TheDoor");
        const easyQuestions = (fetchedQuestions.data as ITest[]).filter(
          (question) => question.difficult === "Easy"
        );
        const hardQuestions = (fetchedQuestions.data as ITest[]).filter(
          (question) => question.difficult === "Hard"
        );

        if (currentPhase === "start") {
          setQuestions(easyQuestions);
          console.log("easyQ", questions);
        } else if (currentPhase === "startB") {
          setQuestions(hardQuestions);
          console.log("hardQ", questions);
        }
      } catch (error) {
        console.error("Failed to fetch test by name:", error);
      }
    };

    fetchTestByName();
  }, [currentPhase]);

  useEffect(() => {
    setSelectedAnswers(answers);
  }, [answers]);

  useEffect(() => {
    if (getScore) setScore(getScore);
  }, [getScore]);

  useEffect(() => {
    if (
      currentPhase === "questions" &&
      currentQuestionIndex < questions.length
    ) {
      const timer = setTimeout(() => {
        if (onNextQuestion) onNextQuestion(currentQuestionIndex + 1);
      }, 500);

      return () => clearTimeout(timer);
    } else if (
      currentPhase === "answers" &&
      currentQuestionIndex < questions.length
    ) {
      const timer = setTimeout(() => {
        console.log("currentQuestion:", currentQuestionIndex, currentQuestion);
        if (onNextQuestion) onNextQuestion(currentQuestionIndex + 1);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (currentQuestionIndex >= questions.length) {
      if (currentPhase === "questions") {
        currentQuestionIndex = 0;
        if (onNextQuestion) onNextQuestion(0);
        currentPhase = "answers";
        if (onChangePhase) onChangePhase("answers");
      } else {
        if (currentPhase === "answers") {
          currentQuestionIndex = 0;
          if (onNextQuestion) onNextQuestion(0);
          if (!isTestB) {
            currentPhase = "complete";
            if (onChangePhase) onChangePhase("complete");
          } else {
            currentPhase = "completeB";
            if (onChangePhase) onChangePhase("completeB");
          }
        }
      }
    }
    if (currentPhase === "complete" && score < 9) {
      currentQuestionIndex = 0;
      if (onNextQuestion) onNextQuestion(0);
      const test_name = "The Door";
      const difficult = "Easy";
      const evaluation = `Easy Test: ${score}/12`;
      if (onComplete) onComplete(score, evaluation, test_name, difficult);
    }
    if (currentPhase === "complete" && score >= 9) {
      currentQuestionIndex = 0;
      if (onNextQuestion) onNextQuestion(0);
      setIsTestB(true);
      setScoreA(score);
      currentPhase = "startB";
      if (onChangePhase) onChangePhase("startB");
    }
    if (currentPhase === "completeB" && isTestB) {
      currentQuestionIndex = 0;
      if (onNextQuestion) onNextQuestion(0);

      const test_name = "The Door";
      const difficult = "Hard";
      const scoreB = score - scoreA;
      const evaluation = `Easy Test: ${scoreA}/12\nHard Test: ${scoreB}/12`;
      if (onComplete) onComplete(score, evaluation, test_name, difficult);
    }
  }, [currentPhase, currentQuestionIndex, questions.length]);

  const startTest = () => {
    currentPhase = "questions";
    if (onChangePhase) onChangePhase("questions");
  };

  //   const closeTest = () => {
  //     currentPhase = "complete";
  //     if (onChangePhase) onChangePhase("complete");
  //   };
  const handleAnswerSelection = (option: string) => {
    if (onAnswerSelection) {
      if (option === currentQuestion.correct_answer) {
        setScore((prevScore) => prevScore + 1);
        onAnswerSelection(currentQuestionIndex, option, score);
      } else {
        onAnswerSelection(currentQuestionIndex, option, score);
      }
    }
  };
  const parseImageUrl = (url: string) => {
    return `../../public/Images${url.trim()}`;
  };

  const currentQuestion = questions[currentQuestionIndex] || {};

  if (questions.length === 0) {
    return <div className="text-red-600">Loading...</div>;
  }

  if (currentPhase === "start") {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white">
        <p className="text-2xl font-bold mb-4 text-center">
          In the first round, 12 pictures of doors will be shown for 3 seconds.
          Then, you will have 5 seconds to choose which door appeared.
        </p>
        {role === "doctor" && (
          <button
            onClick={startTest}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700"
          >
            Start Test
          </button>
        )}
      </div>
    );
  }
  if (currentPhase === "startB") {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white">
        <p className="text-2xl font-bold mb-4 text-center">
          Well done, next test will be harder
        </p>
        {role === "doctor" && (
          <button
            onClick={startTest}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700"
          >
            Continue Test
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white">
      {currentPhase === "complete" && (
        <div className="flex flex-col items-center justify-center h-full w-full bg-white">
          <p className="text-2xl font-bold mb-4">Test A Completed!</p>
          <p className="text-lg mb-2">Your Score: {score} / 12</p>
          {role === "doctor" && score < 9 && (
            <p className="text-md text-red-500">
              All done, Let's end the test!
            </p>
          )}
          {role === "doctor" && score >= 9 && (
            <div className="text-md text-red-500">
              <button
                onClick={startTest}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700"
              >
                Continue Test
              </button>
            </div>
          )}
        </div>
      )}
      {currentPhase === "completeB" && (
        <div className="flex flex-col items-center justify-center h-full w-full bg-white">
          <p className="text-2xl font-bold mb-4">Test B Completed!</p>
          <p className="text-lg mb-2">Your Score: {score - scoreA} / 12</p>
          {role === "doctor" && (
            <p className="text-md text-red-500">
              All done, Let's end the test!
            </p>
          )}
        </div>
      )}
      {currentPhase === "questions" && (
        <div className="flex items-center justify-center w-auto h-auto select-none">
          <img
            src={parseImageUrl(currentQuestion.question || "")}
            alt={`Question ${currentQuestionIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {currentPhase === "answers" && currentQuestion.answers && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(currentQuestion.answers).map(([key, img]) => (
              <div
                key={key}
                onClick={() => handleAnswerSelection(key)}
                className={`${
                  selectedAnswers[currentQuestionIndex] === key
                    ? "bg-blue-500 text-white"
                    : "bg-[#FFF7EC] text-black"
                } w-auto h-40  p-4 rounded-lg shadow-md hover:bg-[#FEE2E2] active:bg-[#FECACA] focus:outline-none focus:ring focus:ring-[#FECACA]`}
              >
                <p className="font-bold">{key}</p>
                <img
                  src={parseImageUrl(img)}
                  alt={`Answer ${key}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
          {role === "doctor" && (
            <p className="font-semibold">Current Score: {score}</p>
          )}
        </>
      )}
    </div>
  );
};

export default TheDoorTest;
