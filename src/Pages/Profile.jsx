"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import perosonol from "../assets/persononlaptop.webp"
import { FiCamera } from "react-icons/fi"
import Navbar from "../Components/Navbar"
import { logOut } from "../services/authService"
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onSnapshot } from "firebase/firestore"
import UserImage from "../assets/user.png"

const UserProfile = () => {
  const [image, setImage] = useState(null)
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    location: "",
    postalCode: "",
    photoURL: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load user profile from Firestore or create if not exists
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return
      const userRef = doc(db, "users", currentUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setProfileData(userSnap.data())
      } else {
        // Create user doc with registration details
        const newProfile = {
          displayName: currentUser.displayName || "",
          email: currentUser.email,
          phone: "",
          location: "",
          postalCode: "",
          photoURL: currentUser.photoURL || "",
          createdAt: new Date(),
        }
        await setDoc(userRef, newProfile)
        setProfileData(newProfile)
      }
      setLoading(false)
    }
    if (currentUser) fetchProfile()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      setProfileData(null)
      return
    }
    const userRef = doc(db, "users", currentUser.uid)
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      setProfileData(docSnap.data())
    })
    return unsubscribe
  }, [currentUser])

  const handleLogout = async () => {
    await logOut()
    navigate("/login")
  }

  // Save profile changes
  const handleSaveChanges = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    setSaving(true)
    try {
      const userRef = doc(db, "users", currentUser.uid)
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phone: profileData.phone,
        location: profileData.location,
        postalCode: profileData.postalCode,
        photoURL: profileData.photoURL,
      })
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle profile picture upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !currentUser) return
    try {
      const storage = getStorage()
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      // Save to Firestore
      await updateDoc(doc(db, "users", currentUser.uid), { photoURL: url })
      setProfileData((prev) => ({ ...prev, photoURL: url }))
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )

  return (
    <>
      <Navbar userPhoto={userProfile?.photoURL || profileData?.photoURL || UserImage} />
      <div className="min-h-screen bg-transparent">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-20 left-4 z-20">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-100/50 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row pt-20">
          {/* Sidebar */}
          <div
            className={`
            fixed lg:static inset-0 z-10 transform
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            w-80 min-h-screen bg-white/90 backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 shadow-xl
          `}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">User Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>

            <nav className="space-y-3">
              <div className="flex items-center text-red-500 bg-red-50 p-4 rounded-xl cursor-pointer">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="font-semibold">User Information</span>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-red-500 hover:bg-red-50 p-4 rounded-xl transition-all duration-300 w-full"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold">Log Out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <img
                      src={
                        userProfile?.photoURL ||
                        profileData?.photoURL ||
                        perosonol ||
                        "/placeholder.svg?height=120&width=120"
                      }
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <label className="absolute bottom-2 right-2 bg-red-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-lg">
                      <FiCamera size={18} color="#fff" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileData?.displayName || profileData?.email || "User"}
                    </h2>
                    <p className="text-gray-600 text-lg">{profileData?.location || "Location not set"}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Update your personal details and preferences</p>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Display Name</label>
                      <input
                        type="text"
                        placeholder="Enter your display name"
                        value={profileData?.displayName || ""}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={profileData?.email || ""}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={profileData?.phone || ""}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. New York, USA"
                        value={profileData?.location || ""}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        placeholder="Enter your postal code"
                        value={profileData?.postalCode || ""}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
                    >
                      {saving ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving Changes...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Additional Info Cards */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Account Status</h4>
                      <p className="text-sm text-gray-600">Your account is active and verified</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Privacy & Security</h4>
                      <p className="text-sm text-gray-600">Your data is secure and protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserProfile
