"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { db } from "../firebase"
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
  serverTimestamp,
} from "firebase/firestore"
import { useAuth } from "../context/AuthContext"

export default function Community() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [darkMode, setDarkMode] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({ title: "", description: "" })
  const [search, setSearch] = useState("")
  const [commentInput, setCommentInput] = useState({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Fetch questions in real-time
  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Check if current user has liked this question
        isLiked: currentUser ? (doc.data().likedBy || []).includes(currentUser.uid) : false,
      }))
      setQuestions(questionData)
    })
    return unsubscribe
  }, [currentUser])

  // Reset mobile UI states when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
        setShowMobileSearch(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Add a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault()
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
          createdAt: serverTimestamp(),
        })
        setNewQuestion({ title: "", description: "" })
        setIsModalOpen(false)
        // Navigate to the new question
        navigate(`/community/question/${questionRef.id}`)
      } catch (error) {
        console.error("Error adding question:", error)
      }
    }
  }

  // Like/unlike a question
  const handleLike = async (question, e) => {
    e.preventDefault() // Prevent navigation when clicking like button
    e.stopPropagation() // Stop event bubbling

    if (!currentUser) {
      alert("Please sign in to like questions")
      return
    }

    const questionRef = doc(db, "questions", question.id)
    const userId = currentUser.uid

    try {
      await updateDoc(questionRef, {
        likes: question.likedBy?.includes(userId) ? increment(-1) : increment(1),
        likedBy: question.likedBy?.includes(userId)
          ? question.likedBy.filter((u) => u !== userId)
          : [...(question.likedBy || []), userId],
      })
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  // Add a comment
  const handleAddComment = async (questionId, e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling

    if (!currentUser) {
      alert("Please sign in to comment")
      return
    }

    const comment = commentInput[questionId]
    if (!comment) return

    const questionRef = doc(db, "questions", questionId)

    try {
      await updateDoc(questionRef, {
        comments: arrayUnion({
          author: currentUser.displayName || currentUser.email,
          authorId: currentUser.uid,
          text: comment,
          createdAt: new Date().toISOString(),
        }),
      })
      setCommentInput({ ...commentInput, [questionId]: "" })
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // Navigate to question detail when clicking a question
  const handleQuestionClick = (questionId) => {
    navigate(`/community/question/${questionId}`)
  }

  // Search questions
  const filteredQuestions = questions.filter(
    (q) =>
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase())),
  )

  // Toggle mobile search
  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch)
    setMobileMenuOpen(false)
    if (!showMobileSearch) {
      setTimeout(() => {
        document.getElementById("mobile-search-input")?.focus()
      }, 100)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-3 px-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="font-bold hover:text-red-400 transition-colors text-xl z-10">
            WitScribe
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block md:w-80 mx-6">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full px-4 py-2 pl-10 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 border border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">🔍</div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-xl"
              onClick={() => setIsModalOpen(true)}
              title="Ask a question"
            >
              ➕
            </button>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <Link to="/profile" className="hover:opacity-80 transition-opacity">
              <img
                src="https://i.pravatar.cc/32"
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white/20 hover:border-red-400 transition-colors"
              />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-3 md:hidden">
            {!showMobileSearch && (
              <>
                <button onClick={toggleMobileSearch} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  🔍
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ➕
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? "✕" : "☰"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="mt-3 flex items-center md:hidden">
            <button onClick={toggleMobileSearch} className="mr-3 p-1 hover:bg-white/10 rounded transition-colors">
              ←
            </button>
            <div className="flex-1 relative">
              <input
                id="mobile-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full px-4 py-2 pl-10 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 border border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">🔍</div>
            </div>
            <button onClick={toggleMobileSearch} className="ml-3 p-1 hover:bg-white/10 rounded transition-colors">
              ✕
            </button>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 z-20 border-t border-gray-700 md:hidden shadow-xl">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src="https://i.pravatar.cc/32" alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Community Questions</h1>
            <p className="text-gray-500 text-lg">Ask questions, share knowledge, and learn together</p>
          </div>

          <div className="space-y-6">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className={`group rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${
                  darkMode
                    ? "border-gray-700/50 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70"
                    : "border-gray-200/50 bg-white/80 backdrop-blur-sm hover:bg-white"
                }`}
                onClick={() => handleQuestionClick(question.id)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={`https://i.pravatar.cc/100?u=${question.authorId || Math.random()}`}
                    alt={question.author}
                    className="w-12 h-12 rounded-full border-2 border-red-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{question.author}</span>
                      <span className="text-sm text-gray-500">
                        {question.createdAt?.toDate
                          ? new Date(question.createdAt.toDate()).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors leading-tight">
                      {question.title}
                    </h2>
                    {question.description && (
                      <p className="text-gray-500 mb-4 line-clamp-2 leading-relaxed">{question.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={(e) => handleLike(question, e)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                      question.isLiked
                        ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    {question.isLiked ? "❤️" : "🤍"} {question.likes || 0}
                  </button>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>💬</span>
                    <span className="font-medium">{question.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-xl text-gray-500 mb-6">No questions found</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Ask the First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-lg rounded-2xl p-8 shadow-2xl border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Ask a Question</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Question Title</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-red-500/20 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 focus:border-red-500 text-white"
                      : "bg-white border-gray-300 focus:border-red-500 text-gray-900"
                  }`}
                  placeholder="What's your question?"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Description (Optional)</label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 focus:ring-red-500/20 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 focus:border-red-500 text-white"
                      : "bg-white border-gray-300 focus:border-red-500 text-gray-900"
                  }`}
                  placeholder="Add more details to help others understand your question better"
                  rows="4"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
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
  )
}
