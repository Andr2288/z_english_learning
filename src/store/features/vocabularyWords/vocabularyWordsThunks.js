import { createAsyncThunk } from "@reduxjs/toolkit";

import OpenAI from "openai";
import { supabase } from "./supabase.js";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const addVocabularyWord = createAsyncThunk("vocabularyWords/add", async (newWord) => {
    const { data, error } = await supabase
        .from("vocabulary_words")
        .insert([
            {
                text: newWord.text,
                topic: newWord.topic || null,
                relevant_translations: newWord.relevant_translations || null,
            },
        ])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
});

const fetchVocabularyWords = createAsyncThunk("vocabularyWords/fetch", async () => {
    const { data: vocabulary_words, error } = await supabase.from("vocabulary_words").select("*").order("id", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return vocabulary_words;
});

const updateVocabularyWord = createAsyncThunk("vocabularyWords/update", async ({ id, exerciseType, metodology_parameters }) => {
    const { data, error } = await supabase
        .from("vocabulary_words")
        .update({
            [`status_${exerciseType}`]: metodology_parameters[`status_${exerciseType}`],
            [`last_reviewed_${exerciseType}`]: metodology_parameters[`last_reviewed_${exerciseType}`],
            [`checkpoint_${exerciseType}`]: metodology_parameters[`checkpoint_${exerciseType}`],
        })
        .eq("id", id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
});

const GPTModel = {
    GPT4oMini: "gpt-4o-mini",
    GPT41Mini: "gpt-4.1-mini",
    GPT5Mini: "gpt-5-mini",
};

Object.freeze(GPTModel);

const generateExerciseVocabularyItem = createAsyncThunk("vocabularyWords/generateExerciseVocabularyItem", async (vocabularyWordMainParameters) => {
    const input = `Generate a JSON object for an English word/phrase/pattern.

INPUT:
- Word/phrase/pattern: "${vocabularyWordMainParameters.text}"
${vocabularyWordMainParameters.topic ? `- Topic: "${vocabularyWordMainParameters.topic}"` : ""}
${vocabularyWordMainParameters.relevant_translations ? `- Relevant translations: ${vocabularyWordMainParameters.relevant_translations}` : ""}

OUTPUT STRUCTURE:
{
    "example_ukr": "Natural Ukrainian sentence using this word/phrase/pattern",
    "example_eng": "The same sentence in English",
    "used_form": "the exact form of word/phrase/pattern you used in "example_eng" (because after parsing I want to underline used form on the client side)"
}

REQUIREMENTS:
1. Create ONE example sentence for English learners (BEGINNER Level - A1-A2)
3. As Ukrainian example as English example must sound native and natural - DO NOT translate word-by-word
4. Reference Cambridge, Oxford, Collins, or YouGlish for usage guidance.
5. If the input contains relevant translations - use them as translation examples and don't translate the word/phrase/pattern by yourself
6. Return ONLY valid JSON, no markdown, no explanations

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
        //model: "gpt-4o-mini", // швидкий // погана граматика
        //model: "gpt-4.1-mini", // трішки краща граматика
        model: GPTModel.GPT41Mini, // довго, але краща граматика

        //reasoning: { effort: "low" },
        temperature: 0.6,
        input,
    });

    let parsed;
    try {
        parsed = JSON.parse(response.output_text);
        console.log(response.usage);
    } catch (e) {
        throw new Error("OpenAI returned invalid JSON");
    }
    return parsed;
});

const TTSVoice = {
    Alloy: "alloy",
    Ash: "ash",
    Ballad: "ballad",
    Coral: "coral",
    Echo: "echo",
    Fable: "fable",
    Nova: "nova",
    Onyx: "onyx",
    Shimmer: "shimmer",
    Verse: "verse",
    Marin: "marin",
    Cedar: "cedar",
};

Object.freeze(TTSVoice);

const generateSpeech = createAsyncThunk("vocabularyWords/generateSpeech", async (text) => {
    const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: TTSVoice.Marin,
        input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    return url;
});

const generateSentenceCompletion = createAsyncThunk("vocabularyWords/generateSentenceCompletion", async (vocabularyWordMainParameters) => {
    const input = `Generate a sentence completion exercise for an English word/phrase/pattern.

INPUT:
- Word/phrase/pattern: "${vocabularyWordMainParameters.text}"
${vocabularyWordMainParameters.topic ? `- Topic: "${vocabularyWordMainParameters.topic}"` : ""}
${vocabularyWordMainParameters.relevant_translations ? `- Relevant translations: ${vocabularyWordMainParameters.relevant_translations}` : ""}

OUTPUT STRUCTURE:
{
    "audioSentence": "Complete English sentence with the word/phrase",
    "displaySentence": "Same sentence with ____ instead of the word/phrase",
    "sentenceTranslation": "Ukrainian translation of the complete sentence",
    "correctAnswer": "the exact word/phrase that was removed",
    "options": ["correctAnswer", "distractor1", "distractor2", "distractor3"],
    "hint": "optional hint in Ukrainian (only if needed)"
}

REQUIREMENTS:
1. Create a sentence for BEGINNER level (A1-A2) English learners
2. The sentence must sound natural and native-like
3. Generate 3 plausible distractors (wrong answers) that are similar in meaning or form
4. Shuffle the options array so correct answer is not always first
5. The displaySentence should have exactly one ____ where the word was removed
6. Reference Cambridge, Oxford, Collins, or YouGlish for usage guidance
7. Return ONLY valid JSON, no markdown, no explanations

EXAMPLE:

INPUT:
- Word/phrase/pattern: "pay for"

OUTPUT:
{
    "audioSentence": "I will pay for the apartment tomorrow",
    "displaySentence": "I will ____ the apartment tomorrow",
    "sentenceTranslation": "Я заплачу за квартиру завтра",
    "correctAnswer": "pay for",
    "options": ["pay for", "pay to", "pay at", "pay with"],
    "hint": null
}`;

    const response = await client.responses.create({
        model: GPTModel.GPT41Mini,
        temperature: 0.7,
        input,
    });

    let parsed;
    try {
        parsed = JSON.parse(response.output_text);
        console.log("Sentence completion generated:", response.usage);
    } catch (e) {
        throw new Error("OpenAI returned invalid JSON");
    }
    return parsed;
});

const generateListenAndFill = createAsyncThunk("vocabularyWords/generateListenAndFill", async (vocabularyWordMainParameters) => {
    const input = `Generate a listening comprehension exercise for an English word/phrase/pattern.

INPUT:
- Word/phrase/pattern: "${vocabularyWordMainParameters.text}"
${vocabularyWordMainParameters.topic ? `- Topic: "${vocabularyWordMainParameters.topic}"` : ""}
${vocabularyWordMainParameters.relevant_translations ? `- Relevant translations: ${vocabularyWordMainParameters.relevant_translations}` : ""}

OUTPUT STRUCTURE:
{
    "audioSentence": "Complete English sentence with the word/phrase",
    "displaySentence": "Same sentence with ____ instead of the word/phrase",
    "sentenceTranslation": "Ukrainian translation of the complete sentence",
    "correctForm": "the exact word/phrase/form that was used in the sentence",
    "hint": "optional hint in Ukrainian (only if needed)"
}

REQUIREMENTS:
1. Create a sentence for BEGINNER level (A1-A2) English learners
2. The sentence must sound natural and native-like
3. The displaySentence should have exactly one ____ where the word was removed
4. The correctForm should be the EXACT form used in the sentence (not the base form)
   - For example, if sentence uses "paid", correctForm should be "paid" not "pay"
   - If sentence uses "running", correctForm should be "running" not "run"
5. The sentence should be clear when heard (avoid ambiguous words that sound like others)
6. Reference Cambridge, Oxford, Collins, or YouGlish for usage guidance
7. Return ONLY valid JSON, no markdown, no explanations

EXAMPLE 1:

INPUT:
- Word/phrase/pattern: "pay for"

OUTPUT:
{
    "audioSentence": "I will pay for the apartment tomorrow",
    "displaySentence": "I will ____ the apartment tomorrow",
    "sentenceTranslation": "Я заплачу за квартиру завтра",
    "correctForm": "pay for",
    "hint": null
}

EXAMPLE 2:

INPUT:
- Word/phrase/pattern: "run"

OUTPUT:
{
    "audioSentence": "She runs every morning in the park",
    "displaySentence": "She ____ every morning in the park",
    "sentenceTranslation": "Вона бігає кожного ранку в парку",
    "correctForm": "runs",
    "hint": null
}`;

    const response = await client.responses.create({
        model: GPTModel.GPT41Mini,
        temperature: 0.7,
        input,
    });

    let parsed;
    try {
        parsed = JSON.parse(response.output_text);
        console.log("Listen and fill generated:", response.usage);
    } catch (e) {
        throw new Error("OpenAI returned invalid JSON");
    }
    return parsed;
});

export {
    addVocabularyWord,
    fetchVocabularyWords,
    updateVocabularyWord,
    generateExerciseVocabularyItem,
    generateSpeech,
    generateSentenceCompletion,
    generateListenAndFill,
};
