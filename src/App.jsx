import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/common/Navbar.jsx";

import {
    LoginPage,
    SignUpPage,
    HomePage,
    PracticePage,
    ProfilePage,
    SettingsPage,
} from "./pages/index.js";

import {
    TranslateSentenceExercise,
    FillTheGapExercise,
    ListenAndFillTheGapExercise,
} from "./components/exercises/index.js";

import { useState } from "react";

function App() {
    const [authUser, setAuthUser] = useState(true);

    return (
        <div>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/practice"
                    element={
                        authUser ? <PracticePage /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/settings"
                    element={
                        authUser ? <SettingsPage /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/profile"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                />

                <Route
                    path="/practice/translate-sentence"
                    element={
                        authUser ? (
                            <TranslateSentenceExercise />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/practice/fill-the-gap"
                    element={
                        authUser ? (
                            <FillTheGapExercise />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/practice/listen-and-fill"
                    element={
                        authUser ? (
                            <ListenAndFillTheGapExercise />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </div>

        // <div className="max-w-full min-h-screen container flex items-center justify-center mx-auto bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100">
        //     <ListenAndFillTheGapExercise></ListenAndFillTheGapExercise>
        // </div>
    );
}

export default App;
