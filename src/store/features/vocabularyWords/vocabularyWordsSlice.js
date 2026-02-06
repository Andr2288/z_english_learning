import { createSlice, current } from "@reduxjs/toolkit";
import {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
} from "./vocabularyWordsThunks";
import { useCallback, useEffect } from "react";

const findMissedVocabularyItems = (state) => {
    for (const vocabularyItem of state.data) {
        // 1. Find daysPassedAfterLastReview
        if (
            vocabularyItem.metodology_parameters.status === "MISSED" ||
            vocabularyItem.metodology_parameters.status === "NEW"
        ) {
            continue;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        today.setHours(0, 0, 0, 0);
        lastReviewed.setHours(0, 0, 0, 0);
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = diffInMs / (1000 * 60 * 60 * 24);

        // 2. Find currentCheckpointIndex
        const currentCheckpointIndex = state.checkpoints.findIndex(
            (checkpoint) => {
                return (
                    checkpoint.checkpoint ===
                    vocabularyItem.metodology_parameters.checkpoint
                );
            }
        );

        if (currentCheckpointIndex === -1) {
            continue;
        }

        // 3. Update Missed Item
        if (
            daysPassedAfterLastReview >
            state.checkpoints[currentCheckpointIndex].threshold
        ) {
            // Update Item In Data Array
            vocabularyItem.metodology_parameters.status = "MISSED";

            if (vocabularyItem.metodology_parameters.checkpoint > 0) {
                vocabularyItem.metodology_parameters.checkpoint =
                    state.checkpoints[currentCheckpointIndex - 1].checkpoint;
            }

            console.log(
                `Знайшов елемент, де пропущено повторення: ${vocabularyItem.main_parameters.text}
                    Current Checkpoint: ${vocabularyItem.metodology_parameters.checkpoint}
                    Last previewed: ${vocabularyItem.metodology_parameters.lastReviewed}
                    Threshold for Current Checkpoint: ${state.checkpoints[currentCheckpointIndex].threshold}
                    Days passed after last review: ${daysPassedAfterLastReview}
                    ***
                    Set Checkpoint to: ${
                        vocabularyItem.metodology_parameters.checkpoint > 0
                            ? (vocabularyItem.metodology_parameters.checkpoint =
                                  state.checkpoints[
                                      currentCheckpointIndex - 1
                                  ].checkpoint)
                            : 0
                    }
                    Set Status to: "MISSED"
                    `
            );
        }
    }
};

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

    // Пріоритет 2: Item reviewed 1 day ago
    const yesterdayItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        today.setHours(0, 0, 0, 0);
        lastReviewed.setHours(0, 0, 0, 0);
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = diffInMs / (1000 * 60 * 60 * 24);

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

    // Пріоритет 3: Item reviewed 7 days ago
    const sevenDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        today.setHours(0, 0, 0, 0);
        lastReviewed.setHours(0, 0, 0, 0);
        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = diffInMs / (1000 * 60 * 60 * 24);

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

    // Пріоритет 4: Item reviewed 14 days ago
    const fourteenDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        today.setHours(0, 0, 0, 0);
        lastReviewed.setHours(0, 0, 0, 0);

        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = diffInMs / (1000 * 60 * 60 * 24);

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

    // Пріоритет 5: Item reviewed 30 days ago
    const thirtyDaysAgoItemIndex = data.findIndex((vocabularyItem) => {
        if (!vocabularyItem.metodology_parameters.lastReviewed) {
            return false;
        }

        const today = new Date();
        const lastReviewed = new Date(
            vocabularyItem.metodology_parameters.lastReviewed
        );
        today.setHours(0, 0, 0, 0);
        lastReviewed.setHours(0, 0, 0, 0);

        const diffInMs = today - lastReviewed;
        const daysPassedAfterLastReview = diffInMs / (1000 * 60 * 60 * 24);

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

    // Пріоритет 6: New Items (30%)
    const newItems = data
        .filter(
            (vocabularyItem) =>
                vocabularyItem.metodology_parameters.status === "NEW"
        )
        .slice(0, 3); // беремо рівно 3

    if (newItems.length > 0) {
        nextSelection.push(...newItems);

        newItems.forEach((item) => {
            console.log(`Знайшов new Item: ${item.main_parameters.text}`);
        });
    }

    // Пріоритет 7: AGAIN today item
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
                threshold: 1,
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
            findMissedVocabularyItems(state);
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
                    checkpoint: word.checkpoint,
                },
            });

            if (state.exerciseState.currentSelection.length === 0) {
                state.exerciseState.currentSelection = selectNextItems(
                    state.data
                );
            }
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

            findMissedVocabularyItems(state);
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
