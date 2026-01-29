import { createSlice, current } from "@reduxjs/toolkit";
import {
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
} from "./vocabularyWordsThunks";

const vocabularyWordsSlice = createSlice({
    name: "vocabularyWords",
    initialState: {
        data: [],
        exerciseVocabularyItem: null,
    },
    extraReducers(builder) {
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
                    quality: word.quality,
                },
            }));
        });

        builder.addCase(updateVocabularyWord.fulfilled, (state, action) => {
            const word = action.payload;
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
                        quality: word.quality,
                    },
                };
            }
        });

        builder.addCase(
            generateExerciseVocabularyItem.fulfilled,
            (state, action) => {
                state.exerciseVocabularyItem = action.payload;
            }
        );
    },
});

export const vocabularyWordsReducer = vocabularyWordsSlice.reducer;
