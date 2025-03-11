/**
 * index.js
 * - Global Axios interceptor
 * - DarkModeProvider wraps entire app
 * - Minimal UI changes here, just ensuring readiness
 */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; 
import { DarkModeProvider } from "./DarkModeContext"; 
import axios from "axios"; 
import { getAuthToken } from "./Auth";


axios.defaults.baseURL = "http://127.0.0.1:8000/api/";
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DarkModeProvider> 
      <App />
    </DarkModeProvider>
  </React.StrictMode>
);

reportWebVitals();
