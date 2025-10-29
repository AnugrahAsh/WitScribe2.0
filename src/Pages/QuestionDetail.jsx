"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { db } from "../firebase"
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot,
} from "firebase/firestore"
import { useAuth } from "../context/AuthContext"

export default function QuestionDetail() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [darkMode, setDarkMode] = useState(true)
  const [question, setQuestion] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [relatedQuestions, setRelatedQuestions] = useState([])

  // Fetch question with real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "questions", questionId),
      (doc) => {
        if (doc.exists()) {
          const questionData = {
            id: doc.id,
            ...doc.data(),
            isLiked: currentUser ? (doc.data().likedBy || []).includes(currentUser.uid) : false,
          }
          setQuestion(questionData)
          setLoading(false)
        } else {
          console.log("No such question!")
          navigate("/community")
        }
      },
      (error) => {
        console.error("Error fetching question:", error)
        setLoading(false)
      },
    )

    // Fetch related questions (not real-time)
    const fetchRelatedQuestions = async () => {
      try {
        const q = query(collection(db, "questions"), orderBy("likes", "desc"))

        const querySnapshot = await getDocs(q)
        const relatedData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((q) => q.id !== questionId)
          .slice(0, 5)

        setRelatedQuestions(relatedData)
      } catch (error) {
        console.error("Error fetching related questions:", error)
      }
    }

    fetchRelatedQuestions()

    return () => unsubscribe()
  }, [questionId, currentUser, navigate])

  const handleDeleteQuestion = async () => {
    if (!currentUser) {
      alert("Please sign in to delete this question")
      return
    }

    // Check if current user is the author of the question
    if (question.authorId !== currentUser.uid) {
      alert("You can only delete your own questions")
      return
    }

    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return
    }

    try {
      // Delete the question document
      await deleteDoc(doc(db, "questions", questionId))

      // Navigate back to community page
      navigate("/community")
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question. Please try again.")
    }
  }

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like")
      return
    }

    const userId = currentUser.uid
    const questionRef = doc(db, "questions", questionId)
    const isLiked = question.likedBy?.includes(userId)

    try {
      await updateDoc(questionRef, {
        likes: isLiked ? increment(-1) : increment(1),
        likedBy: isLiked ? question.likedBy.filter((uid) => uid !== userId) : [...(question.likedBy || []), userId],
      })
    } catch (error) {
      console.error("Error updating question like:", error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      alert("Please sign in to comment")
      return
    }

    if (!newComment.trim()) return

    try {
      const commentData = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        text: newComment,
        timestamp: new Date().toISOString(),
      }

      const questionRef = doc(db, "questions", questionId)

      // Add comment to the question document
      await updateDoc(questionRef, {
        comments: arrayUnion(commentData),
      })

      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Error adding comment. Please try again.")
    }
  }

  const handleDeleteComment = async (commentIndex) => {
    if (!currentUser) {
      alert("Please sign in to delete comments")
      return
    }

    const commentToDelete = question.comments[commentIndex]

    // Check if user is authorized to delete this comment
    if (commentToDelete.authorId !== currentUser.uid) {
      alert("You can only delete your own comments")
      return
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      // Remove the specific comment from Firestore using arrayRemove
      const questionRef = doc(db, "questions", questionId)
      await updateDoc(questionRef, {
        comments: arrayRemove(commentToDelete),
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
        <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link to="/home" className="text-xl font-bold hover:text-red-400 transition-colors">
              WitScribe
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-medium">Loading question...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
        <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link to="/home" className="text-xl font-bold hover:text-red-400 transition-colors">
              WitScribe
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">❓</div>
            <p className="text-xl font-semibold">Question not found</p>
            <Link
              to="/community"
              className="inline-block px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Back to Community
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/home" className="text-xl font-bold hover:text-red-400 transition-colors">
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
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              <Link to="/profile" className="hover:opacity-80 transition-opacity">
                <img
                  src={currentUser?.photoURL || "https://i.pravatar.cc/32"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white/20 hover:border-red-400 transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex p-6 gap-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
        <div className="flex-1 max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Community
            </Link>
          </div>

          {/* Question Card */}
          <div
            className={`rounded-2xl p-8 mb-8 shadow-xl border ${
              darkMode
                ? "border-gray-700/50 bg-gray-800/50 backdrop-blur-sm"
                : "border-gray-200/50 bg-white/80 backdrop-blur-sm"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={question.avatar || `https://i.pravatar.cc/100?u=${question.authorId || Math.random()}`}
                  alt={question.author}
                  className="w-12 h-12 rounded-full border-2 border-red-500/30"
                />
                <div>
                  <h3 className="font-semibold text-lg">{question.author}</h3>
                  <p className="text-sm text-gray-500">
                    {question.createdAt?.toDate ? new Date(question.createdAt.toDate()).toLocaleDateString() : "Recent"}
                  </p>
                </div>
              </div>
              {currentUser && question.authorId === currentUser.uid && (
                <button
                  onClick={handleDeleteQuestion}
                  className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
                  title="Delete question"
                >
                  Delete
                </button>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4 leading-tight">{question.title}</h1>
            {question.description && (
              <p className={`text-lg mb-6 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {question.description}
              </p>
            )}

            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                  question.isLiked
                    ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    : "text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                }`}
              >
                {question.isLiked ? "❤️" : "🤍"} {question.likes || 0}
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <span>💬</span>
                <span className="font-medium">{question.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>

          {/* Add Comment Section */}
          <div
            className={`rounded-2xl p-6 mb-8 shadow-lg border ${
              darkMode
                ? "border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
                : "border-gray-200/50 bg-white/60 backdrop-blur-sm"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Add Your Comment</h3>
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className={`w-full p-4 rounded-xl border-2 transition-all focus:ring-4 focus:ring-red-500/20 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-600 focus:border-red-500 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 focus:border-red-500 text-gray-900 placeholder-gray-500"
                }`}
                rows="4"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                disabled={!currentUser || !newComment.trim()}
              >
                {currentUser ? "Post Comment" : "Sign in to Comment"}
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div
            className={`rounded-2xl p-6 shadow-lg border ${
              darkMode
                ? "border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
                : "border-gray-200/50 bg-white/60 backdrop-blur-sm"
            }`}
          >
            <h3 className="text-xl font-bold mb-6">Comments ({question.comments?.length || 0})</h3>
            <div className="space-y-4">
              {question.comments && question.comments.length > 0 ? (
                question.comments.map((comment, idx) => (
                  <div
                    key={comment.id || idx}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                        : "bg-white/80 border-gray-200/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold">{comment.author}</span>
                          <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {currentUser && comment.authorId === currentUser.uid && (
                        <button
                          onClick={() => handleDeleteComment(idx)}
                          className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💭</div>
                  <p className="text-gray-500 text-lg">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80">
          <div
            className={`rounded-2xl p-6 shadow-lg border sticky top-24 ${
              darkMode
                ? "border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
                : "border-gray-200/50 bg-white/60 backdrop-blur-sm"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Related Questions</h3>
            <div className="space-y-3">
              {relatedQuestions.map((q) => (
                <Link
                  key={q.id}
                  to={`/community/question/${q.id}`}
                  className={`block p-3 rounded-xl transition-all hover:shadow-md ${
                    darkMode ? "hover:bg-gray-800/50 hover:text-red-400" : "hover:bg-white/80 hover:text-red-500"
                  }`}
                >
                  <p className="font-medium line-clamp-2">{q.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>❤️ {q.likes || 0}</span>
                    <span>💬 {q.comments?.length || 0}</span>
                  </div>
                </Link>
              ))}
              {relatedQuestions.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-gray-500">No related questions found</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
