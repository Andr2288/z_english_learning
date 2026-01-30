import { createAsyncThunk } from "@reduxjs/toolkit";

import OpenAI from "openai";
import { supabase } from "./supabase.js";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const addVocabularyWord = createAsyncThunk(
    "vocabularyWords/add",
    async (newWord) => {
        const { data, error } = await supabase
            .from("vocabulary_words")
            .insert([
                {
                    text: newWord.text,
                    topic: newWord.topic || null,
                    relevant_translations:
                        newWord.relevant_translations || null,
                    status: "NEW",
                    last_reviewed: null,
                    quality: null,
                },
            ])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }
);

const fetchVocabularyWords = createAsyncThunk(
    "vocabularyWords/fetch",
    async () => {
        const { data: vocabulary_words, error } = await supabase
            .from("vocabulary_words")
            .select("*");

        if (error) {
            throw new Error(error.message);
        }

        return vocabulary_words;
    }
);

const updateVocabularyWord = createAsyncThunk(
    "vocabularyWords/update",
    async ({ id, metodology_parameters }) => {
        const { data, error } = await supabase
            .from("vocabulary_words")
            .update({
                status: metodology_parameters.status,
                last_reviewed: metodology_parameters.lastReviewed,
                quality: metodology_parameters.quality,
            })
            .eq("id", id)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
);

const generateExerciseVocabularyItem = createAsyncThunk(
    "vocabularyWords/generateExerciseVocabularyItem",
    async (vocabularyWordMainParameters) => {
        const input = `Generate a JSON object for an English word/phrase/pattern.

INPUT:
- Word/phrase/pattern: "${vocabularyWordMainParameters.text}"
${
    vocabularyWordMainParameters.topic
        ? `- Topic: "${vocabularyWordMainParameters.topic}"`
        : ""
}
${
    vocabularyWordMainParameters.relevant_translations
        ? `- Relevant translations: ${vocabularyWordMainParameters.relevant_translations}`
        : ""
}

OUTPUT STRUCTURE:
{
    "example_ukr": "Natural Ukrainian sentence using this word/phrase/pattern",
    "example_eng": "The same sentence in English",
    "used_form": "the exact form of word/phrase/pattern you used in "example_eng" (because after parsing I want to underline used form on the client side)"
}

REQUIREMENTS:
1. Create ONE example sentence
3. Ukrainian example must sound native and natural - DO NOT translate word-by-word
4. If the input contains relevant translations - use them as translation examples and don't translate the word/phrase/pattern by yourself
5. Return ONLY valid JSON, no markdown, no explanations

A GOOD EXAMPLE FOR A VERB PHRASE:

INPUT:
- Word/phrase/pattern: "To pay for"

OUTPUT:
{
    "example_ukr": "Я заплачу за квартиру завтра",
    "example_eng": "I will pay for the apartment tomorrow",
    "used_form": "will pay for"
}

A GOOD EXAMPLE FOR A PATTERN:

INPUT:
- Word/phrase/pattern: "On {month} {ordinal numeral}"
- Topic: "Time & Dates" 
- Relevant translations: "Восьмого грудня"

OUTPUT:
{
    "example_ukr": "Моя відпустка починається п'ятого липня",
    "example_eng": "My vacation starts on July 5th",
    "used_form": "on July 5th"
}`;

        const response = await client.responses.create({
            model: "gpt-4o-mini",
            temperature: 0.6,
            input,
        });

        let parsed;
        try {
            parsed = JSON.parse(response.output_text);
        } catch (e) {
            throw new Error("OpenAI returned invalid JSON");
        }
        return parsed;
    }
);

export {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
};
