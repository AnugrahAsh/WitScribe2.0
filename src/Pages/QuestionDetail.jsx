"use client"

// QuestionDetail.jsx (Detail page for a single question)
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
      <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <nav className="bg-black text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link to="/home" className="text-xl font-bold hover:text-gray-300 transition-colors">
              WitScribe
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <nav className="bg-black text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Link to="/home" className="text-xl font-bold hover:text-gray-300 transition-colors">
              WitScribe
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <p>Question not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      <nav className="bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/home" className="text-xl font-bold hover:text-gray-300 transition-colors">
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
              <Link to="/profile" className="hover:opacity-80 transition-opacity">
                <img
                  src={currentUser?.photoURL || "https://i.pravatar.cc/32"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex flex-1 p-4 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <div className="flex-1 max-w-3xl mx-auto">
          <div className="mb-4">
            <Link to="/community" className="text-blue-500 hover:underline mb-4 inline-block">
              ← Back to Community
            </Link>

            <div
              className={`border rounded-lg p-4 mb-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={question.avatar || `https://i.pravatar.cc/100?u=${question.authorId || Math.random()}`}
                    alt={question.author}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{question.author}</span>
                  <span className="text-sm text-gray-500">
                    {question.createdAt?.toDate ? new Date(question.createdAt.toDate()).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                {currentUser && question.authorId === currentUser.uid && (
                  <button
                    onClick={handleDeleteQuestion}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                    title="Delete question"
                  >
                    Delete
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2">{question.title}</h2>
              {question.description && (
                <p className={`mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{question.description}</p>
              )}
              <div className="flex gap-4">
                <button onClick={handleLike} className="flex items-center gap-1 text-red-500">
                  {question.isLiked ? "❤" : "♡"} {question.likes || 0}
                </button>
                <span className="flex items-center gap-1">💬 {question.comments?.length || 0}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">Add Your Comment</h3>
              <form onSubmit={handleAddComment} className="bg-opacity-50 mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  className={`w-full p-3 rounded-lg mb-3 ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 focus:border-blue-500"
                      : "bg-white border-gray-200 focus:border-blue-500"
                  } border focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all`}
                  rows="3"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  disabled={!currentUser || !newComment.trim()}
                >
                  {currentUser ? "Post Comment" : "Sign in to Comment"}
                </button>
              </form>

              <h3 className="font-bold mb-3">Comments ({question.comments?.length || 0})</h3>
              <div className="space-y-3">
                {question.comments && question.comments.length > 0 ? (
                  question.comments.map((comment, idx) => (
                    <div
                      key={comment.id || idx}
                      className={`p-3 rounded-lg ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {currentUser && comment.authorId === currentUser.uid && (
                          <button
                            onClick={() => handleDeleteComment(idx)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-line">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-80 ml-4">
          <div
            className={`border rounded-lg p-4 sticky top-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-md`}
          >
            <h3 className="font-bold mb-3">Related Questions</h3>
            <div className="space-y-2">
              {relatedQuestions.map((q) => (
                <Link
                  key={q.id}
                  to={`/community/question/${q.id}`}
                  className="block hover:text-blue-500 transition-colors"
                >
                  {q.title}
                </Link>
              ))}
              {relatedQuestions.length === 0 && <p className="text-gray-500">No related questions found</p>}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
