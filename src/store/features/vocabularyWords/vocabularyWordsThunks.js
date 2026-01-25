import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.API_URL;

const fetchVocabularyWords = createAsyncThunk(
    "vocabularyWords/fetch",
    async () => {
        const response = await axios.get(`${API_URL}/vocabularyWords`);

        return response.data;
    }
);

export { fetchVocabularyWords };
