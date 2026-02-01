import { useThunk } from "../../hooks/use-thunk";
import {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
    updateExerciseState,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";

import { useState, useEffect, useCallback } from "react";

import { Loader, Eye, Lightbulb } from "lucide-react";

import Modal from "../common/Modal.jsx";

function Exercise() {
    const [
        doAddVocabularyWord,
        isAddingVocabularyWord,
        addVocabularyWordError,
    ] = useThunk(addVocabularyWord);

    const [
        doFetchVocabularyWords,
        isLoadingVocabularyWords,
        loadingVocabularyWordsError,
    ] = useThunk(fetchVocabularyWords);

    const [
        doUpdateVocabularyWord,
        isUpdatingVocabularyWord,
        updateVocabularyWordError,
    ] = useThunk(updateVocabularyWord);

    const [
        doGenerateExerciseVocabularyItem,
        isLoadingExerciseVocabularyItem,
        generateExerciseVocabularyItemError,
    ] = useThunk(generateExerciseVocabularyItem);

    const { data, exerciseState } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const dispatch = useDispatch();

    const [uiState, setUiState] = useState({
        showTranslation: false,
        showTip: false,
        showAddVocabularyWordModal: false,
    });

    const handleNextButtonClick = (quality) => {
        setUiState((prev) => {
            return {
                ...prev,
                showTranslation: false,
                showTip: false,
            };
        });

        // TODO: Оновити дані поточного слова
        const currentWord = data[exerciseState.currentVocabularyWordIndex];

        doUpdateVocabularyWord({
            id: currentWord.id,
            metodology_parameters: {
                status: "LEARNING",
                lastReviewed: new Date().toISOString(),
                quality,
            },
        });

        dispatch(
            updateExerciseState({
                currentVocabularyWordIndex: Math.floor(
                    Math.random() * data.length
                ),
                //currentVocabularyWordIndex: data.length - 1,
            })
        );
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
        if (data.length > 0 && exerciseState.generateNextStage) {
            //console.log(JSON.stringify(data, null, 2));
            doGenerateExerciseVocabularyItem(
                data[exerciseState.currentVocabularyWordIndex].main_parameters
            );
        }
    }, [
        data,
        doGenerateExerciseVocabularyItem,
        exerciseState.currentVocabularyWordIndex,
        isUpdatingVocabularyWord,
    ]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (
                !event.ctrlKey &&
                event.code === "Space" &&
                !uiState.showAddVocabularyWordModal
            ) {
                event.preventDefault();
                setUiState((prev) => ({
                    ...prev,
                    showAddVocabularyWordModal: true,
                }));
                return;
            }

            if (
                event.ctrlKey &&
                event.altKey &&
                !uiState.showAddVocabularyWordModal
            ) {
                event.preventDefault();
                handleNextButtonClick("AGAIN");
                return;
            }

            if (
                event.ctrlKey &&
                event.code === "Space" &&
                !uiState.showAddVocabularyWordModal
            ) {
                event.preventDefault();
                handleNextButtonClick("GOOD");
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
                    <span
                        key={index}
                        className="underline decoration-2 decoration-dashed decoration-green-400 underline-offset-5"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const content = (
        <div className="mb-4 flex-1 flex flex-col items-center justify-center w-full text-center">
            {isLoadingVocabularyWords ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Завантаження карток...</p>
                </div>
            ) : loadingVocabularyWordsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-medium">
                        Упс! Сталася помилка під час завантаження карток :(
                    </p>
                </div>
            ) : exerciseState.isLoading ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Зачекайте, будь ласка ...</p>
                </div>
            ) : updateVocabularyWordError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-medium">
                        Упс! Сталася помилка під час оновлення фрази :(
                    </p>
                </div>
            ) : generateExerciseVocabularyItemError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-medium">
                        Упс! Сталася помилка під час генерації вправи :(
                    </p>
                </div>
            ) : data.length > 0 && exerciseState.exerciseVocabularyItem ? (
                <>
                    <div className="w-full mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-10">
                            Перекладіть речення:
                        </h2>
                        <div className="bg-blue-100/80 rounded-xl p-5 border-l-4 border-blue-400">
                            <p className="text-xl text-gray-800 leading-relaxed font-mono tracking-wide">
                                {
                                    exerciseState.exerciseVocabularyItem
                                        .example_ukr
                                }
                            </p>
                        </div>
                    </div>

                    {uiState.showTranslation ? (
                        <div className="w-full mb-4">
                            <div className="flex justify-center items-center gap-1.5 bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                <div className="flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-lg text-gray-800 font-semibold">
                                    {highlightUsedForm(
                                        exerciseState.exerciseVocabularyItem
                                            .example_eng,
                                        exerciseState.exerciseVocabularyItem
                                            .used_form
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() =>
                                setUiState((prev) => ({
                                    ...prev,
                                    showTranslation: true,
                                }))
                            }
                            className="mb-6 px-6 py-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:scale-102 flex items-center gap-2"
                        >
                            <Eye className="w-5 h-5" />
                            Показати переклад
                        </button>
                    )}

                    {uiState.showTip ? (
                        <div className="w-full mb-4">
                            <div className="flex justify-center items-center gap-1.5 bg-violet-50 border-2 border-violet-200 rounded-xl p-3">
                                <div className="flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-violet-600" />
                                </div>
                                <p className="text-lg text-gray-800 font-semibold">
                                    {
                                        data[
                                            exerciseState
                                                .currentVocabularyWordIndex
                                        ].main_parameters.text
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() =>
                                setUiState((prev) => {
                                    return {
                                        ...prev,
                                        showTip: true,
                                    };
                                })
                            }
                            className="mb-4 px-6 py-3 border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:scale-102 flex items-center gap-2"
                        >
                            <Lightbulb className="w-5 h-5" />
                            Показати підказку
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">Немає слів для вивчення :(</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-1/2 min-h-130 flex flex-col items-center bg-white rounded-2xl shadow-md p-12 pt-16 pb-10">
            {content}
            <div className="self-stretch flex justify-center gap-3">
                <button
                    onClick={() => handleNextButtonClick("AGAIN")}
                    hidden={
                        data.length <= 0 ||
                        isLoadingVocabularyWords ||
                        exerciseState.isLoading
                    }
                    className={`px-22.5 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102 cursor-pointer`}
                >
                    Повторити
                </button>
                <button
                    onClick={() => handleNextButtonClick("GOOD")}
                    hidden={
                        data.length <= 0 ||
                        isLoadingVocabularyWords ||
                        exerciseState.isLoading
                    }
                    className={`px-22.5 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102 cursor-pointer`}
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
}

export default Exercise;
