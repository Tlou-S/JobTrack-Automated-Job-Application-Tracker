import "./ResetPasswordPage.css";
import { useNavigate } from "react-router-dom";
// import { useState } from 'react';
// import { useNavigate } from "react-router-dom";

function ResetPasswordPage() {

  const navigate = useNavigate();

  return (

    <div className="ResetContainer">
      <div className="Resetlogo-card">
        <div className="Resetlogoicon reset-jobtrack-brand" aria-label="JobTrack"><span className="navbar-brand-mark">JT</span><span className="navbar-brand-name">JobTrack</span></div>
      </div>
      <div className="Reset-card">
        <h1>Reset Password</h1>

        <form>
          <div className="Resetform-group">
            <label>Username</label>
            <input type="text" placeholder="" required />
          </div>

          <div className="Resetform-group">
            <label>Password</label>
            <input type="password" placeholder="" required />
          </div>

          <div className="Resetform-group">
            <label>Retype New Password</label>
            <input type="password" placeholder="" required />
          </div>

          <div className="ResetButtons" onClick={() => navigate("/login")}>
            <button type="submit" className="ResetsubmitButton">
                Submit
            </button>
            <button type="submit" className="ResetCancelButton" onClick={() => navigate("/home")}>
                Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
export default ResetPasswordPage; 