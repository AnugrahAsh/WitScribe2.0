import React, { useState } from "react";
import "../App.css";
import { Link, useLocation } from "react-router-dom";
import UserImage from "../assets/user.png";
import { useAuth } from '../context/AuthContext';

const Navbar = ({ userPhoto }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const allowed = ["/about", "/contact", "/register", "/login", "/landing", "/"];
  const isPublicOnly = !currentUser && allowed.includes(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const profileImg = userPhoto || UserImage;

  return (
    <div className="navbar-container flex mt-8 relative">
      <div className="navbar flex flex-wrap gap-4 md:gap-44 m-auto bg-[#dcdcdc] justify-between md:justify-center rounded-2xl items-center mx-auto px-10 md:px-8 py-3 w-full max-w-2xl">
        <Link to="/landing">
          <div className="logo text-2xl font-bold">WitScribe</div>
        </Link>

        {/* Hamburger Menu Button (visible on mobile) */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="flex items-center p-2 rounded hover:bg-gray-200 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links hidden md:flex items-center gap-4">
          {isPublicOnly ? (
            <>
              <Link to="/about" className="hover:text-red-500 px-3 py-2 rounded transition">About Us</Link>
              <Link to="/contact" className="hover:text-red-500 px-3 py-2 rounded transition">Contact</Link>
              <Link to="/register" className="hover:text-red-500 px-3 py-2 rounded transition">Register</Link>
            </>
          ) : (
            <>
              <Link to="/" className="active" id="redLink">
                Home
              </Link>
              <Link to="/quiz" className="hover:text-red-500 px-3 py-2 rounded transition">Quiz</Link>
              <Link to="/community" className="hover:text-red-500 px-3 py-2 rounded transition">Community</Link>
              <Link to="/profile">
                <img src={profileImg} className="h-8 w-8 rounded-full object-cover" alt="Profile" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation (Dropdown) */}
        {isMenuOpen && (
          <div className="mobile-nav-links flex flex-col w-full md:hidden mt-4 gap-4 py-2">
            {isPublicOnly ? (
              <>
                <Link to="/about" className="hover:text-red-500 px-3 py-2 rounded transition">About Us</Link>
                <Link to="/contact" className="hover:text-red-500 px-3 py-2 rounded transition">Contact</Link>
                <Link to="/register" className="hover:text-red-500 px-3 py-2 rounded transition">Register</Link>
              </>
            ) : (
              <>
                <Link to="/" className="active py-2" id="redLink">
                  Home
                </Link>
                <Link to="/quiz" className="hover:text-red-500 px-3 py-2 rounded transition">Quiz</Link>
                <Link to="/community" className="hover:text-red-500 px-3 py-2 rounded transition">Community</Link>
                <Link to="/profile" className="py-2 flex items-center">
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="profile-pic rounded-full mr-2 h-8 w-8 object-cover"
                  />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;