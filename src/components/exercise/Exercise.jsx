import { useThunk } from "../../hooks/use-thunk";
import { fetchVocabularyWords } from "../../store/features/vocabularyWords/vocabularyWordsThunks";
import { useSelector } from "react-redux";

import { useState, useEffect } from "react";

import Button from "../common/Button";
import ExerciseItem from "./ExerciseItem";

import { GoSync } from "react-icons/go";

function Exercise() {
    const [doFetchVocabularyWords, isLoadingVocabularyWords, loadingVocabularyWordsError] =
        useThunk(fetchVocabularyWords);

    const { data } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const [currentVocabularyWordIndex, setCurrentVocabularyWordIndex] = useState(0);

    useEffect(() => {
        doFetchVocabularyWords();
    }, [doFetchVocabularyWords]);

    useEffect(() => {
        // TODO: Підготувати всі необхідні дані для компоненту ExerciseItem
    }, [currentVocabularyWordIndex]);

    let content;
    if (isLoadingVocabularyWords) {
        content = <GoSync className="animate-spin text-white text-2xl" />;
    } else if (loadingVocabularyWordsError) {
        content = <div>Error fetching data...</div>;
    } else {
        if (data.length > 0) {
            content = (
                <ExerciseItem className="mb-4" vocabularyWord={data[currentVocabularyWordIndex]} />
            );
        } else {
            content = <div>No vocabulary words available.</div>;
        }
    }

    const handleNextButtonClick = () => {
        // TODO: Оновити accecibilityPercentage для поточного слова
        // TODO: Вибрати наступне слово з масиву даних
        setCurrentVocabularyWordIndex((prevIndex) => {
            for (let i = prevIndex + 1; i < data.length; i++) {
                if (data[i].accessibilityPercentage === 100) {
                    return i;
                }
            }

            return 0;
        });
    };

    return (
        <div className="w-2/3 bg-green-500 flex items-center flex-col">
            {content}
            <Button className="px-[150px] py-[20px]" primary onClick={handleNextButtonClick}>
                Next
            </Button>
        </div>
    );
}

export default Exercise;
