import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import RedCircle from '../assets/red-circle.webp'
import bookzy from '../assets/books.webp'
import nighty from '../assets/nightlamp.webp'
import manwrit from '../assets/manwriting.webp'
import personal from '../assets/persononlaptop.webp'
import star from '../assets/star-trail-removebg-preview.webp'
import Navbar from '../Components/Navbar';
import laks from '../assets/lakshya1.webp'
import anug from '../assets/anugrah.webp'
import vicky from '../assets/mrajarao.webp'
import lassi from '../assets/lasika.webp'
import { FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';


const AboutUs = () => {

  return (
    <>
    <Navbar/>
    <div className="about-container">
      

      {/* About Us Title */}
      <div className="about-hero">
        <div className="title-stack">
          <span className="title-white typewriter-text">About   Us</span>
          <span className="title-outline typewriter-text">About   Us</span>
          <span className="title-black typewriter-text">About  Us</span>
        </div>
      </div>

      {/* What We Offer */}
      <div className="offerings-section">
        <h2 className="offerings-title">
          What We Offer – " Your Smart Study BFF "
        </h2>

        <div className="features-list">
          <div className="feature-item">
            <img loading='lazy' src={RedCircle} alt="YouTube Summariser" className="feature-image small" />
            <div className="feature-content">
              <h3>YouTube Summariser</h3>
              <p>Long video? Snip! Here's the juicy stuff with timestamps.</p>
            </div>
          </div>

          <div className="feature-item">
            <img loading='lazy' src={RedCircle} alt="AI Doubt Solver" className="feature-image medium" />
            <div className="feature-content">
              <h3>AI Doubt Solver</h3>
              <p>Ask away, our brainy bot's got your back 24/7.</p>
            </div>
          </div>

          <div className="feature-item">
            <img loading='lazy' src={RedCircle} alt="Quiz on Anything" className="feature-image large" />
            <div className="feature-content">
              <h3>Quiz on Anything</h3>
              <p>Wanna test your brain on cats, calculus, or cooking? Go for it.</p>
            </div>
          </div>

          <div className="feature-item">
            <img loading='lazy' src={RedCircle} alt="Study Room Vibes" className="feature-image xl" />
            <div className="feature-content">
              <h3>Study Room Vibes</h3>
              <p>Chill zone for focused learning with your study squad.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
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

      {/* Empowering */}
      <div className="empowering-section">
        <h2 className="empowering-title">
          "Empowering Every Learner — One Video at a Time."
          <div className="star-accent" aria-hidden="true"></div>
        </h2>

        <p className="empowering-subtitle">
          Your smart companion for turning YouTube videos into bite-sized learning with summaries, quizzes, audio, and community support.
        </p>

        <div className="image-grid">
          <img loading='lazy' src= {bookzy} />
          <img loading='lazy' src= {nighty} alt="Night study" />
          <img loading='lazy' src= {manwrit} alt="Library study" />
          <img loading='lazy' src= {personal} alt="Group study" />
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="journey-section">
        
        <h2 className="journey-title">
          Our <span>Journey</span> Till Date
        </h2>

        <div className="timeline">
          {[
            { emoji: "💡", title: "Idea Sparked", desc: "Saw the need to simplify learning from long videos" },
            { emoji: "🎯", title: "Prototype Built", desc: "Created core features: summaries, TTS, quizzes" },
            { emoji: "♿", title: "Inclusive Design & Collaboration", desc: "Added features for neurodivergent and busy learners" },
            { emoji: "🚀", title: "Platform Expanded", desc: "Evolved into a full learning companion" },
            { emoji: "🔮", title: "Future Focused", desc: "Mobile app, multilingual support, AI learning paths & more..." }
          ].map((item, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-content">
                <h3 className="timeline-title">
                  <span role="img loading='lazy'" aria-label={item.title}>{item.emoji}</span> {item.title}
                </h3>
                <p className="timeline-description">{item.desc}</p>
              </div>
              <div className="timeline-marker"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="team-section">
        <h2 className="team-title">
          Meet Our <span>Team</span>
        </h2>
        <p className="team-subtitle">A perfect blend of creativity & technical wizardry</p>

        <div className="team-grid">
          {[
            { name: "Lakshya Mishra", image: laks },
            { name: "Anugrah Sharma", image: anug },
            { name: "M. Raja Rao Reddy", image: vicky },
            { name: "Lasika Rathore", image: lassi }
          ].map((member, i) => (
            <div className="team-member" key={i}>
              <img loading='lazy' src={member.image} alt={member.name} />
              <div className="team-member-content">
                <h3>{member.name}</h3>
                <div className="team-member-social">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <a href="https://instagram.com">
                      <FaInstagram size={24} />
                  </a>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <a href="https://linkedin.com">
                          <FaLinkedin size={24} />
                  </a>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <a href="https://twitter.com">
                    <FaTwitter size={24} />
                  </a>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutUs;