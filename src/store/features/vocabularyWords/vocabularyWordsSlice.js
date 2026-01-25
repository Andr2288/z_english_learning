import { createSlice } from "@reduxjs/toolkit";
import { fetchVocabularyWords } from "./vocabularyWordsThunks";

const vocabularyWordsSlice = createSlice({
    name: "vocabularyWords",
    initialState: {
        data: [],
    },
    extraReducers(builder) {
        builder.addCase(fetchVocabularyWords.fulfilled, (state, action) => {
            state.data = action.payload;
        });
    },
});

export const vocabularyWordsReducer = vocabularyWordsSlice.reducer;
