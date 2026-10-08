// import { useRef, useState } from "react";
import "./Footer.css";

function Footer() {

  return (
    <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo"><span className="navbar-brand-mark">JT</span><span className="navbar-brand-name">JobTrack</span></div>
                        <p className="footer-description">
                            A clear view of your job applications, interviews, resumes, and next steps.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">JOB SEARCH</h3>
                        <ul className="footer-links">
                            <li><a href="#">Applications</a></li>
                            <li><a href="#">Companies</a></li>
                            <li><a href="#">Interviews</a></li>
                            <li><a href="#">Resumes & CVs</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">YOUR ACCOUNT</h3>
                        <ul className="footer-links">
                            <li><a href="#">Profile</a></li>
                            <li><a href="#">Settings</a></li>
                            <li><a href="#">Notifications</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">SUPPORT</h3>
                        <p className="footer-support-text">
                            Need help keeping your job search organized?
                        </p>
                        <button className="footer-support-btn">Contact Support</button>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 JOBTRACK</p>
                </div>
            </footer>
  );
}

export default Footer;