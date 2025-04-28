// QuestionDetail.jsx (Detail page for a single question)
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const initialAnswers = [
  {
    id: 1,
    questionId: 1, // This links the answer to question #1
    name: "Sohil Neema",
    avatar: "https://i.pravatar.cc/100?u=sohil",
    text: "WebSocket is a communication protocol that allows two-way, real-time communication between a client (like a browser) and a server.",
    likes: 30,
    comments: [],
    isLiked: false,
  },
  {
    id: 2,
    questionId: 1,
    name: "Neha Singh",
    avatar: "https://i.pravatar.cc/100?u=neha",
    text: 'WebSocket is a web technology that creates a persistent connection between the client and server.\nIt allows real-time, two-way communication without repeatedly refreshing the page.\nWebSocket is perfect for apps that need instant updates, like chats or live scores.\nIt starts with an HTTP handshake, then upgrades to a faster WebSocket connection.\nWebSocket helps reduce delay (latency) in sending and receiving data.',
    likes: 325,
    comments: [],
    isLiked: false,
  },
  {
    id: 3,
    questionId: 1,
    name: "Chetan Jain",
    avatar: "https://i.pravatar.cc/100?u=chetan",
    text: "WebSocket is a protocol that allows a continuous, two-way communication between a client (like a web browser) and a server. Unlike normal HTTP requests that open and close connections each time, WebSocket keeps the connection open so data can be sent and received instantly in real time.",
    likes: 19,
    comments: [],
    isLiked: false,
  },
  {
    id: 4,
    questionId: 1,
    name: "Suman Negi",
    avatar: "https://i.pravatar.cc/100?u=suman",
    text: "WebSocket maintains a single open connection that can send data in both directions.",
    likes: 0,
    comments: [],
    isLiked: false,
  },
  // Add sample answers for other questions
  {
    id: 5,
    questionId: 2, // This links the answer to question #2
    name: "Arjun Kumar",
    avatar: "https://i.pravatar.cc/100?u=arjun",
    text: "Redux is a state management library that helps you manage application state in a predictable way. It's particularly useful for complex React applications with many components that need to share state.",
    likes: 15,
    comments: [],
    isLiked: false,
  }
];

const initialQuestions = [
  {
    id: 1,
    author: "Kertii",
    title: "What is WebSocket?",
    likes: 23,
    comments: [],
    isLiked: false
  },
  {
    id: 2,
    author: "Anugrah",
    title: "How to implement Redux in React?",
    likes: 15,
    comments: [],
    isLiked: false
  },
  {
    id: 3,
    author: "Priya",
    title: "Difference between useState and useReducer?",
    likes: 8,
    comments: [],
    isLiked: false
  }
];

