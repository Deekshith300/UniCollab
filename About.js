import React from 'react';
import './About.css';
import Services from './Services';

function About() {
  return (
    <div className="about-section glass-card animate-fade-in">
      <h1 className="about-title">About UniCollab</h1>
      <p className="about-subtitle">Empowering Students to Collaborate, Learn, and Succeed</p>
      <div className="about-content">
        <section className="about-mission">
          <h2>Our Mission</h2>
          <p>
            UniCollab is dedicated to building a vibrant, supportive community for students everywhere. Our mission is to make learning collaborative, accessible, and fun—helping you connect, share, and grow together.
          </p>
        </section>
        <section className="about-features">
          <h2>Our Services</h2>
          <Services />
        </section>
        <section className="about-team">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team Member" />
              <h3>Alex Kumar</h3>
              <p>Founder & Full Stack Developer</p>
            </div>
            <div className="team-member">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Team Member" />
              <h3>Priya Sharma</h3>
              <p>UI/UX Designer</p>
            </div>
            <div className="team-member">
              <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Team Member" />
              <h3>Rahul Singh</h3>
              <p>Backend & DevOps</p>
            </div>
          </div>
        </section>
        <section className="about-cta">
          <h2>Ready to Join?</h2>
          <p>Sign up now and become part of the UniCollab community!</p>
          <a href="/signup" className="about-cta-btn">Get Started</a>
        </section>
      </div>
    </div>
  );
}

export default About; 