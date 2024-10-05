import React, { useState, useEffect } from "react";
import * as TestService from "../Services/TestService";
import { ITest } from "../Types/types";

interface MMSETestProps {
  role: string;
  answers?: Record<number, string>;
  currentQuestionIndex?: number;
  complete: boolean;
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

const MMSETest: React.FC<MMSETestProps> = ({
  role,
  currentQuestionIndex = 0,
  onAnswerSelection,
  onNextQuestion,
  onComplete,
  getScore,
  answers = {},
  complete = false,
}) => {
  const [questions, setQuestions] = useState<ITest[]>([]);
  const [score, setScore] = useState(0);
  const [scoreTF, setScoreTF] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string | number;
  }>({});

  useEffect(() => {
    setSelectedAnswers(answers);
  }, [answers]);

  useEffect(() => {
    setShowResults(complete);
  }, [complete]);

  useEffect(() => {
    if (getScore) setScore(getScore);
  }, [getScore]);

  useEffect(() => {
    const fetchTestByName = async () => {
      try {
        const fetchedQuestions = await TestService.getTestByName("MMSE");
        setQuestions(sortQuestionsByType(fetchedQuestions.data));
      } catch (error) {
        console.error("Failed to fetch test by name:", error);
      }
    };

    fetchTestByName();
  }, []);

  const sortQuestionsByType = (questions: ITest[]) => {
    const typeOrder = [
      "Orientation in time and space",
      "Registration/Acknowledgment",
      "Attention/Calculation",
      "Near memory",
      "Language",
      "Carry out complex orders",
    ];

    return questions.sort((a, b) => {
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    });
  };

  const parseQuestionText = (question: string) => {
    const [text, imageUrl] = question.split("\n");
    return {
      text,
      imageUrl: imageUrl ? `../../public/Images/${imageUrl.trim()}` : null,
    };
  };

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const { text: questionText, imageUrl } = parseQuestionText(
    currentQuestion.question
  );

  const handleAnswerSelection = (option: string) => {
    if (onAnswerSelection) {
      const previouslySelectedAnswer = selectedAnswers[currentQuestionIndex];

      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: option,
      }));

      if (option === currentQuestion.correct_answer) {
        if (previouslySelectedAnswer !== option) {
          setScore((prevScore) => prevScore + 1);
        }
      } else {
        if (previouslySelectedAnswer === currentQuestion.correct_answer) {
          setScore((prevScore) => prevScore - 1);
        }
      }
      onAnswerSelection(currentQuestionIndex, option, score);
    }
  };

  const handleTrueFalseSelection = (value: number) => {
    const previousValue = selectedAnswers[currentQuestionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));
    if (previousValue !== undefined) {
      setScoreTF((prevScore) => prevScore - Number(previousValue) + value);
    } else {
      setScoreTF((prevScore) => prevScore + value);
    }
  };

  const nextQuestion = () => {
    if (onNextQuestion) {
      onNextQuestion(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (onNextQuestion) {
      onNextQuestion(currentQuestionIndex - 1);
    }
  };

  const handleComplete = () => {
    const test_name = "MMSE";
    const difficult = "Easy";
    const totalScore = score + scoreTF;
    const evaluation = getEvaluation(totalScore);
    if (onComplete) onComplete(totalScore, evaluation, test_name, difficult);
    setShowResults(true);
  };

  const lastQuestion = currentQuestionIndex >= questions.length - 1;

  const getEvaluation = (score: number) => {
    if (score >= 24) return "No cognitive decline";
    if (score >= 20)
      return "Mild cognitive impairment; (May require supervision and support)";
    if (score >= 14)
      return "Moderate cognitive impairment; (Clear defects, may require 24/7 monitoring)";
    return "Severe cognitive impairment. (Causes severe disability, requires 24-hour supervision and assistance with daily activities)";
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-6 pb-0 w-full flex flex-col items-center">
        <p className="text-3xl font-bold">
          Mini-Mental State Examination (MMSE)
        </p>
      </div>
      <div className="flex-grow w-full flex flex-col justify-center items-center">
        <div className="text-center select-none px-8 w-full">
          {!showResults ? (
            <>
              {currentQuestion && (
                <>
                  <div className="bg-blue-100 p-4 rounded-lg shadow-md flex flex-col justify-center items-center">
                    <p className="text-lg py-4 font-semibold">{questionText}</p>
                    {imageUrl && (
                      <div className="w-[10%] h-[10%]">
                        <img className="w-full" src={imageUrl} alt="Question" />
                      </div>
                    )}
                  </div>
                  {currentQuestion.answers &&
                    currentQuestion.correct_answer !== "True" && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {Object.entries(currentQuestion.answers).map(
                          ([key, answer]) => (
                            <button
                              key={key}
                              onClick={() => handleAnswerSelection(key)}
                              className={`${
                                selectedAnswers[currentQuestionIndex] === key
                                  ? "bg-blue-500 text-white"
                                  : "bg-[#FFF7EC] text-black"
                              } p-4 rounded-lg shadow-md hover:bg-[#FEE2E2] active:bg-[#FECACA] focus:outline-none focus:ring focus:ring-[#FECACA]`}
                            >
                              <p className="font-bold">{key}</p>
                              <p className="cursor-pointer ">{answer}</p>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  {role === "doctor" &&
                    currentQuestion.correct_answer !== undefined &&
                    currentQuestion.correct_answer === "True" && (
                      <div className="mt-4 grid grid-cols-4 gap-4 text-lg select-none">
                        {[0, 1, 2, 3].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleTrueFalseSelection(value)}
                            className={`${
                              selectedAnswers[currentQuestionIndex] === value
                                ? "bg-blue-500 text-white"
                                : "bg-[#FFF7EC] text-black"
                            } px-4 py-2 rounded-lg hover:bg-[#FEE2E2] active:bg-[#FECACA] focus:outline-none focus:ring focus:ring-[#FECACA]`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    )}
                </>
              )}
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-2xl font-bold mb-4">Test Completed!</p>
              <p className="text-lg mb-2">Your Score: {score} / 30</p>
              <p className="text-lg mb-4">{getEvaluation(score)}</p>
              {role === "doctor" && (
                <p className="text-md text-red-500">
                  All done, Let's end the test!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {role === "doctor" && (
        <div className="px-8 py-4 w-full flex justify-between items-center bg-gray-100 select-none">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0 || showResults}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Previous
          </button>
          {role === "doctor" && (
            <p className="font-semibold">
              Current Score: AW: {score} + TF: {scoreTF}
            </p>
          )}
          <button
            onClick={lastQuestion ? handleComplete : nextQuestion}
            disabled={showResults}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring ${
              lastQuestion
                ? "bg-green-400 text-white hover:bg-green-600 active:bg-green-700"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            }`}
          >
            {lastQuestion ? "Complete" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MMSETest;