export default function QuestionDetail() {
  const { questionId } = useParams();
  const [darkMode, setDarkMode] = useState(true);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");

  // Simulate fetching question and answers
  useEffect(() => {
    // Find the question by ID
    const foundQuestion = initialQuestions.find(q => q.id === parseInt(questionId));
    setQuestion(foundQuestion || null);
    
    // Find answers for this question
    const questionAnswers = initialAnswers.filter(a => a.questionId === parseInt(questionId));
    setAnswers(questionAnswers);
  }, [questionId]);

  const handleLike = (type, id) => {
    if (type === 'question') {
      setQuestion(prev => ({
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked
      }));
    } else {
      setAnswers(answers.map(a => {
        if (a.id === id) {
          return {
            ...a,
            likes: a.isLiked ? a.likes - 1 : a.likes + 1,
            isLiked: !a.isLiked
          };
        }
        return a;
      }));
    }
  };

  const handleComment = () => {
    if (!newComment.trim()) return;

    if (selectedItem.type === 'question') {
      setQuestion(prev => ({
        ...prev,
        comments: [...prev.comments, {
          id: prev.comments.length + 1,
          author: "User",
          text: newComment,
          timestamp: new Date().toISOString()
        }]
      }));
    } else {
      setAnswers(answers.map(a => {
        if (a.id === selectedItem.id) {
          return {
            ...a,
            comments: [...a.comments, {
              id: a.comments.length + 1,
              author: "User",
              text: newComment,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return a;
      }));
    }

    setNewComment("");
    setIsCommentModalOpen(false);
  };

  const openCommentModal = (type, id) => {
    setSelectedItem({ type, id });
    setIsCommentModalOpen(true);
  };

  const handleAddAnswer = (e) => {
    e.preventDefault();
    if (newAnswer.trim()) {
      const newAnswerObj = {
        id: Math.max(...answers.map(a => a.id), 0) + 1,
        questionId: parseInt(questionId),
        name: "User",
        avatar: "https://i.pravatar.cc/100?u=user",
        text: newAnswer,
        likes: 0,
        comments: [],
        isLiked: false
      };
      
      setAnswers([...answers, newAnswerObj]);
      setNewAnswer("");
    }
  };

  if (!question) {
    return (
      <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <nav className="bg-black text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link 
              to="/home" 
              className="text-xl font-bold hover:text-gray-300 transition-colors"
            >
              WitScribe
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <p>Question not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <nav className="bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link 
            to="/home" 
            className="text-xl font-bold hover:text-gray-300 transition-colors"
          >
            WitScribe
          </Link>
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
              <Link 
                to="/profile" 
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://i.pravatar.cc/32"
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex flex-1 p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <div className="flex-1 max-w-3xl mx-auto">
          <div className="mb-4">
            <Link to="/community" className="text-blue-500 hover:underline mb-4 inline-block">
              ← Back to Community
            </Link>
            
            <div className={`border rounded-lg p-4 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{question.author}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{question.title}</h2>
              {question.description && (
                <p className="mb-3 text-gray-500">{question.description}</p>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={() => handleLike('question', question.id)}
                  className="flex items-center gap-1 text-red-500"
                >
                  {question.isLiked ? '❤' : '♡'} {question.likes}
                </button>
                <button 
                  onClick={() => openCommentModal('question', question.id)}
                  className="flex items-center gap-1"
                >
                  💬 {question.comments.length}
                </button>
              </div>
              {question.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {question.comments.map(comment => (
                    <div key={comment.id} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-red-500 text-lg font-bold mb-4">{answers.length} Answers:</h3>
            <div className="space-y-4">
              {answers.map((answer) => (
                <div key={answer.id} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={answer.avatar}
                      alt={answer.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{answer.name}</span>
                  </div>
                  <p className="mb-3 whitespace-pre-line">{answer.text}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleLike('answer', answer.id)}
                      className="flex items-center gap-1 text-red-500"
                    >
                      {answer.isLiked ? '❤' : '♡'} {answer.likes}
                    </button>
                    <button 
                      onClick={() => openCommentModal('answer', answer.id)}
                      className="flex items-center gap-1"
                    >
                      💬 {answer.comments.length}
                    </button>
                  </div>
                  {answer.comments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {answer.comments.map(comment => (
                        <div key={comment.id} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Your Answer Section */}
            <div className={`mt-8 border rounded-lg p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-3">Your Answer</h3>
              <form onSubmit={handleAddAnswer}>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200"
                  placeholder="Write your answer..."
                  rows="5"
                  required
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    disabled={!newAnswer.trim()}
                  >
                    Post Your Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-80 ml-4">
          <div className={`border rounded-lg p-4 sticky top-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="font-bold mb-3">Related Questions</h3>
            <ul className="space-y-2">
              {initialQuestions.filter(q => q.id !== parseInt(questionId)).map(q => (
                <li key={q.id}>
                  <Link 
                    to={`/community/question/${q.id}`}
                    className="block hover:text-red-500 transition-colors"
                  >
                    {q.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Comment</h2>
              <button 
                onClick={() => setIsCommentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200"
                placeholder="Write your comment..."
                rows="4"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                disabled={!newComment.trim()}
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}