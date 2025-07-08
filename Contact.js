import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <div className="contact-bg">
      <div className="contact-container glass-card animate-fade-in">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-desc">We'd love to hear from you! Reach out with questions, feedback, or just to say hello.</p>
        <div className="contact-content">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <ul>
              <li><i className="fas fa-envelope"></i> mavoorideekshith@gmail.com</li>
              <li><i className="fas fa-phone"></i> 9492662088</li>
              <li><i className="fas fa-map-marker-alt"></i> Sir M.Visvesaraya Hostel Block, AU North Campus, Visakhapatnam - 530003.</li>
              <li><a href="https://www.linkedin.com/in/deekshith-mavoori-5ab262297" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i> LinkedIn</a></li>
            </ul>
          </div>
          <form className="contact-form">
            <h2>Send a Message</h2>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact; 