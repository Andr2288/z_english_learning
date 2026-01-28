import { useThunk } from "../../hooks/use-thunk";
import {
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
} from "../../store";
import { useSelector } from "react-redux";

import { useState, useEffect } from "react";

import { Loader, Eye, Lightbulb } from "lucide-react";

function Exercise() {
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

    const { data, exerciseVocabularyItem } = useSelector((state) => {
        return state.vocabularyWords;
    });

    // TODO Initial State = 0
    const [currentVocabularyWordIndex, setCurrentVocabularyWordIndex] =
        useState(1);

    const [showTranslation, setShowTranslation] = useState(false);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

    useEffect(() => {
        if (data.length > 0) {
            doGenerateExerciseVocabularyItem(
                data[currentVocabularyWordIndex].main_parameters
            );
        }
    }, [data.length]);

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
            ) : isLoadingExerciseVocabularyItem ? (
                <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Генерування даних ...</p>
                </div>
            ) : generateExerciseVocabularyItemError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-medium">
                        Упс! Сталася помилка під час генерації вправи :(
                    </p>
                </div>
            ) : data.length > 0 && exerciseVocabularyItem ? (
                <>
                    <div className="w-full mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-10">
                            Перекладіть речення:
                        </h2>
                        <div className="bg-blue-100/80 rounded-xl p-5 border-l-4 border-blue-400">
                            <p className="text-xl text-gray-800 leading-relaxed font-mono tracking-wide">
                                {exerciseVocabularyItem.example_ukr}
                            </p>
                        </div>
                    </div>

                    {showTranslation ? (
                        <div className="w-full mb-4">
                            <div className="flex justify-center items-center gap-1.5 bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                <div className="flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-lg text-gray-800 font-semibold">
                                    {highlightUsedForm(
                                        exerciseVocabularyItem.example_eng,
                                        exerciseVocabularyItem.used_form
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowTranslation(true)}
                            className="mb-6 px-6 py-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:scale-102 flex items-center gap-2"
                        >
                            <Eye className="w-5 h-5" />
                            Показати переклад
                        </button>
                    )}

                    {showTip ? (
                        <div className="w-full mb-4">
                            <div className="flex justify-center items-center gap-1.5 bg-violet-50 border-2 border-violet-200 rounded-xl p-3">
                                <div className="flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-violet-600" />
                                </div>
                                <p className="text-lg text-gray-800 font-semibold">
                                    {
                                        data[currentVocabularyWordIndex]
                                            .main_parameters.text
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowTip(true)}
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

    const handleNextButtonClick = (quality) => {
        setShowTranslation(false);
        setShowTip(false);

        // TODO: Оновити дані поточного слова
        const currentWord = data[currentVocabularyWordIndex];

        doUpdateVocabularyWord({
            id: currentWord.id,
            metodology_parameters: {
                status: "LEARNING",
                lastReviewed: new Date().toISOString(),
                quality,
            },
        });

        const nextIndex = Math.floor(Math.random() * data.length);
        setCurrentVocabularyWordIndex(nextIndex);

        doGenerateExerciseVocabularyItem(data[nextIndex].main_parameters);
    };

    return (
        <div className="w-1/2 min-h-130 flex flex-col items-center bg-white rounded-2xl shadow-md p-12 pt-16 pb-10">
            {content}
            <div className="self-stretch flex justify-center gap-3">
                <button
                    onClick={() => handleNextButtonClick("AGAIN")}
                    disabled={isLoadingExerciseVocabularyItem}
                    hidden={
                        isLoadingVocabularyWords ||
                        isLoadingExerciseVocabularyItem
                    }
                    className={`px-[90px] py-[14px] rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                        isLoadingExerciseVocabularyItem
                            ? "bg-gray-300 text-gray-500"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102"
                    }`}
                >
                    Повторити
                </button>
                <button
                    onClick={() => handleNextButtonClick("GOOD")}
                    disabled={isLoadingExerciseVocabularyItem}
                    hidden={
                        isLoadingVocabularyWords ||
                        isLoadingExerciseVocabularyItem
                    }
                    className={`px-[90px] py-[14px] rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                        isLoadingExerciseVocabularyItem
                            ? "bg-gray-300 text-gray-500"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-102"
                    }`}
                >
                    Добре
                </button>
            </div>
        </div>
    );
}

export default Exercise;
