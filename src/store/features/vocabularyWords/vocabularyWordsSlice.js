import { createSlice, current } from "@reduxjs/toolkit";
import {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
} from "./vocabularyWordsThunks";

const vocabularyWordsSlice = createSlice({
    name: "vocabularyWords",
    initialState: {
        data: [],
        exerciseState: {
            exerciseVocabularyItem: null,
            currentVocabularyWordIndex: 0,
            isLoading: false,
            generateNextStage: true,
        },
    },
    reducers: {
        updateExerciseState: (state, action) => {
            state.exerciseState = {
                ...state.exerciseState,
                ...action.payload,
            };
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
        });

        builder.addCase(updateVocabularyWord.pending, (state) => {
            state.exerciseState.isLoading = true;
            state.exerciseState.generateNextStage = false;
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
            state.exerciseState.generateNextStage = true;
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

export const { updateExerciseState } = vocabularyWordsSlice.actions;
export const vocabularyWordsReducer = vocabularyWordsSlice.reducer;
