import { useNavigate } from "react-router-dom";
import "./OTPPage.css";

function OTPPage() {

  const navigate = useNavigate();
  return (
    <div className="OTP-container">
      <div className="OTP-card">
        <h1>OTP Verification</h1>
        <p>Please enter the OTP that was sent to you via email. If you have not received it within 30 seconds, then click RESEND</p>

        <div className="otp-inputs">
          <input type="text" maxLength={1} inputMode="numeric" />
          <input type="text" maxLength={1} inputMode="numeric" />
          <input type="text" maxLength={1} inputMode="numeric" />
          <input type="text" maxLength={1} inputMode="numeric" />
        </div>

        <div className="otpResend">Din't recieve a code? <a href="#"><span style={{ color: "#2caeb7", textDecoration: "underline" }}>RESEND</span></a></div>
        <button type="submit" className="otpsubmit-button" onClick={() => navigate("/opt")}>
          Verify
        </button>
        <button type="button" className="otpcancel-button" onClick={() => navigate("/login")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
export default OTPPage;