import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useThunk } from "../../hooks/use-thunk";
import {
    fetchVocabularyWords,
    generateSentenceCompletion,
    generateSpeech,
} from "../../store";
import { Loader, CheckCircle, XCircle, Volume2 } from "lucide-react";

const FillTheGapExercise = () => {
    const dispatch = useDispatch();

    const [
        doFetchVocabularyWords,
        isLoadingVocabularyWords,
        loadingVocabularyWordsError,
    ] = useThunk(fetchVocabularyWords);

    const [
        doGenerateSentenceCompletion,
        isGenerating,
        generateSentenceCompletionError,
    ] = useThunk(generateSentenceCompletion);

    const [doGenerateSpeech, isGeneratingSpeech, generateSpeechError] =
        useThunk(generateSpeech);

    const { data, exerciseState, checkpoints } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [sentenceData, setSentenceData] = useState(null);
    const [answerOptions, setAnswerOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);

    const isLoading = isLoadingVocabularyWords || isGenerating;
    const combinedProcessing = isGenerating;

    // Генерація вправи при зміні поточного слова
    useEffect(() => {
        if (
            exerciseState.currentSelection.length > 0 &&
            exerciseState.generateNextStage
        ) {
            const currentWord =
                exerciseState.currentSelection[
                    exerciseState.currentVocabularyWordIndex
                ];
            loadExercise(currentWord.main_parameters);
        }
    }, [
        exerciseState.currentSelection,
        exerciseState.currentVocabularyWordIndex,
        exerciseState.generateNextStage,
    ]);

    // Завантаження слів при монтуванні
    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

    const loadExercise = async (vocabularyWordMainParameters) => {
        try {
            setSelectedAnswer(null);
            setShowResult(false);
            setIsCorrect(false);

            const result = await doGenerateSentenceCompletion(
                vocabularyWordMainParameters
            );

            setSentenceData(result);
            setCorrectAnswer(result.correctAnswer);
            setAnswerOptions(result.options);
        } catch (error) {
            console.error("Помилка генерації вправи:", error);
        }
    };

    const handleAnswerSelect = (option) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(option);
        const correct = option.toLowerCase() === correctAnswer.toLowerCase();
        setIsCorrect(correct);
        setShowResult(true);

        // Якщо немає перекладу, генеруємо його
        if (!sentenceData.sentenceTranslation) {
            setIsTranslating(true);
            try {
                // Тут можна додати генерацію перекладу через OpenAI
                // Поки залишаємо пустим
            } catch (error) {
                console.error("Помилка генерації перекладу:", error);
            } finally {
                setIsTranslating(false);
            }
        }
    };

    const handleNextClick = async () => {
        // Переходимо до наступного слова без оновлення статусу
        const nextIndex = getNextVocabularyItemIndex();
        dispatch({
            type: "vocabularyWords/updateExerciseState",
            payload: {
                currentVocabularyWordIndex: nextIndex,
                generateNextStage: true,
            },
        });
    };

    const getNextVocabularyItemIndex = () => {
        if (
            exerciseState.currentVocabularyWordIndex ===
            exerciseState.currentSelection.length - 1
        ) {
            dispatch({ type: "vocabularyWords/makeNextSelection" });
            return 0;
        } else {
            return exerciseState.currentVocabularyWordIndex + 1;
        }
    };

    const handlePlayAudio = async (text) => {
        try {
            const audioUrl = await doGenerateSpeech(text);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error("Помилка відтворення аудіо:", error);
        }
    };

    return (
        <div className="w-full sm:w-3/4 lg:w-1/2 min-h-160 sm:min-h-130 bg-white rounded-2xl shadow-md p-6 lg:p-12 pt-12 lg:pt-16 pb-10 mx-5 sm:m-auto">
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">
                        {isGenerating
                            ? "Генерую речення..."
                            : "Завантаження..."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">
                            Яке слово підходить для пропуску?
                        </h2>
                        <div className="bg-green-100/80 rounded-xl p-6 border-l-4 border-emerald-400">
                            <p className="text-xl text-gray-800 leading-relaxed font-mono tracking-wide mb-3">
                                {showResult
                                    ? sentenceData?.audioSentence
                                        ? sentenceData.audioSentence
                                              .split(
                                                  new RegExp(
                                                      `(\\b${correctAnswer}\\b)`,
                                                      "gi"
                                                  )
                                              )
                                              .map((part, index) =>
                                                  part.toLowerCase() ===
                                                  correctAnswer.toLowerCase() ? (
                                                      <mark
                                                          key={index}
                                                          className={`px-2 py-1 rounded font-bold ${
                                                              isCorrect
                                                                  ? "bg-green-300 text-green-800"
                                                                  : "bg-yellow-300 text-yellow-800"
                                                          }`}
                                                      >
                                                          {part}
                                                      </mark>
                                                  ) : (
                                                      part
                                                  )
                                              )
                                        : `Complete this sentence: I need to ${correctAnswer} this word.`
                                    : sentenceData?.displaySentence ||
                                      `Complete this sentence: I need to ____ this word.`}
                            </p>

                            {showResult &&
                                sentenceData?.sentenceTranslation && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200">
                                        <p className="text-sm text-gray-600 mb-1">
                                            Переклад речення:
                                        </p>
                                        <p className="text-base text-gray-700 italic">
                                            {sentenceData.sentenceTranslation}
                                        </p>
                                    </div>
                                )}

                            {showResult &&
                                !sentenceData?.sentenceTranslation &&
                                isTranslating && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200">
                                        <div className="flex items-center text-emerald-600">
                                            <Loader className="w-4 h-4 animate-spin mr-2" />
                                            <span className="text-sm">
                                                Генерую переклад...
                                            </span>
                                        </div>
                                    </div>
                                )}

                            {showResult &&
                                !sentenceData?.sentenceTranslation &&
                                !isTranslating && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200">
                                        <p className="text-sm text-gray-500 italic">
                                            💭 Переклад тимчасово недоступний
                                        </p>
                                    </div>
                                )}

                            {sentenceData?.hint && !showResult && (
                                <p className="text-sm text-emerald-600 mt-3 italic">
                                    Підказка: {sentenceData.hint}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {answerOptions.map((option, index) => {
                            let buttonClass =
                                "w-full p-6 text-center rounded-xl border-2 transition-all duration-200 font-medium text-lg ";

                            if (selectedAnswer === null) {
                                buttonClass += combinedProcessing
                                    ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:shadow-lg hover:scale-102 cursor-pointer";
                            } else if (
                                option.toLowerCase() ===
                                correctAnswer.toLowerCase()
                            ) {
                                buttonClass +=
                                    "border-green-500 bg-green-50 text-green-700 shadow-lg";
                            } else if (option === selectedAnswer) {
                                buttonClass +=
                                    "border-red-500 bg-red-50 text-red-700 shadow-lg";
                            } else {
                                buttonClass +=
                                    "border-gray-200 bg-gray-50 text-gray-500";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={
                                        selectedAnswer !== null ||
                                        combinedProcessing
                                    }
                                    className={buttonClass}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="flex-1">{option}</span>
                                        {selectedAnswer !== null && (
                                            <span className="ml-3">
                                                {option.toLowerCase() ===
                                                correctAnswer.toLowerCase() ? (
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                ) : option ===
                                                  selectedAnswer ? (
                                                    <XCircle className="w-6 h-6 text-red-600" />
                                                ) : null}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    {showResult && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleNextClick}
                                className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-102 cursor-pointer"
                            >
                                Далі
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export { FillTheGapExercise };
