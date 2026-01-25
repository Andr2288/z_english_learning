import { configureStore } from "@reduxjs/toolkit";
import { vocabularyWordsReducer } from "./features/vocabularyWords/vocabularyWordsSlice";

export const store = configureStore({
    reducer: {
        vocabularyWords: vocabularyWordsReducer,
    },
});

export * from "./features/users/usersThunks";
