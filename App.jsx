import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PurpleButton({ children, ...props }) {
  return (
    <button className="btn" {...props}>
      {children}
    </button>
  );
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [explanation, setExplanation] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentTopics, setRecentTopics] = useState([]);
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState("");
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  const resultRef = useRef(null);

  // ---------- Load localStorage ----------
  useEffect(() => {
    setRecentTopics(JSON.parse(localStorage.getItem("recentTopics") || "[]"));
    setSessions(JSON.parse(localStorage.getItem("sessions") || "{}"));
    setActiveSession(localStorage.getItem("activeSession") || null);
  }, []);

  // ---------- Persist to localStorage ----------
  useEffect(() => {
    localStorage.setItem("recentTopics", JSON.stringify(recentTopics));
  }, [recentTopics]);
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    if (activeSession) localStorage.setItem("activeSession", activeSession);
  }, [activeSession]);

  // ---------- Scroll to results ----------
  useEffect(() => {
    if (resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" });
  }, [explanation, quiz]);

  // ---------- Core logic ----------
  async function handleExplainAndQuiz() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setDisplayedText("");
    try {
      const explainRes = await axios.post(`${apiBase}/api/explain`, { topic, level });
      const text = explainRes.data.explanation || "No explanation available.";
      runTypewriter(text);

      const quizRes = await axios.post(`${apiBase}/api/quiz`, {
        topic,
        num_questions: 5,
      });
      let qData = quizRes.data.questions || quizRes.data;
      if (!Array.isArray(qData)) qData = [];
      setQuiz(qData);

      const newSession = {
        topic,
        level,
        explanation: text,
        quiz: qData,
      };
      setSessions((prev) => ({ ...prev, [topic]: newSession }));
      setActiveSession(topic);

      const updated = [topic, ...recentTopics.filter((t) => t !== topic)].slice(0, 5);
      setRecentTopics(updated);
    } catch (e) {
      console.error("Fetch error:", e);
      setError(e.response?.data?.detail || e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function runTypewriter(text) {
    setExplanation(text);
    const words = text.split(" ");
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (i < words.length) {
        setDisplayedText((prev) => prev + words[i] + " ");
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
  }

  function handleAnswerClick(qIndex, option) {
    setQuiz((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, selected: option } : q
      )
    );
  }

  function handleSessionSelect(name) {
    const s = sessions[name];
    if (!s) return;
    setActiveSession(name);
    setTopic(s.topic);
    setLevel(s.level);
    setExplanation(s.explanation);
    setDisplayedText(s.explanation);
    setQuiz(s.quiz);
  }

  function handleNewSession() {
    setTopic("");
    setLevel("beginner");
    setExplanation("");
    setDisplayedText("");
    setQuiz([]);
    setActiveSession(null);
  }

  function deleteSession(name) {
    const updated = { ...sessions };
    delete updated[name];
    setSessions(updated);
    if (activeSession === name) handleNewSession();
  }

  function deleteAllSessions() {
    setSessions({});
    handleNewSession();
  }

  return (
    <div
      className="page"
      onKeyDown={(e) => e.key === "Enter" && handleExplainAndQuiz()}
      tabIndex={0}
    >
      <header className="hero text-center py-6">
        <h1 className="text-5xl font-extrabold text-purple-500 tracking-tight">
          🐙 OctoLearn
        </h1>
      </header>

      {/* Session Tabs */}
      {Object.keys(sessions).length > 0 && (
        <div className="session-tabs">
          {Object.keys(sessions).map((name) => (
            <div key={name} className="session-wrapper">
              <button
                className={`session-tab ${activeSession === name ? "active" : ""}`}
                onClick={() => handleSessionSelect(name)}
              >
                {name}
              </button>
              <button
                className="session-delete"
                onClick={() => deleteSession(name)}
                title={`Delete ${name}`}
              >
                ✖
              </button>
            </div>
          ))}
          <button className="session-tab new" onClick={handleNewSession}>
            ➕ New
          </button>
        </div>
      )}

      <main className="card">
        <div className="controls">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type a topic (e.g., Photosynthesis)"
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <div className="buttons">
            <PurpleButton onClick={handleExplainAndQuiz} disabled={!topic || loading}>
              {loading ? "Thinking..." : "Learn 🪄"}
            </PurpleButton>
          </div>

          {recentTopics.length > 0 && (
            <div className="recent">
              {recentTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="recent-btn"
                  title={`Revisit: ${t}`}
                >
                  {t}
                </button>
              ))}
              <button
                className="recent-btn clear-btn"
                title="Clear all recent topics"
                onClick={() => {
                  localStorage.removeItem("recentTopics");
                  setRecentTopics([]);
                }}
              >
                🧹 Clear
              </button>
              <button
                className="recent-btn clear-btn"
                title="Delete all sessions"
                onClick={deleteAllSessions}
              >
                🗑️ Delete All Sessions
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}

        <section className="results" ref={resultRef}>
          <div className="panel">
            <h2>Explanation</h2>
            <div className="output">
              {displayedText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayedText}
                </ReactMarkdown>
              ) : (
                <em>Ask for an explanation to see results.</em>
              )}
            </div>
          </div>

          <div className="panel">
            <h2>Quiz</h2>
            {Array.isArray(quiz) && quiz.length > 0 ? (
              <ol className="quiz-list">
                {quiz.map((q, i) => (
                  <li key={i}>
                    <div className="q">{q.question}</div>
                    <ul className="opts">
                      {q.options &&
                        q.options.map((o, j) => {
                          const selected = q.selected === o;
                          const correct = o === q.answer;
                          let cls = "opt";
                          if (selected) cls += correct ? " correct" : " wrong";
                          return (
                            <li
                              key={j}
                              className={cls}
                              onClick={() => handleAnswerClick(i, o)}
                            >
                              {String.fromCharCode(65 + j)}. {o}
                            </li>
                          );
                        })}
                    </ul>
                    {q.selected && (
                      <div className="answer-expl">
                        <strong>{q.answer}</strong> — {q.explanation}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <em>
                {loading
                  ? "Loading quiz..."
                  : "Couldn’t load quiz questions. Try again."}
              </em>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

