import { configureStore } from "@reduxjs/toolkit";

import {
    updateExerciseState,
    makeNextSelection,
} from "./features/vocabularyWords/vocabularyWordsSlice";
import { vocabularyWordsReducer } from "./features/vocabularyWords/vocabularyWordsSlice";

export const store = configureStore({
    reducer: {
        vocabularyWords: vocabularyWordsReducer,
    },
});

export { updateExerciseState, makeNextSelection };
export * from "./features/vocabularyWords/vocabularyWordsThunks";
