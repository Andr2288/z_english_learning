import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useThunk } from "../../hooks/use-thunk";
import {
    fetchVocabularyWords,
    generateListenAndFill,
    generateSpeech,
} from "../../store";
import { Loader, CheckCircle, XCircle, Volume2 } from "lucide-react";

const ListenAndFillTheGapExercise = () => {
    const dispatch = useDispatch();

    const [
        doFetchVocabularyWords,
        isLoadingVocabularyWords,
        loadingVocabularyWordsError,
    ] = useThunk(fetchVocabularyWords);

    const [doGenerateListenAndFill, isGenerating, generateListenAndFillError] =
        useThunk(generateListenAndFill);

    const [doGenerateSpeech, isGeneratingSpeech, generateSpeechError] =
        useThunk(generateSpeech);

    const { data, exerciseState } = useSelector((state) => {
        return state.vocabularyWords;
    });

    // TranslateSentenceExercise state
    const [exerciseData, setExerciseData] = useState(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    // Audio state
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const audioRef = useRef(null);
    const inputRef = useRef(null);

    const isLoading = isLoadingVocabularyWords || isGenerating;
    const combinedProcessing = isGenerating;

    // Завантаження слів при монтуванні
    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

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

    // Focus input when ready
    useEffect(() => {
        if (!isLoading && inputRef.current && !combinedProcessing) {
            inputRef.current.focus();
        }
    }, [isLoading, combinedProcessing]);

    const loadExercise = async (vocabularyWordMainParameters) => {
        try {
            // Reset state
            setUserAnswer("");
            setSelectedAnswer(null);
            setIsCorrect(null);
            setShowResult(false);
            setExerciseData(null);

            console.log(
                `Generating listen-and-fill for: "${vocabularyWordMainParameters.text}"`
            );

            const result = await doGenerateListenAndFill(
                vocabularyWordMainParameters
            );

            console.log("TranslateSentenceExercise data received:", result);
            setExerciseData(result);
        } catch (error) {
            console.error("Помилка генерації вправи:", error);
        }
    };

    const handlePlayAudio = async (text) => {
        try {
            setIsGeneratingAudio(true);
            const audioUrl = await doGenerateSpeech(text);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error("Помилка відтворення аудіо:", error);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const checkAnswer = (answer, correctForm, originalWord) => {
        const normalizeText = (text) => {
            return text
                .toLowerCase()
                .trim()
                .replace(/[.,!?;:'"]/g, "");
        };

        const normalizedAnswer = normalizeText(answer);
        const normalizedCorrect = normalizeText(correctForm);
        const normalizedOriginal = normalizeText(originalWord);

        // Check exact match with correct form
        if (normalizedAnswer === normalizedCorrect) {
            return true;
        }

        // Check exact match with original word
        if (normalizedAnswer === normalizedOriginal) {
            return true;
        }

        // Check if it's part of a phrase
        if (normalizedCorrect.includes(" ")) {
            return normalizedCorrect
                .split(" ")
                .some((word) => word === normalizedAnswer);
        }

        return false;
    };

    const handleSubmitAnswer = () => {
        if (
            !userAnswer.trim() ||
            selectedAnswer !== null ||
            !exerciseData ||
            combinedProcessing
        )
            return;

        const currentWord =
            exerciseState.currentSelection[
                exerciseState.currentVocabularyWordIndex
            ];

        const correct = checkAnswer(
            userAnswer,
            exerciseData.correctForm,
            currentWord.main_parameters.text
        );

        setSelectedAnswer(userAnswer);
        setIsCorrect(correct);
        setShowResult(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !showResult && !combinedProcessing) {
            handleSubmitAnswer();
        }
    };

    const handleNextClick = () => {
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

    return (
        <div className="w-full sm:w-3/4 lg:w-1/2 min-h-160 sm:min-h-130 bg-white rounded-2xl shadow-md p-6 lg:p-12 pt-12 lg:pt-16 pb-10 mx-5 sm:m-auto">
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">
                        {isGenerating
                            ? "Генерую завдання..."
                            : "Завантаження..."}
                    </p>
                </div>
            ) : (
                <>
                    {/* Audio Controls */}
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">
                            Яке слово ви чуєте на місці пропуску?
                        </h2>

                        <div className="bg-blue-100/80 rounded-xl p-6 border-l-4 border-blue-400 mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <button
                                    onClick={() =>
                                        handlePlayAudio(
                                            exerciseData?.audioSentence
                                        )
                                    }
                                    disabled={
                                        !exerciseData?.audioSentence ||
                                        isGeneratingAudio ||
                                        combinedProcessing
                                    }
                                    className="flex items-center justify-center hover:bg-blue-100 rounded-lg p-2 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                                    title="Відтворити аудіо"
                                >
                                    {isGeneratingAudio ? (
                                        <Loader className="w-6 h-6 animate-spin text-blue-600" />
                                    ) : (
                                        <Volume2 className="w-6 h-6 text-blue-600" />
                                    )}
                                </button>
                            </div>

                            {/* Show sentence text */}
                            {exerciseData?.displaySentence && (
                                <div>
                                    <p className="text-lg text-gray-800 font-mono tracking-wide mb-3">
                                        {showResult
                                            ? exerciseData.audioSentence
                                                  .split(
                                                      new RegExp(
                                                          `(\\b${exerciseData.correctForm}\\b)`,
                                                          "gi"
                                                      )
                                                  )
                                                  .map((part, index) =>
                                                      part.toLowerCase() ===
                                                      exerciseData.correctForm.toLowerCase() ? (
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
                                            : exerciseData.displaySentence}
                                    </p>

                                    {showResult &&
                                        exerciseData.sentenceTranslation && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Переклад речення:
                                                </p>
                                                <p className="text-base text-gray-700 italic">
                                                    {
                                                        exerciseData.sentenceTranslation
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    {showResult &&
                                        !exerciseData.sentenceTranslation &&
                                        isTranslating && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <div className="flex items-center text-blue-600">
                                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                                    <span className="text-sm">
                                                        Генерую переклад...
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {showResult &&
                                        !exerciseData.sentenceTranslation &&
                                        !isTranslating && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <p className="text-sm text-gray-500 italic">
                                                    💭 Переклад тимчасово
                                                    недоступний
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-4">
                        <div className="max-w-md mx-auto">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) =>
                                        setUserAnswer(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                    disabled={showResult || combinedProcessing}
                                    placeholder="Впишіть слово..."
                                    className={`w-full p-4 text-lg text-center rounded-xl border-2 transition-all duration-200 font-medium ${
                                        showResult
                                            ? isCorrect
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-red-500 bg-red-50 text-red-700"
                                            : combinedProcessing
                                              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    }`}
                                />
                                {showResult && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {isCorrect ? (
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!showResult && (
                            <div className="text-center">
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={
                                        !userAnswer.trim() || combinedProcessing
                                    }
                                    className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-xl font-medium transition-all ${
                                        combinedProcessing
                                            ? "cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    Перевірити
                                </button>
                            </div>
                        )}
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

export { ListenAndFillTheGapExercise };
