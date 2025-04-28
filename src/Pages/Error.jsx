import React from 'react';
import '../App.css';
import Navbar from '../Components/Navbar';


const NotFound = () => {
  return (
    <>
    <Navbar/>
    <div className="error-container">
      <div className="error-card">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">OPPS! PAGE NOT FOUND</h2>
        <p className="error-message">
          Sorry, the page you're looking for doesn't exist. If you think something is broken, report a problem.
        </p>
        <div className="button-group">
          <button className="button home-button" onClick={() => window.location.href = '/'}>
            Return Home
          </button>
          <button className="button report-button" onClick={() => window.location.href = '/report'}>
            Report Problem
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default NotFound;