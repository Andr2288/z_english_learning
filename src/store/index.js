import { configureStore } from "@reduxjs/toolkit";

import { updateExerciseState } from "./features/vocabularyWords/vocabularyWordsSlice";
import { vocabularyWordsReducer } from "./features/vocabularyWords/vocabularyWordsSlice";

export const store = configureStore({
    reducer: {
        vocabularyWords: vocabularyWordsReducer,
    },
});

export { updateExerciseState };
export * from "./features/vocabularyWords/vocabularyWordsThunks";
