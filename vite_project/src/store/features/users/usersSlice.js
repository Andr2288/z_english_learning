// import { createSlice } from "@reduxjs/toolkit";
// import { addUser, fetchUsers, removeUser } from "./usersThunks";
//
// const usersSlice = createSlice({
//     name: "users",
//     initialState: {
//         data: [],
//     },
//     extraReducers(builder) {
//         builder.addCase(fetchUsers.fulfilled, (state, action) => {
//             state.data = action.payload;
//         });
//
//         builder.addCase(addUser.fulfilled, (state, action) => {
//             state.data.push(action.payload);
//         });
//
//         builder.addCase(removeUser.fulfilled, (state, action) => {
//             state.data = state.data.filter((user) => {
//                 return user.id !== action.payload.id;
//             });
//         });
//     },
// });
//
// export const usersReducer = usersSlice.reducer;
