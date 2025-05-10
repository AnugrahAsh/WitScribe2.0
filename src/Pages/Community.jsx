// Community.jsx (Main community page listing questions)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  increment,
  serverTimestamp
} from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: "", description: "" });
  const [search, setSearch] = useState("");
  const [commentInput, setCommentInput] = useState({});

  // Fetch questions in real-time
  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Check if current user has liked this question
        isLiked: currentUser ? (doc.data().likedBy || []).includes(currentUser.uid) : false
      }));
      setQuestions(questionData);
    });
    return unsubscribe;
  }, [currentUser]);

  // Add a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (newQuestion.title.trim() && currentUser) {
      try {
        const questionRef = await addDoc(collection(db, "questions"), {
          title: newQuestion.title,
          description: newQuestion.description,
          author: currentUser.displayName || currentUser.email,
          authorId: currentUser.uid,
          likes: 0,
          likedBy: [],
          comments: [],
          createdAt: serverTimestamp()
        });
        setNewQuestion({ title: "", description: "" });
        setIsModalOpen(false);
        // Navigate to the new question
        navigate(`/community/question/${questionRef.id}`);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  // Like/unlike a question
  const handleLike = async (question, e) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    e.stopPropagation(); // Stop event bubbling
    
    if (!currentUser) {
      alert("Please sign in to like questions");
      return;
    }
    
    const questionRef = doc(db, "questions", question.id);
    const userId = currentUser.uid;
    
    try {
      await updateDoc(questionRef, {
        likes: question.likedBy?.includes(userId) ? increment(-1) : increment(1),
        likedBy: question.likedBy?.includes(userId)
          ? question.likedBy.filter(u => u !== userId)
          : [...(question.likedBy || []), userId]
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Add a comment
  const handleAddComment = async (questionId, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (!currentUser) {
      alert("Please sign in to comment");
      return;
    }
    
    const comment = commentInput[questionId];
    if (!comment) return;
    
    const questionRef = doc(db, "questions", questionId);
    
    try {
      await updateDoc(questionRef, {
        comments: arrayUnion({
          author: currentUser.displayName || currentUser.email,
          authorId: currentUser.uid,
          text: comment,
          createdAt: new Date().toISOString()
        })
      });
      setCommentInput({ ...commentInput, [questionId]: "" });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Navigate to question detail when clicking a question
  const handleQuestionClick = (questionId) => {
    navigate(`/community/question/${questionId}`);
  };

  // Search questions
  const filteredQuestions = questions.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    (q.description && q.description.toLowerCase().includes(search.toLowerCase()))
  );

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
            <div className="max-w-md w-full">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for the topic and discussion"
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-500 border border-gray-200"
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-xl hover:opacity-75 transition-opacity"
                onClick={() => setIsModalOpen(true)}
              >➕</button>
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
          <h1 className="text-2xl font-bold mb-6">Community Questions</h1>
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div 
                key={question.id} 
                className={`border rounded-lg p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer`}
                onClick={() => handleQuestionClick(question.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{question.author}</span>
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-2 hover:text-red-500">{question.title}</h2>
                  {question.description && (
                    <p className="mb-3 text-gray-500">{question.description}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={(e) => handleLike(question, e)}
                    className="flex items-center gap-1 text-red-500"
                  >
                    {question.isLiked ? '❤' : '♡'} {question.likes || 0}
                  </button>
                  <span className="flex items-center gap-1">
                    💬 {question.comments?.length || 0}
                  </span>
                </div>
              </div>
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Ask a Question
                </button>
              </div>
            )}
          </div>
        </div>
        <aside className="hidden lg:block w-80 ml-4">
          <div className={`border rounded-lg p-4 sticky top-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="font-bold mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">React</span>
              <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">JavaScript</span>
              <span className="px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">WebSockets</span>
              <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">API</span>
              <span className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded">Frontend</span>
            </div>
          </div>
        </aside>
      </main>
      
      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ask a Question</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddQuestion}>
              <div className="mb-4">
                <label className="block mb-2">Question Title</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200"
                  placeholder="Enter your question title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description (Optional)</label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200"
                  placeholder="Add more details to your question"
                  rows="4"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  disabled={!newQuestion.title.trim() || !currentUser}
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
