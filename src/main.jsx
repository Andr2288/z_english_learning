import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import { store } from "./store";

import { Provider } from "react-redux";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <BrowserRouter basename="/z_english_learning">
            <App />
        </BrowserRouter>
    </Provider>
);
