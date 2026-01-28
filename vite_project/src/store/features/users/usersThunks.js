// import { createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
//
// import { faker } from "@faker-js/faker";
//
// const API_URL = process.env.API_URL;
//
// const addUser = createAsyncThunk("users/add", async () => {
//     const response = await axios.post(`${API_URL}/users`, {
//         name: faker.name.fullName(),
//     });
//
//     return response.data;
// });
//
// const fetchUsers = createAsyncThunk("users/fetch", async () => {
//     const response = await axios.get(`${API_URL}/users`);
//
//     return response.data;
// });
//
// const removeUser = createAsyncThunk("users/remove", async (user) => {
//     await axios.delete(`${API_URL}/users/${user.id}`);
//
//     return user;
// });
//
// export { addUser, fetchUsers, removeUser };
