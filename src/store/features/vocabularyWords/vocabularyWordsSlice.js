import { createSlice, current } from "@reduxjs/toolkit";
import {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
} from "./vocabularyWordsThunks";
import { useCallback, useEffect } from "react";

const selectNextItems = (data) => {
    const nextSelection = [];

    // Пріоритет 1: MISSED Item
    const missedItemIndex = data.findIndex((vocabularyItem) => {
        return vocabularyItem.metodology_parameters.status === "MISSED";
    });
    if (missedItemIndex !== -1) {
        nextSelection.push(data[missedItemIndex]);
        console.log(
            `Знайшов MISSED Item: ${data[missedItemIndex].main_parameters.text}`
        );
    }

    // Пріоритет 2: AGAIN today item
    const againItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Europe/Kyiv",
        });
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        ).toLocaleDateString("en-CA", {
            timeZone: "Europe/Kyiv",
        });

        return (
            vocabularyItem.metodology_parameters.status === "AGAIN" &&
            lastReviewed === today
        );
    });
    if (againItemIndex !== -1) {
        nextSelection.push(data[againItemIndex]);
        console.log(
            `Знайшов AGAIN today item: ${data[againItemIndex].main_parameters.text}`
        );
    }

    // Пріоритет 3: Item reviewed 1 day ago
    const yesterdayItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );

        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = Math.floor(
            diffInMs / (1000 * 60 * 60 * 24)
        );

        return (
            daysPassedAfterLastReview === 1 &&
            vocabularyItem.metodology_parameters.checkpoint <= 1 &&
            vocabularyItem.metodology_parameters.status !== "MISSED"
        );
    });
    if (yesterdayItemIndex !== -1) {
        nextSelection.push(data[yesterdayItemIndex]);
        console.log(
            `Знайшов Item reviewed 1 day ago: ${data[yesterdayItemIndex].main_parameters.text}`
        );
    }

    // Пріоритет 4: Item reviewed 7 days ago
    const sevenDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = Math.floor(
            diffInMs / (1000 * 60 * 60 * 24)
        );

        return (
            daysPassedAfterLastReview === 5 &&
            vocabularyItem.metodology_parameters.checkpoint === 2 &&
            vocabularyItem.metodology_parameters.status !== "MISSED"
        );
    });
    if (sevenDaysAgoItemIndex !== -1) {
        nextSelection.push(data[sevenDaysAgoItemIndex]);
        console.log(
            `Знайшов Item reviewed 7 days ago: ${data[sevenDaysAgoItemIndex].main_parameters.text}`
        );
    }

    // Пріоритет 5: Item reviewed 14 days ago
    const fourteenDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = Math.floor(
            diffInMs / (1000 * 60 * 60 * 24)
        );

        return (
            daysPassedAfterLastReview === 7 &&
            vocabularyItem.metodology_parameters.checkpoint === 7 &&
            vocabularyItem.metodology_parameters.status !== "MISSED"
        );
    });
    if (fourteenDaysAgoItemIndex !== -1) {
        nextSelection.push(data[fourteenDaysAgoItemIndex]);
        console.log(
            `Знайшов Item reviewed 14 days ago: ${data[fourteenDaysAgoItemIndex].main_parameters.text}`
        );
    }

    // Пріоритет 6: Item reviewed 30 days ago
    const thirtyDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = Math.floor(
            diffInMs / (1000 * 60 * 60 * 24)
        );

        return (
            daysPassedAfterLastReview === 16 &&
            vocabularyItem.metodology_parameters.checkpoint === 14 &&
            vocabularyItem.metodology_parameters.status !== "MISSED"
        );
    });
    if (thirtyDaysAgoItemIndex !== -1) {
        nextSelection.push(data[thirtyDaysAgoItemIndex]);
        console.log(
            `Знайшов Item reviewed 30 days ago: ${data[thirtyDaysAgoItemIndex].main_parameters.text}`
        );
    }

    console.log(nextSelection.length);
    return nextSelection;
};

const vocabularyWordsSlice = createSlice({
    name: "vocabularyWords",
    initialState: {
        data: [],
        exerciseState: {
            exerciseVocabularyItem: null,
            currentSelection: [],
            currentVocabularyWordIndex: 0,
            isLoading: false,
            generateNextStage: true,
        },
        checkpoints: [
            {
                checkpoint: 0,
                threshold: 0,
            },
            {
                checkpoint: 1,
                threshold: 1,
            },
            {
                checkpoint: 2,
                threshold: 5,
            },
            {
                checkpoint: 7,
                threshold: 7,
            },
            {
                checkpoint: 14,
                threshold: 16,
            },
        ],
    },
    reducers: {
        updateExerciseState: (state, action) => {
            state.exerciseState = {
                ...state.exerciseState,
                ...action.payload,
            };
        },
        makeNextSelection: (state) => {
            state.exerciseState.currentSelection = [];
            state.exerciseState.currentSelection = selectNextItems(state.data);
        },
    },
    extraReducers(builder) {
        builder.addCase(addVocabularyWord.fulfilled, (state, action) => {
            const word = action.payload;
            state.data.push({
                id: word.id,
                main_parameters: {
                    text: word.text,
                    topic: word.topic,
                    relevant_translations: word.relevant_translations,
                },
                metodology_parameters: {
                    status: word.status,
                    lastReviewed: word.last_reviewed,
                    quality: word.quality,
                },
            });
        });

        builder.addCase(fetchVocabularyWords.fulfilled, (state, action) => {
            state.data = action.payload.map((word) => ({
                id: word.id,
                main_parameters: {
                    text: word.text,
                    topic: word.topic,
                    relevant_translations: word.relevant_translations,
                },
                metodology_parameters: {
                    status: word.status,
                    lastReviewed: word.last_reviewed,
                    checkpoint: word.checkpoint,
                },
            }));

            state.exerciseState.currentSelection = selectNextItems(state.data);
        });

        builder.addCase(updateVocabularyWord.pending, (state) => {
            state.exerciseState.isLoading = true;
        });

        builder.addCase(updateVocabularyWord.fulfilled, (state, action) => {
            const word = action.payload[0];
            console.log(action.payload[0]);
            const index = state.data.findIndex((w) => w.id === word.id);
            if (index !== -1) {
                state.data[index] = {
                    id: word.id,
                    main_parameters: {
                        text: word.text,
                        topic: word.topic,
                        relevant_translations: word.relevant_translations,
                    },
                    metodology_parameters: {
                        status: word.status,
                        lastReviewed: word.last_reviewed,
                        checkpoint: word.checkpoint,
                    },
                };
            }
            state.exerciseState.isLoading = false;
        });

        builder.addCase(generateExerciseVocabularyItem.pending, (state) => {
            state.exerciseState.isLoading = true;
            state.exerciseState.generateNextStage = false;
        });

        builder.addCase(
            generateExerciseVocabularyItem.fulfilled,
            (state, action) => {
                state.exerciseState.exerciseVocabularyItem = action.payload;
                state.exerciseState.isLoading = false;
            }
        );
    },
});

export const { updateExerciseState, makeNextSelection } =
    vocabularyWordsSlice.actions;
export const vocabularyWordsReducer = vocabularyWordsSlice.reducer;
