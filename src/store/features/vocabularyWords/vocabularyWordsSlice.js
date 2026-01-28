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
            state.data = action.payload;
        });

        builder.addCase(updateVocabularyWord.fulfilled, (state, action) => {
            const index = state.data.findIndex(
                (word) => word.id === action.payload.id
            );
            if (index !== -1) {
                state.data[index] = action.payload;
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
