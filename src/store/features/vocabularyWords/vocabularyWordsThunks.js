import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import OpenAI from "openai";

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
        const response = await axios.get(`${MONGO_DB_WORDS_URL}`);

        return response.data;
    }
);

const generateExerciseVocabularyItem = createAsyncThunk(
    "vocabularyWords/generateExerciseVocabularyItem",
    async (vocabularyWordText) => {
        const response = await client.responses.create({
            model: "gpt-4.1",
            temperature: 0.8,
            input: `Generate a JSON object for the English word / phrase / pattern "${vocabularyWordText}" with the following structure:

text: the English word
exampleUkr: one sentence in Ukrainian that uses the word / phrase / pattern
exampleEng: the same example sentence in English

Requirements:
- The main word / phrase / pattern is "${vocabularyWordText}"
- It should sound natural in Ukrainian so you must find appropriate usage in Ukrainian. Do not translate word by word.
- Output only valid JSON
- Do not include explanations, markdown, or extra text`,
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

export { fetchVocabularyWords, generateExerciseVocabularyItem };
