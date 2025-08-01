import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);

  const generateText = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/generate?prompt=${encodeURIComponent(prompt)}`
      );
      const data = await response.json();
      setGeneratedText(data.generated_text);
    } catch (error) {
      console.error("Error generating text:", error);
      setGeneratedText("Error generating text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Text Generator</h1>
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={4}
          className="prompt-input"
        />
        <button
          onClick={generateText}
          disabled={loading || !prompt.trim()}
          className="generate-btn"
        >
          {loading ? "Generating..." : "Generate Text"}
        </button>
      </div>

      {generatedText && (
        <div className="output-section">
          <h3>Generated Text:</h3>
          <div className="generated-text">{generatedText}</div>
        </div>
      )}
    </div>
  );
}

export default App;
