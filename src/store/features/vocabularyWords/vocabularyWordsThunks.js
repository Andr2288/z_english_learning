import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import OpenAI from "openai";

const NODE_ENV = process.env.NODE_ENV;
const API_URL = process.env.API_URL;
const MONGO_DB_WORDS_URL =
    "http://localhost:5001/api/flashcards/public/687d4b11d8e71d7041649b07";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const SENTENCE_TYPES = [
    "documentary",
    "story",
    "news",
    "article",
    "blog",
    "scientific",
    "announcement",
    "advertisement",
    "instruction",
    "review on product / video / post etc",
    "letter",
    "documentation",
    "comment",
    "social media post",
];

const getRandomSentenceType = () => {
    const randomIndex = Math.floor(Math.random() * SENTENCE_TYPES.length);
    console.log("Selected sentence type:", SENTENCE_TYPES[randomIndex]);
    return SENTENCE_TYPES[randomIndex];
};

const fetchVocabularyWords = createAsyncThunk(
    "vocabularyWords/fetch",
    async () => {
        const url =
            NODE_ENV === "development"
                ? `${API_URL}/vocabulary_words`
                : MONGO_DB_WORDS_URL;
        const response = await axios.get(`${url}`);

        return response.data;
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
    vocabularyWordMainParameters.relevant_translations.length > 0
        ? `- Relevant translations: ${JSON.stringify(vocabularyWordMainParameters.relevant_translations)}`
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
- Relevant translations: ["Восьмого грудня"]

OUTPUT:
{
    "example_ukr": "Моя відпустка починається п'ятого липня",
    "example_eng": "My vacation starts on July 5th",
    "used_form": "on July 5th"
}`;
        // TODO Dev
        console.log(input);

        const response = await client.responses.create({
            model: "gpt-4.1",
            temperature: 0.6,
            input,
        });

        let parsed;
        try {
            parsed = JSON.parse(response.output_text);

            // TODO Dev
            console.table(parsed);
        } catch (e) {
            throw new Error("OpenAI returned invalid JSON");
        }
        return parsed;
    }
);

export { fetchVocabularyWords, generateExerciseVocabularyItem };
