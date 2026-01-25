import { useThunk } from "../../hooks/use-thunk";
import {
    fetchVocabularyWords,
    generateExerciseVocabularyItem,
} from "../../store";
import { useSelector } from "react-redux";

import { useState, useEffect } from "react";

import Button from "../common/Button";

import { GoSync } from "react-icons/go";

function Exercise() {
    const [
        doFetchVocabularyWords,
        isLoadingVocabularyWords,
        loadingVocabularyWordsError,
    ] = useThunk(fetchVocabularyWords);

    const [
        doGenerateExerciseVocabularyItem,
        isLoadingExerciseVocabularyItem,
        generateExerciseVocabularyItemError,
    ] = useThunk(generateExerciseVocabularyItem);

    const { data, exerciseVocabularyItem } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const [currentVocabularyWordIndex, setCurrentVocabularyWordIndex] =
        useState(0);

    const [showTranslation, setShowTranslation] = useState(false);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

    useEffect(() => {
        if (data.length > 0) {
            doGenerateExerciseVocabularyItem(
                data[currentVocabularyWordIndex].text
            );
        }
    }, [currentVocabularyWordIndex, data, doGenerateExerciseVocabularyItem]);

    let content;

    if (loadingVocabularyWordsError) {
        content = <div>Error fetching data...</div>;
    } else {
        content = (
            <div className="mb-4 flex-1 flex flex-col items-center justify-center w-full text-center">
                {isLoadingExerciseVocabularyItem ? (
                    <GoSync className="animate-spin text-3xl" />
                ) : generateExerciseVocabularyItemError ? (
                    <>Error generating data</>
                ) : data.length > 0 && exerciseVocabularyItem ? (
                    <>
                        <h2 className="text-3xl mb-8">
                            {exerciseVocabularyItem.exampleUkr}
                        </h2>

                        {showTranslation ? (
                            <h2 className="text-2xl mb-4 font-semibold text-blue-900">
                                {exerciseVocabularyItem.exampleEng}
                            </h2>
                        ) : (
                            <Button
                                className="mb-4"
                                secondary
                                onClick={() => setShowTranslation(true)}
                            >
                                Показати переклад
                            </Button>
                        )}

                        {showTip ? (
                            <h2 className="text-xl mb-4 font-semibold">
                                {exerciseVocabularyItem.text}
                            </h2>
                        ) : (
                            <Button
                                className="mb-4"
                                secondary
                                onClick={() => setShowTip(true)}
                            >
                                Показати підказку
                            </Button>
                        )}
                    </>
                ) : (
                    <>No data</>
                )}
            </div>
        );
    }

    const handleNextButtonClick = () => {
        setShowTranslation(false);
        setShowTip(false);

        // TODO: Оновити accecibilityPercentage для поточного слова
        // TODO: Вибрати наступне слово з масиву даних
        setCurrentVocabularyWordIndex(() => {
            const randomIndex = Math.floor(Math.random() * data.length);
            return randomIndex;
        });
    };

    return (
        <div className="w-1/2 min-h-96 flex flex-col items-center p-12 text-gray-700 font-semibold bg-white border border-gray-200 rounded-2xl shadow-lg">
            {content}
            <Button
                className="px-[150px] py-[20px]"
                primary
                rounded
                onClick={handleNextButtonClick}
            >
                Next
            </Button>
        </div>
    );
}

export default Exercise;
