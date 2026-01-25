import { createSlice } from "@reduxjs/toolkit";
import { fetchVocabularyWords, generateExerciseVocabularyItem } from "./vocabularyWordsThunks";

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

        builder.addCase(generateExerciseVocabularyItem.fulfilled, (state, action) => {
            state.exerciseVocabularyItem = action.payload;
        });
    },
});

export const vocabularyWordsReducer = vocabularyWordsSlice.reducer;
