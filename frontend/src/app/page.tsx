import Image from "next/image";

export default function Login() {
  return (
   <div className="login-body">
      <div className="grid-overlay"></div>
      {/* ...existing code... */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <span className="logo-text">Mintellect</span>
              </div>
            </div>
            <h1 className="login-title">Welcome Back</h1>
          </div>
          <div className="login-options">
            {!otpSent ? (
              <>
                <div className="form-group">
                  <label htmlFor="contact">Email or Phone Number</label>
                  <input
                    type="text"
                    id="contact"
                    className="form-input"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="Enter your email or 10-digit phone number"
                  />
                </div>
                <button
                  className="login-button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? <Oval visible={true} height="20" width="20" color="#2563eb" secondaryColor="#7c3aed" /> : "Send OTP"}
                </button>
                {otpStatus && <div className="otp-status">{otpStatus}</div>}
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    className="form-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter the 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <button
                  className="login-button"
                  onClick={handleLogin}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? <Oval visible={true} height="20" width="20" color="#2563eb" secondaryColor="#7c3aed" /> : "Login"}
                </button>
                {loginStatus && <div className="login-status">{loginStatus}</div>}
              </>
            )}
          </div>
         
        </div>
      </div>
    </div>
  );
}
