import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import IndexPage from "./pages/IndexPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h1 style={{ color: "#0066cc" }}>Rails + React (Router) 🚀</h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ color: "#0066cc", textDecoration: "none" }}>
              Home
            </Link>
            <Link to="/about" style={{ color: "#0066cc", textDecoration: "none" }}>
              About
            </Link>
            <Link to="/index" style={{ color: "#0066cc", textDecoration: "none" }}>
              Index
            </Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/index" element={<IndexPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}