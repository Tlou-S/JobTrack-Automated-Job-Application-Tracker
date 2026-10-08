import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import "./Contactpage.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hook up to your backend / email service here
    console.log("Contact form submitted:", form);
  };

  return (
    <div className="ct-page">
      <Navbar />

      {/* Heading */}
      <section className="ct-heading">
        <h1>CONTACT US</h1>
        <p>
          Need help with your job search workspace? Reach out to us
          <br />
          for any question, feedback or support
        </p>
      </section>

      {/* Content */}
      <section className="ct-content">
        <div className="ct-card">
          <h3>SEND US A MESSAGE</h3>
          <form onSubmit={handleSubmit} className="ct-form">
            <label className="ct-field">
              <span className="ct-field-icon">👤</span>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
              />
            </label>

            <label className="ct-field">
              <span className="ct-field-icon">✉️</span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="ct-field">
              <span className="ct-field-icon">🏷️</span>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
              />
            </label>

            <label className="ct-field ct-field-textarea">
              <span className="ct-field-icon">💬</span>
              <textarea
                name="message"
                placeholder="Your message"
                rows={5}
                value={form.message}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="ct-submit">
              <span>➤</span> Send Message
            </button>
          </form>
        </div>

        <div className="ct-card">
          <h3>JOBTRACK SUPPORT</h3>

          <div className="ct-info-row">
            <span className="ct-info-icon">📍</span>
            <div>
              <strong>Support</strong>
              <p>
                Online support for JobTrack users
              </p>
            </div>
          </div>

          <div className="ct-info-row">
            <span className="ct-info-icon">✉️</span>
            <div>
              <strong>Email</strong>
              <p>Support@jobtrack.app</p>
            </div>
          </div>

          <div className="ct-info-row">
            <span className="ct-info-icon">📞</span>
            <div>
              <strong>Help topics</strong>
              <p>Applications, interviews, resumes, and account settings</p>
            </div>
          </div>

          <div className="ct-info-row">
            <span className="ct-info-icon">🕐</span>
            <div>
              <strong>Hours</strong>
              <p>
                Monday - Friday: 08:00-17:00
                <br />
                Saturday - Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Help banner */}
      <section className="ct-help-banner">
        <span className="ct-help-icon">🎧</span>
        <div>
          <strong>Need Help quickly?</strong>
          <p>
            For assistance, contact{" "}
            <a href="mailto:support@jobtrack.app">support@jobtrack.app</a>
          </p>
        </div>
      </section>
    </div>
  );
}

