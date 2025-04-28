import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizIllustration from '../assets/quiz-illustration.webp';
import Navbar from '../Components/Navbar';

const GEMINI_API_KEY = "AIzaSyA6j1QQ77ETh5v7ImpSCWT6ZCWVDlGnOSg";

export default function Quiz1() {
  const [quizTopic, setQuizTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;

    setLoading(true);
    try {
      const prompt = `Generate a multiple choice quiz with 20 medium-difficulty questions about "${quizTopic}". Each question should include:
- question text
- 4 options (A, B, C, D)
- correct answer letter

Respond in JSON format like:
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Paris", "Madrid", "Rome"],
    "answer": "B"
  }
]`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        }
      );

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let quizData = [];
try {
  const jsonStart = rawText.indexOf("[");
  const jsonEnd = rawText.lastIndexOf("]");
  const extractedJson = rawText.slice(jsonStart, jsonEnd + 1);
  quizData = JSON.parse(extractedJson);
} catch (err) {
  console.error("Failed to parse quiz JSON:", err);
  alert("Could not parse quiz questions from Gemini. Try again.");
  setLoading(false);
  return;
}


      navigate("/playquiz", { state: { quizData, topic: quizTopic.trim() } });
    } catch (err) {
      console.error("Gemini API Error:", err);
      alert("Something went wrong while generating the quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="pt-16 px-4">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-2 text-black">Quiz Time !!</h1>
              <p className="text-lg text-gray-600 mt-4">
                Type a topic, hit play, and let's find out if you're a genius... or just confidently wrong!
              </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-xl relative mb-16 mx-auto">
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="Enter topic for your quiz"
                className="w-full px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-gray-600 text-red-500"
              >
                {loading ? "..." : "→"}
              </button>
            </form>
          </div>

          <div className="flex-1 bg-black">
            <div className="max-w-screen-xl mx-auto px-4 flex justify-center items-start">
              <div className="w-full max-w-3xl">
                <img
                  src={quizIllustration}
                  alt="Quiz Illustration"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '450px' }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
