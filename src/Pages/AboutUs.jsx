import React from 'react';
import { FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import Navbar from '../Components/Navbar';

import '../App.css';

import RedCircle from '../assets/red-circle.webp';
import bookzy from '../assets/books.webp';
import nighty from '../assets/nightlamp.webp';
import manwrit from '../assets/manwriting.webp';
import personal from '../assets/persononlaptop.webp';
import star from '../assets/star-trail-removebg-preview.webp';
import laks from '../assets/lakshya1.webp';
import anug from '../assets/anugrah.webp';
import vicky from '../assets/mrajarao.webp';
import lassi from '../assets/lasika.webp';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="about-hero">
          <div className="title-stack">
            <span className="title-white typewriter-text">About Us</span>
            <span className="title-outline typewriter-text">About Us</span>
            <span className="title-black typewriter-text">About Us</span>
          </div>
        </div>

        <div className="offerings-section">
          <h2 className="offerings-title">
            What We Offer – " Your Smart Study BFF "
          </h2>

          <div className="features-list">
            {[
              {
                title: "YouTube Summariser",
                desc: "Long video? Snip! Here's the juicy stuff with timestamps.",
              },
              {
                title: "AI Doubt Solver",
                desc: "Ask away, our brainy bot's got your back 24/7.",
              },
              {
                title: "Quiz on Anything",
                desc: "Wanna test your brain on cats, calculus, or cooking? Go for it.",
              },
              {
                title: "Study Room Vibes",
                desc: "Chill zone for focused learning with your study squad.",
              },
            ].map((item, i) => (
              <div className="feature-item" key={i}>
                <img loading="lazy" src={RedCircle} alt={item.title} className="feature-image" />
                <div className="feature-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mission-section">
          <div className="mission-header">
            <h2>Our <span>Mission</span></h2>
            <img loading='lazy' src={star} alt="Star trail" />
          </div>

          <p className="mission-tagline">
            Empowering Learners Everywhere: Making Education Faster, Smarter, and Accessible for All.
          </p>

          <p className="mission-description">
            We believe that education should be inclusive and tailored to fit every learner's unique needs.
          </p>

          <p className="mission-highlight">
            Whether you're a student preparing for exams, a NeuroDivergent learner needing accessible content, a professional upskilling on the go, or a hobbyist exploring new skills,
            <br />
            <span>WitScribe adapts to YOU!!!</span>
          </p>

          <p className="mission-description">Our mission is simple:</p>

          <div className="mission-points">
            <div className="mission-point">Break down barriers in learning.</div>
            <div className="mission-point">Make video-based education structured, interactive, and engaging.</div>
            <div className="mission-point">Ensure everyone, regardless of abilities or environment, has access to smarter learning tools.</div>
          </div>
        </div>

        <div className="empowering-section">
          <h2 className="empowering-title">
            "Empowering Every Learner — One Video at a Time."
            <div className="star-accent" aria-hidden="true"></div>
          </h2>

          <p className="empowering-subtitle">
            Your smart companion for turning YouTube videos into bite-sized learning with summaries, quizzes, audio, and community support.
          </p>

          <div className="image-grid">
            {[bookzy, nighty, manwrit, personal].map((imgSrc, i) => (
              <img loading="lazy" src={imgSrc} alt={`img-${i}`} key={i} />
            ))}
          </div>
        </div>

        <div className="journey-section">
          <h2 className="journey-title">Our <span>Journey</span> Till Date</h2>

          <div className="timeline">
            
            {[
              { emoji: "💡", title: "Idea Sparked", desc: "Saw the need to simplify learning from long videos" },
              { emoji: "🎯", title: "Prototype Built", desc: "Created core features: summaries, TTS, quizzes" },
              { emoji: "♿", title: "Inclusive Design & Collaboration", desc: "Added features for neurodivergent and busy learners" },
              { emoji: "🚀", title: "Platform Expanded", desc: "Evolved into a full learning companion" },
              { emoji: "🔮", title: "Future Focused", desc: "Mobile app, multilingual support, AI learning paths & more..." },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                } md:items-center`}
              >
                {/* Timeline marker */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center">
                  <div className="bg-white rounded-full border-4 border-red-500 w-8 h-8"></div>
                </div>
                
                {/* Content container */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${
                  index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'
                } pb-12 md:pb-24`}>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-4xl mr-3">{item.emoji}</span>
                      <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                </div>
                
                {/* Empty space for alternating layout */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-container">
      {/* Other sections remain unchanged */}
      
      <div className="team-section px-4 py-8 md:py-12">
        <h2 className="team-title text-center text-2xl md:text-3xl font-bold mb-2">
          Meet Our <span>Team</span>
        </h2>
        <p className="team-subtitle text-center mb-8">
          A perfect blend of creativity & technical wizardry
        </p>

        <div className="team-grid flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 md:gap-6 max-w-6xl mx-auto">
          {[
            { name: "Lakshya Mishra", image: laks },
            { name: "Anugrah Sharma", image: anug },
            { name: "M. Raja Rao Reddy", image: vicky },
            { name: "Lasika Rathore", image: lassi }
          ].map((member, i) => (
            <div className="team-member w-full md:w-auto flex flex-col sm:flex-row items-center md:mx-4 lg:mx-8" key={i}>
              <img 
                loading='lazy' 
                src={member.image} 
                alt={member.name} 
                className="w-24 h-24 md:w-28 md:h-28 lg:w-30 lg:h-30 rounded-full object-cover border-3 border-red-500"
              />
              <div className="team-member-content mt-4 sm:mt-0 sm:ml-4 flex flex-col items-center sm:items-start">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800">{member.name}</h3>
                <div className="team-member-social flex gap-3 mt-3">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transform transition-transform hover:-translate-y-1"
                  >
                    <FaInstagram size={24} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transform transition-transform hover:-translate-y-1" 
                  >
                    <FaLinkedin size={24} />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transform transition-transform hover:-translate-y-1"
                  >
                    <FaTwitter size={24} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other sections remain unchanged */}
    </div>
      </div>
    </>
  );
};

export default AboutUs;
