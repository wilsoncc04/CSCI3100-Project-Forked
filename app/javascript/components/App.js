import React from "react";

export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#0066cc" }}>Rails + React (JSX only) 🚀</h1>
      
      <p>Created on {new Date().toLocaleDateString()}</p>

      <button
        onClick={() => alert("It works!")}
        style={{
          padding: "0.8rem 1.6rem",
          fontSize: "1.1rem",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Click me
      </button>
    </div>
  );
}