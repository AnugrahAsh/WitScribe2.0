// QuestionDetail.jsx (Detail page for a single question)
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  increment,
  serverTimestamp
} from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

export default function QuestionDetail() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  // Fetch question and its answers
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      try {
        setLoading(true);
        // Fetch question
        const questionRef = doc(db, "questions", questionId);
        const questionDoc = await getDoc(questionRef);
        
        if (questionDoc.exists()) {
          const questionData = {
            id: questionDoc.id,
            ...questionDoc.data(),
            isLiked: currentUser ? 
              (questionDoc.data().likedBy || []).includes(currentUser.uid) : false
          };
          setQuestion(questionData);
          
          // Fetch answers
          const answersQuery = query(
            collection(db, "answers"),
            where("questionId", "==", questionId),
            orderBy("likes", "desc")
          );
          
          const answersSnapshot = await getDocs(answersQuery);
          const answersData = answersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isLiked: currentUser ? 
              (doc.data().likedBy || []).includes(currentUser.uid) : false
          }));
          
          setAnswers(answersData);
          
          // Fetch related questions
          const relatedQuery = query(
            collection(db, "questions"),
            where("id", "!=", questionId),
            orderBy("likes", "desc")
          );
          
          try {
            const relatedSnapshot = await getDocs(relatedQuery);
            const relatedData = relatedSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .slice(0, 5); // Limit to 5 related questions
            setRelatedQuestions(relatedData);
          } catch (error) {
            console.error("Error fetching related questions:", error);
            // If we can't query for related questions, use this approach instead
            const allQuestionsQuery = query(collection(db, "questions"), orderBy("createdAt", "desc"));
            const allQuestionsSnapshot = await getDocs(allQuestionsQuery);
            const allQuestionsData = allQuestionsSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(q => q.id !== questionId)
              .slice(0, 5);
            setRelatedQuestions(allQuestionsData);
          }
        } else {
          console.log("No such question!");
          navigate("/community");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestionAndAnswers();
    }
  }, [questionId, currentUser, navigate]);

  const handleDeleteQuestion = async () => {
    if (!currentUser) {
      alert("Please sign in to delete this question");
      return;
    }
    
    // Check if current user is the author of the question
    if (question.authorId !== currentUser.uid) {
      alert("You can only delete your own questions");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete the question document
      await deleteDoc(doc(db, "questions", questionId));
      
      // Delete all answers associated with this question
      const answersToDelete = query(
        collection(db, "answers"),
        where("questionId", "==", questionId)
      );
      
      const answersSnapshot = await getDocs(answersToDelete);
      const deletePromises = answersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Navigate back to community page
      navigate("/community");
      
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  const handleLike = async (type, id) => {
    if (!currentUser) {
      alert("Please sign in to like");
      return;
    }

    const userId = currentUser.uid;
    
    if (type === 'question') {
      const questionRef = doc(db, "questions", id);
      const isLiked = question.likedBy?.includes(userId);
      
      try {
        await updateDoc(questionRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked
            ? question.likedBy.filter(uid => uid !== userId)
            : [...(question.likedBy || []), userId]
        });
        
        // Update local state
        setQuestion(prev => ({
          ...prev,
          likes: isLiked ? (prev.likes - 1) : (prev.likes + 1),
          likedBy: isLiked
            ? prev.likedBy.filter(uid => uid !== userId)
            : [...(prev.likedBy || []), userId],
          isLiked: !isLiked
        }));
      } catch (error) {
        console.error("Error updating question like:", error);
      }
    } else if (type === 'answer') {
      const answerRef = doc(db, "answers", id);
      const answer = answers.find(a => a.id === id);
      const isLiked = answer.likedBy?.includes(userId);
      
      try {
        await updateDoc(answerRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked
            ? answer.likedBy.filter(uid => uid !== userId)
            : [...(answer.likedBy || []), userId]
        });
        
        // Update local state
        setAnswers(prev => prev.map(a => {
          if (a.id === id) {
            return {
              ...a,
              likes: isLiked ? (a.likes - 1) : (a.likes + 1),
              likedBy: isLiked
                ? a.likedBy.filter(uid => uid !== userId)
                : [...(a.likedBy || []), userId],
              isLiked: !isLiked
            };
          }
          return a;
        }));
      } catch (error) {
        console.error("Error updating answer like:", error);
      }
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      alert("Please sign in to comment");
      return;
    }
    
    if (!newComment.trim()) return;

    try {
      const commentData = {
        id: Math.random().toString(), // Generate a client-side ID for easier reference
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        text: newComment,
        timestamp: new Date().toISOString()
      };

      if (selectedItem.type === 'question') {
        const questionRef = doc(db, "questions", question.id);
        await updateDoc(questionRef, {
          comments: arrayUnion(commentData)
        });
        
        // Update local state
        setQuestion(prev => ({
          ...prev,
          comments: [...(prev.comments || []), commentData]
        }));
      } else if (selectedItem.type === 'answer') {
        const answerRef = doc(db, "answers", selectedItem.id);
        await updateDoc(answerRef, {
          comments: arrayUnion(commentData)
        });
        
        // Update local state
        setAnswers(prev => prev.map(a => {
          if (a.id === selectedItem.id) {
            return {
              ...a,
              comments: [...(a.comments || []), commentData]
            };
          }
          return a;
        }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }

    setNewComment("");
    setIsCommentModalOpen(false);
  };
  
  const handleDeleteComment = async (type, itemId, commentIndex) => {
    if (!currentUser) {
      alert("Please sign in to delete comments");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      if (type === 'question') {
        // Create a new array without the comment to be deleted
        const updatedComments = [...question.comments];
        updatedComments.splice(commentIndex, 1);
        
        // Update Firestore
        const questionRef = doc(db, "questions", question.id);
        await updateDoc(questionRef, {
          comments: updatedComments
        });
        
        // Update local state
        setQuestion(prev => ({
          ...prev,
          comments: updatedComments
        }));
      } else if (type === 'answer') {
        const answer = answers.find(a => a.id === itemId);
        if (!answer) return;
        
        // Create a new array without the comment to be deleted
        const updatedComments = [...answer.comments];
        updatedComments.splice(commentIndex, 1);
        
        // Update Firestore
        const answerRef = doc(db, "answers", itemId);
        await updateDoc(answerRef, {
          comments: updatedComments
        });
        
        // Update local state
        setAnswers(prev => prev.map(a => {
          if (a.id === itemId) {
            return {
              ...a,
              comments: updatedComments
            };
          }
          return a;
        }));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const openCommentModal = (type, id) => {
    if (!currentUser) {
      alert("Please sign in to comment");
      return;
    }
    setSelectedItem({ type, id });
    setIsCommentModalOpen(true);
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please sign in to answer");
      return;
    }
    
    if (!newAnswer.trim()) return;
    
    try {
      const newAnswerRef = await addDoc(collection(db, "answers"), {
        questionId: questionId,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        avatar: currentUser.photoURL || `https://i.pravatar.cc/100?u=${currentUser.uid}`,
        text: newAnswer,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: serverTimestamp()
      });
      
      // Add the new answer to local state
      const newAnswerObj = {
        id: newAnswerRef.id,
        questionId: questionId,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        avatar: currentUser.photoURL || `https://i.pravatar.cc/100?u=${currentUser.uid}`,
        text: newAnswer,
        likes: 0,
        likedBy: [],
        comments: [],
        isLiked: false,
        createdAt: new Date()
      };
      
      setAnswers(prev => [...prev, newAnswerObj]);
      setNewAnswer("");
    } catch (error) {
      console.error("Error adding answer:", error);
    }
  };

  if (loading) {
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
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{question.author}</span>
                  <span className="text-sm text-gray-500">
                    {question.createdAt?.toDate ? 
                      new Date(question.createdAt.toDate()).toLocaleDateString() : 
                      "Recent"}
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
                <p className="mb-3 text-gray-500">{question.description}</p>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={() => handleLike('question', question.id)}
                  className="flex items-center gap-1 text-red-500"
                >
                  {question.isLiked ? '❤' : '♡'} {question.likes || 0}
                </button>
                <button 
                  onClick={() => openCommentModal('question', question.id)}
                  className="flex items-center gap-1"
                >
                  💬 {question.comments?.length || 0}
                </button>
              </div>
              {question.comments && question.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {question.comments.map((comment, idx) => (
                    <div key={comment.id || idx} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {currentUser && comment.authorId === currentUser.uid && (
                          <button
                            onClick={() => handleDeleteComment('question', question.id, idx)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete comment"
                          >
                            ✕
                          </button>
                        )}
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
                      src={answer.avatar || `https://i.pravatar.cc/100?u=${answer.authorId || Math.random()}`}
                      alt={answer.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{answer.author}</span>
                    <span className="text-sm text-gray-500">
                      {answer.createdAt?.toDate ? 
                        new Date(answer.createdAt.toDate()).toLocaleDateString() : 
                        "Recent"}
                    </span>
                  </div>
                  <p className="mb-3 whitespace-pre-line">{answer.text}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleLike('answer', answer.id)}
                      className="flex items-center gap-1 text-red-500"
                    >
                      {answer.isLiked ? '❤' : '♡'} {answer.likes || 0}
                    </button>
                    <button
                      onClick={() => openCommentModal('answer', answer.id)}
                      className="flex items-center gap-1"
                    >
                      💬 {answer.comments?.length || 0}
                    </button>
                  </div>
                  {answer.comments && answer.comments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {answer.comments.map((comment, idx) => (
                        <div key={comment.id || idx} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-gray-500">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {currentUser && comment.authorId === currentUser.uid && (
                              <button
                                onClick={() => handleDeleteComment('answer', answer.id, idx)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="Delete comment"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <p className="mt-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">Add Your Answer</h3>
              <form onSubmit={handleAddAnswer}>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Write your answer here..."
                  className={`w-full p-3 rounded-lg mb-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
                  rows="4"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={!currentUser || !newAnswer.trim()}
                >
                  Post Answer
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <aside className="hidden lg:block w-80 ml-4">
          <div className={`border rounded-lg p-4 sticky top-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="font-bold mb-3">Related Questions</h3>
            <div className="space-y-2">
              {relatedQuestions.map(q => (
                <Link 
                  key={q.id} 
                  to={`/community/question/${q.id}`}
                  className="block hover:text-blue-500"
                >
                  {q.title}
                </Link>
              ))}
              {relatedQuestions.length === 0 && (
                <p className="text-gray-500">No related questions found</p>
              )}
            </div>
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
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className={`w-full p-3 rounded-lg mb-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}
              rows="3"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} border`}
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
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
