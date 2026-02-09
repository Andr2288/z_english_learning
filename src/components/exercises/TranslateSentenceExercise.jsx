import { useThunk } from "../../hooks/use-thunk";
import {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
    generateSpeech,
    updateExerciseState,
    makeNextSelection,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";

import { useState, useEffect, useCallback } from "react";

import { Loader, Eye, Lightbulb, Volume2 } from "lucide-react";

import Modal from "../common/Modal.jsx";

const TranslateSentenceExercise = () => {
    const [doAddVocabularyWord, isAddingVocabularyWord, addVocabularyWordError] = useThunk(addVocabularyWord);

    const [doFetchVocabularyWords, isLoadingVocabularyWords, loadingVocabularyWordsError] = useThunk(fetchVocabularyWords);

    const [doUpdateVocabularyWord, isUpdatingVocabularyWord, updateVocabularyWordError] = useThunk(updateVocabularyWord);

    const [doGenerateExerciseVocabularyItem, isLoadingExerciseVocabularyItem, generateExerciseVocabularyItemError] =
        useThunk(generateExerciseVocabularyItem);

    const [doGenerateSpeech, isGeneratingSpeech, generateSpeechError] = useThunk(generateSpeech);

    const { data, exerciseState, checkpoints } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const dispatch = useDispatch();

    const [uiState, setUiState] = useState({
        showTranslation: false,
        showTip: false,
        showAddVocabularyWordModal: false,
    });

    const getNextVocabularyItemIndex = () => {
        if (exerciseState.currentVocabularyWordIndex === exerciseState.currentSelection.length - 1) {
            dispatch(makeNextSelection());
            return 0;
        } else {
            console.log(exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex]);
            return exerciseState.currentVocabularyWordIndex + 1;
        }
    };

    const handleNextButtonClick = async (newStatus) => {
        setUiState((prev) => {
            return {
                ...prev,
                showTranslation: false,
                showTip: false,
            };
        });

        if (exerciseState.currentSelection.length === 0) {
            console.log("Немає слів для проходження");
            return;
        }

        // TODO: Оновити дані поточного слова
        const currentWord = exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex];

        const currentCheckpointIndex = checkpoints.findIndex((checkpoint) => {
            return checkpoint.checkpoint === currentWord.metodology_parameters.checkpoint_translate_sentence_exercise;
        });

        const currentLastReviewed = currentWord.metodology_parameters.last_reviewed_translate_sentence_exercise;
        const today = new Date().toISOString().split("T")[0];

        let nextCheckpoint = checkpoints[currentCheckpointIndex].checkpoint;
        if (currentLastReviewed !== today) {
            if (newStatus === "AGAIN" && currentCheckpointIndex !== 0) {
                nextCheckpoint = checkpoints[currentCheckpointIndex - 1].checkpoint;
            } else if (newStatus === "REVIEW" && checkpoints.length !== currentCheckpointIndex + 1) {
                nextCheckpoint = checkpoints[currentCheckpointIndex + 1].checkpoint;
            }
        }

        try {
            await doUpdateVocabularyWord({
                id: currentWord.id,
                exerciseType: exerciseState.exerciseType,
                metodology_parameters: {
                    status_translate_sentence_exercise: newStatus,
                    last_reviewed_translate_sentence_exercise: new Date().toISOString(),
                    checkpoint_translate_sentence_exercise: nextCheckpoint,
                },
            });

            const nextVocabularyItemIndex = getNextVocabularyItemIndex();

            dispatch(
                updateExerciseState({
                    currentVocabularyWordIndex: nextVocabularyItemIndex,
                    generateNextStage: true,
                })
            );
        } catch (error) {
            console.error("Помилка оновлення:", error);
        }
    };

    const handlePlayAudio = async (text) => {
        try {
            // Генеруємо аудіо через OpenAI TTS API
            const audioUrl = await doGenerateSpeech(text);

            // Відтворюємо нещодавно згенероване аудіо
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error("Помилка відтворення аудіо:", error);
        }
    };

    const handleCloseModal = useCallback(() => {
        setUiState((prev) => {
            return {
                ...prev,
                showAddVocabularyWordModal: false,
            };
        });
    }, []);

    const handleAddWord = (newWord) => {
        doAddVocabularyWord(newWord);
        handleCloseModal();
    };

    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

    useEffect(() => {
        if (exerciseState.currentSelection.length > 0 && exerciseState.generateNextStage) {
            //console.log(JSON.stringify(data, null, 2));
            doGenerateExerciseVocabularyItem(exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex].main_parameters);
        }
    }, [doGenerateExerciseVocabularyItem, exerciseState.currentSelection, exerciseState.currentVocabularyWordIndex, exerciseState.generateNextStage]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (!event.ctrlKey && event.code === "Space" && !uiState.showAddVocabularyWordModal) {
                event.preventDefault();
                setUiState((prev) => ({
                    ...prev,
                    showAddVocabularyWordModal: true,
                }));
                return;
            }

            if (event.ctrlKey && event.altKey && !uiState.showAddVocabularyWordModal) {
                event.preventDefault();
                handleNextButtonClick("AGAIN");
                return;
            }

            if (event.ctrlKey && event.code === "Space" && !uiState.showAddVocabularyWordModal) {
                event.preventDefault();
                handleNextButtonClick("REVIEW");
                return;
            }

            if (event.key === "Escape" && uiState.showAddVocabularyWordModal) {
                handleCloseModal();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleNextButtonClick, uiState.showAddVocabularyWordModal]);

    const highlightUsedForm = (sentence, usedForm) => {
        if (!usedForm || !sentence) return sentence;

        const regex = new RegExp(`(${usedForm})`, "gi");
        const parts = sentence.split(regex);

        return parts.map((part, index) => {
            if (part.toLowerCase() === usedForm.toLowerCase()) {
                return (
                    <span key={index} className="underline decoration-2 decoration-dashed decoration-green-400 underline-offset-5">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const STATUS_MAP = {
        NEW: {
            label: "Нове",
            className: "bg-blue-100 text-blue-700 border-blue-300",
        },
        AGAIN: {
            label: "Повтор",
            className: "bg-orange-100 text-orange-700 border-orange-300",
        },
        REVIEW: {
            label: "Вивчено",
            className: "bg-green-100 text-green-700 border-green-300",
        },
        MISSED: {
            label: "Пропущено",
            className: "bg-red-100 text-red-700 border-red-300",
        },
    };

    const content = (
        <div className="mb-4 flex-1 flex flex-col items-center justify-center w-full text-center">
            {isLoadingVocabularyWords ? (
                // АДАПТИВНА СПІНЕР ДЛЯ ЗАВАНТАЖЕННЯ
                // py-8: мобільні (малший паддинг для економії місця)
                // sm:py-12: планшети та більше (традиційний паддинг)
                <div className="text-center py-8 sm:py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    {/* text-sm: шрифт на мобільних (14px)
                        sm:text-base: шрифт на планшетах+ (16px) */}
                    <p className="text-sm sm:text-base text-gray-600">Завантаження карток...</p>
                </div>
            ) : loadingVocabularyWordsError ? (
                // АДАПТИВНА ПОМИЛКА ЗАВАНТАЖЕННЯ
                // p-4: мобільні (1rem = 16px паддинг)
                // sm:p-6: планшети+ (1.5rem = 24px паддинг)
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                    <p className="text-red-600 font-medium text-sm sm:text-base">Упс! Сталася помилка під час завантаження карток :(</p>
                </div>
            ) : exerciseState.isLoading ? (
                // АДАПТИВНА СПІНЕР ДЛЯ ОБРОБКИ
                <div className="text-center py-8 sm:py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-sm sm:text-base text-gray-600">Зачекайте, будь ласка ...</p>
                </div>
            ) : updateVocabularyWordError ? (
                // АДАПТИВНА ПОМИЛКА ОНОВЛЕННЯ
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                    <p className="text-red-600 font-medium">Упс! Сталася помилка під час оновлення фрази :(</p>
                </div>
            ) : generateExerciseVocabularyItemError ? (
                // АДАПТИВНА ПОМИЛКА ГЕНЕРАЦІЇ
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                    <p className="text-red-600 font-medium text-sm sm:text-base">Упс! Сталася помилка під час генерації вправи :(</p>
                </div>
            ) : exerciseState.currentSelection.length > 0 && exerciseState.generatedExerciseData ? (
                <>
                    {exerciseState.currentSelection.length > 0 && (
                        <div className="mb-4 flex justify-center">
                            <span
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${
                                    STATUS_MAP[
                                        exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex].metodology_parameters
                                            .status_translate_sentence_exercise
                                    ]?.className
                                }`}
                            >
                                {
                                    STATUS_MAP[
                                        exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex].metodology_parameters
                                            .status_translate_sentence_exercise
                                    ]?.label
                                }
                            </span>
                        </div>
                    )}

                    {/* АДАПТИВНИЙ ЗАГОЛОВОК І КОНТЕНТ ВПРАВИ */}
                    {/* mb-6: мобільні (1.5rem = 24px)
                        sm:mb-8: планшети+ (2rem = 32px) */}
                    <div className="w-full mb-6 sm:mb-8">
                        {/* text-lg: мобільні (1.125rem = 18px)
                            sm:text-xl: планшети+ (1.25rem = 20px) */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-10">Перекладіть речення:</h2>
                        {/* p-4: мобільні паддинг
                            sm:p-5: планшети+ паддинг */}
                        <div className="bg-blue-100/80 rounded-xl p-4 sm:p-5 border-l-4 border-blue-400">
                            {/* text-base: мобільні (16px)
                                sm:text-xl: планшети+ (20px) */}
                            <p className="text-xl text-gray-800 leading-relaxed font-mono tracking-wide">
                                {exerciseState.generatedExerciseData.example_ukr}
                            </p>
                        </div>
                    </div>

                    {uiState.showTranslation ? (
                        // АДАПТИВНА ПАНЕЛЬ ПОКАЗУ ПЕРЕКЛАДУ
                        <div className="w-full mb-4">
                            {/* flex-col: на мобільних кнопка і текст в колону
                                sm:flex-row: на планшетах+ в рядок
                                gap-2: мобільний зазор (0.5rem)
                                sm:gap-1.5: планшет+ зазор (0.375rem) */}
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1.5 bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                <button
                                    onClick={() => handlePlayAudio(exerciseState.generatedExerciseData.example_eng)}
                                    disabled={isGeneratingSpeech}
                                    // flex-shrink-0: запобігає стисканню кнопки на мобільних
                                    className="flex items-center justify-center hover:bg-green-100 rounded-lg p-2 transition-colors duration-200 cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Відтворити аудіо"
                                >
                                    {isGeneratingSpeech ? (
                                        <Loader className="w-6 sm:w-5 h-6 sm:h-5 animate-spin text-green-600" />
                                    ) : (
                                        <Volume2 className="w-6 sm:w-5 h-6 sm:h-5 text-green-600" />
                                    )}
                                </button>
                                {/* break-words: переносить довгі слова на новий рядок на мобільних */}
                                <p className="text-lg text-gray-800 font-semibold wrap-break-word">
                                    {highlightUsedForm(
                                        exerciseState.generatedExerciseData.example_eng,
                                        exerciseState.generatedExerciseData.used_form
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // АДАПТИВНА КНОПКА "ПОКАЗАТИ ПЕРЕКЛАД"
                        // mb-4: мобільні (1rem)
                        // sm:mb-6: планшети+ (1.5rem)
                        // px-4: мобільні паддинг по сторонам (1rem)
                        // sm:px-6: планшети+ паддинг (1.5rem)
                        // py-2.5: мобільні висота кнопки (0.625rem)
                        // sm:py-3: планшети+ висота (0.75rem)
                        // text-sm: мобільний розмір шрифту (14px)
                        // sm:text-base: планшет+ розмір (16px)
                        // w-full: займає всю ширину на мобільних
                        // sm:w-auto: природна ширина на планшетах+
                        <button
                            onClick={() =>
                                setUiState((prev) => ({
                                    ...prev,
                                    showTranslation: true,
                                }))
                            }
                            className="mb-4 sm:mb-6 px-6 py-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:scale-102 flex justify-center items-center gap-2 text-lg w-full sm:w-auto"
                        >
                            <Eye className="w-6 sm:w-5 h-6 sm:h-5" />
                            Показати переклад
                        </button>
                    )}

                    {uiState.showTip ? (
                        // АДАПТИВНА ПАНЕЛЬ ПОКАЗУ ПІДКАЗКИ
                        <div className="w-full mb-4">
                            {/* Аналогічна flex структура як для перекладу:
                                flex-col: мобільний макет в колону
                                sm:flex-row: планшет+ макет в рядок */}
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1.5 bg-violet-50 border-2 border-violet-200 rounded-xl p-2">
                                <button
                                    onClick={() =>
                                        handlePlayAudio(exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex].main_parameters.text)
                                    }
                                    disabled={isGeneratingSpeech}
                                    className="flex items-center justify-center hover:bg-violet-100 rounded-lg p-2 transition-colors duration-200 cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Відтворити аудіо"
                                >
                                    {isGeneratingSpeech ? (
                                        <Loader className="w-6 sm:w-5 h-6 sm:h-5 animate-spin text-violet-600" />
                                    ) : (
                                        <Volume2 className="w-6 sm:w-5 h-6 sm:h-5 text-violet-600" />
                                    )}
                                </button>
                                <p className="text-lg text-gray-800 font-semibold wrap-break-word">
                                    {exerciseState.currentSelection[exerciseState.currentVocabularyWordIndex].main_parameters.text}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // АДАПТИВНА КНОПКА "ПОКАЗАТИ ПІДКАЗКУ"
                        // Аналогічні адаптивні класи як для кнопки перекладу
                        <button
                            onClick={() =>
                                setUiState((prev) => {
                                    return {
                                        ...prev,
                                        showTip: true,
                                    };
                                })
                            }
                            className="mb-4 px-6 py-3 border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:scale-102 flex justify-center items-center gap-2 text-lg w-full sm:w-auto"
                        >
                            <Lightbulb className="w-6 sm:w-5 h-6 sm:h-5" />
                            Показати підказку
                        </button>
                    )}
                </>
            ) : data.length === 0 ? (
                // АДАПТИВНА ПОРОЖНЯ ПОСЛІДОВНІСТЬ - НЕМАЄ СЛІВ
                <div className="text-center py-8 sm:py-12">
                    <p className="text-sm sm:text-base text-gray-500">Немає слів для вивчення :(</p>
                </div>
            ) : (
                // АДАПТИВНА ПОСЛІДОВНІСТЬ - ЗАВЕРШЕНО
                <div className="text-center py-8 sm:py-12">
                    <p className="text-sm sm:text-base text-gray-500">Ви вивчили обов'язковий мінімум на сьогодні :)</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full sm:w-3/4 lg:w-1/2 min-h-160 sm:min-h-130 flex flex-col items-center bg-white rounded-2xl shadow-md p-6 lg:p-12 pt-12 lg:pt-16 pb-10 mx-5 sm:m-auto">
            {content}

            {/* АДАПТИВНИЙ КОНТЕЙНЕР ДЛЯ КНОПОК */}
            {/* self-stretch: займає всю ширину батьківського контейнера */}
            {/* flex-col: мобільний макет - кнопки в колону
                sm:flex-row: планшети+ - кнопки в рядок */}
            {/* gap-2: мобільний зазор між кнопками (0.5rem = 8px)
                sm:gap-3: планшети+ зазор (0.75rem = 12px) */}
            <div className="self-stretch flex flex-col sm:flex-row justify-center gap-3">
                {/* АДАПТИВНА КНОПКА "ПОВТОРИТИ" */}
                {/* px-6: мобільна паддінг по сторонам (1.5rem = 24px)
                    sm:px-22.5: планшети+ паддінг (5.625rem = 90px) */}
                {/* py-2.5: мобільна висота кнопки (0.625rem = 10px)
                    sm:py-3.5: планшети+ висота (0.875rem = 14px) */}
                {/* text-sm: мобільний розмір шрифту (14px)
                    sm:text-lg: планшети+ розмір (18px) */}
                {/* gap-2: мобільний зазор між іконкою та текстом (0.5rem)
                    sm:gap-3: планшети+ зазор (0.75rem) */}
                {/* w-full: займає всю ширину на мобільних
                    sm:w-auto: природна ширина на планшетах+ */}
                <button
                    onClick={() => handleNextButtonClick("AGAIN")}
                    hidden={data.length <= 0 || isLoadingVocabularyWords || exerciseState.isLoading || exerciseState.currentSelection.length <= 0}
                    className={`px-6 sm:px-22.5 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 flex justify-center items-center gap-2 sm:gap-3 order-1 sm:order-0 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102 cursor-pointer w-full sm:w-auto`}
                >
                    Повторити
                </button>
                {/* АДАПТИВНА КНОПКА "ДОБРЕ" */}
                {/* Аналогічні адаптивні класи як для кнопки "Повторити" */}
                <button
                    onClick={() => handleNextButtonClick("REVIEW")}
                    hidden={data.length <= 0 || isLoadingVocabularyWords || exerciseState.isLoading || exerciseState.currentSelection.length <= 0}
                    className={`px-6 sm:px-22.5 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 flex justify-center items-center gap-2 sm:gap-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102 cursor-pointer w-full sm:w-auto`}
                >
                    Добре
                </button>
            </div>

            <Modal
                isActive={uiState.showAddVocabularyWordModal}
                closeModal={handleCloseModal}
                onSubmit={handleAddWord}
                isLoading={isAddingVocabularyWord}
                existingWords={data}
            />
        </div>
    );
};

export { TranslateSentenceExercise };
