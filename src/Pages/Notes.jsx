"use client"
import { useLocation, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { useState, useEffect, useRef } from "react"

import Navbar from "../components/Navbar" // Adjust import path as needed

// Text-to-Speech component extracted outside of Notes component
function TextToSpeechButton({ textToRead }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTtsControls, setShowTtsControls] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  // References
  const utteranceRef = useRef(null);
  
  useEffect(() => {
    // Initialize speech synthesis and load available voices
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleRateChange = (e) => {
    setRate(parseFloat(e.target.value));
  };

  const handlePitchChange = (e) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    
    if (synth.speaking) {
      synth.cancel();
    }

    if (textToRead) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utteranceRef.current = utterance;
      
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      synth.speak(utterance);
    }
  };

  const togglePause = () => {
    const synth = window.speechSynthesis;
    
    if (synth.speaking) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    }
  };

  const stop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <>
      <button 
        onClick={() => setShowTtsControls(!showTtsControls)} 
        className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg flex-1 text-center"
      >
        Read Aloud
      </button>
      
      {showTtsControls && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3">Text to Speech Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="voice">
                Voice:
              </label>
              <select
                id="voice"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedVoice}
                onChange={handleVoiceChange}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="rate">
                Rate: {rate}
              </label>
              <input
                id="rate"
                type="range"
                className="w-full"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={handleRateChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="pitch">
                Pitch: {pitch}
              </label>
              <input
                id="pitch"
                type="range"
                className="w-full"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="volume">
                Volume: {volume}
              </label>
              <input
                id="volume"
                type="range"
                className="w-full"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
              onClick={speak}
              disabled={isSpeaking && !isPaused}
            >
              Speak
            </button>
            
            {isSpeaking && (
              <>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none"
                  onClick={togglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
                  onClick={stop}
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


function AccordionQuestion({ question }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch answer from Gemini API with proper error handling
  const fetchGeminiAnswer = async () => {
    if (answer) return; // Don't fetch if we already have an answer
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using a more reliable approach to access the API key
      let apiKey = 'AIzaSyA6j1QQ77ETh5v7ImpSCWT6ZCWVDlGnOSg';
      
      // Try to get the API key from environment variables
      try {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      } catch {
        console.warn("Couldn't access import.meta.env, using fallback key");
      }
      
      // If no API key from env, use fallback (not recommended for production)
      if (!apiKey) {
        apiKey = 'AIzaSyA6j1QQ77ETh5v7ImpSCWT6ZCWVDlGnOSg';
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please provide a clear and concise answer to this question: ${question}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);

      }
      
      const data = await response.json();
      
      // Extract the answer from the response with better error handling
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        setAnswer(data.candidates[0].content.parts[0].text);
      } else {
        console.error("Unexpected API response structure:", data);
        throw new Error("No valid answer found in API response");
      }
    } catch (err) {
      console.error("Error fetching answer from Gemini:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to get answer. Please try again later. " + err.message);
      }
      
      // Provide a fallback answer when the API fails
      setAnswer("I'm unable to generate an answer from the Gemini API right now. Here's a general response:\n\n" +
                "This would typically contain an answer to your question about the video content. " +
                "Please try again later when our AI service is available.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle accordion and fetch answer if needed
  const toggleAccordion = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState && !answer && !isLoading) {
      fetchGeminiAnswer();
    }
  };

  return (
    <div className="mt-6 bg-gray-200 rounded-lg overflow-hidden">
      {/* Accordion Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}
      >
        <div className="font-medium">{question}</div>
        <div className={`w-8 h-8 bg-red-100 rounded-full flex items-center justify-center transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span className="ml-2">Getting answer from Gemini...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 py-2">{error}</div>
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Notes = () => {
  const location = useLocation()
  const { transcript, notes, videoId } = location.state || {}
  const [parsedTranscript, setParsedTranscript] = useState([])
  const [parsedNotes, setParsedNotes] = useState([])
  const [showFullTranscript, setShowFullTranscript] = useState(false)
  const [questions, setQuestions] = useState([
  ]);

  useEffect(() => {
    // Parse transcript into timestamped lines
    if (transcript) {
      const lines = transcript.split("\n").filter((line) => line.trim() !== "")
      // Only show first 13 lines initially (matching the design)
      setParsedTranscript(lines)
    }
    
    // Parse notes into sections
    if (notes) {
      // Simple parsing logic - this can be enhanced based on your notes structure
      const sections = []
      let currentSection = null

      const lines = notes.split("\n")

      lines.forEach((line) => {
        // Check if line is a heading (starts with #)
        if (line.startsWith("# ")) {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = {
            id: sections.length + 1,
            title: line.replace("# ", ""),
            points: [],
          }
        } else if (line.startsWith("## ")) {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = {
            id: sections.length + 1,
            title: line.replace("## ", ""),
            points: [],
          }
        } else if (line.startsWith("- ") && currentSection) {
          currentSection.points.push(line.replace("- ", ""))
        } else if (line.trim() !== "" && currentSection) {
          // Add non-empty lines that aren't bullet points as regular text
          currentSection.points.push(line)
        }
      })

      if (currentSection) {
        sections.push(currentSection)
      }

      setParsedNotes(sections)
    }
  }, [transcript, notes])

  if (!transcript || !notes) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <p>No data available. Please go back and try again.</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  // Format transcript line with timestamp if available
  const formatTranscriptLine = (line) => {
    // Try to extract timestamp pattern like "00:00:00.000"
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})/)
    if (timeMatch) {
      const time = timeMatch[0]
      const text = line.replace(timeMatch[0], "").trim()
      return { time, text }
    }
    return { time: "", text: line }
  }

  // Get a limited number of transcript lines for display
  const displayTranscriptLines = showFullTranscript ? parsedTranscript : parsedTranscript.slice(0, 13)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto mt-14 flex flex-col md:flex-row gap-6 px-4">
        {/* Left Column - Video and Transcript */}
        <div className="md:w-1/3">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              ></iframe>
            ) : (
              <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                <div className="text-white">Video Unavailable</div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1"></div>
              </div>
            </div>
          </div>

          {/* Transcript Section */}
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <h3 className="font-bold">Transcript</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {displayTranscriptLines.map((line, index) => {
                const { time, text } = formatTranscriptLine(line)
                return (
                  <li key={index} className="text-sm">
                    {time && <span className="font-mono">{time}</span>}
                    <span className="ml-1">{text}</span>
                  </li>
                )
              })}
            </ul>
            <button
              className="mt-4 flex items-center text-gray-700"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
            >
              {showFullTranscript ? "Show Less" : "Read More"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Quiz Section */}
          <div className="mt-8 bg-white p-6 rounded-lg">
            <Link to={"/quiz"}>
              <h2 className="text-2xl font-bold">
                <span className="text-black">Play</span> <span className="text-gray-300">Quiz</span>
              </h2>
            </Link>
          </div>
        </div>

        {/* Right Column - Notes */}
        <div className="md:w-2/3 bg-gray-300 rounded-lg p-4">
          {/* Structured Notes */}
          {parsedNotes.length > 0 ? (
            parsedNotes.map((section) => (
              <div key={section.id} className="mb-6">
                <h3 className="font-bold mb-2">
                  {section.id}. {section.title}
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {section.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => {
                const element = document.createElement("a")
                const file = new Blob([notes], { type: "text/markdown" })
                element.href = URL.createObjectURL(file)
                element.download = "youtube_notes.md"
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex-1 text-center"
            >
              Download
            </button>
            
            {/* Text-to-Speech Button Component */}
            <TextToSpeechButton textToRead={notes} />
          </div>

          {/* AI-Powered Q&A Section */}
          <div className="mt-8">
            <h3 className="font-bold mb-4">Ask AI About This Content</h3>
            
            {/* Rendering accordion questions */}
            {questions.map((question, index) => (
              <AccordionQuestion 
                key={index} 
                question={question} 
              />
            ))}
            
            {/* Add custom question input */}
            <div className="mt-6">
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Ask your own question..."
                  className="flex-1 py-2 px-4 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setQuestions([...questions, e.target.value.trim()]);
                      e.target.value = '';
                    }
                  }}
                />
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg"
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    if (input.value.trim()) {
                      setQuestions([...questions, input.value.trim()]);
                      input.value = '';
                    }
                  }}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes