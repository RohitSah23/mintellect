"use client";

import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
// import "./style.css";
import { Mail, MoveRight } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const { authStatus } = useAuth();
  const [contact, setContact] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Send OTP
  // Helper to check if input is email or phone
  const isEmail = (val: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
  const isPhone = (val: string) => /^\d{10}$/.test(val.replace(/\D/g, ""));

  const handleSendOtp = async () => {
    setOtpStatus("");
    setIsLoading(true);
    try {
      if (!contact) {
        setOtpStatus("Please enter your email or phone number.");
        setIsLoading(false);
        return;
      }
      let payload: any = { isLogin: true };
      if (isEmail(contact)) payload.email = contact;
      else if (isPhone(contact)) payload.phone = contact.replace(/\D/g, "");
      else {
        setOtpStatus("Enter a valid email or 10-digit phone number.");
        setIsLoading(false);
        return;
      }
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/send-otp`, payload);
      setOtpSent(true);
      setOtpStatus("OTP sent successfully.");
    } catch (err: any) {
      setOtpStatus(err?.response?.data?.error || "Failed to send OTP.");
      if (err?.response?.status === 404) {
        location.href = '/signup';
      }
    }
    setIsLoading(false);
  };

  // Verify OTP and login
  const handleLogin = async () => {
    setLoginStatus("");
    setIsLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        setLoginStatus("Enter valid OTP.");
        return;
      }

      let payload: any = { otp };
      if (isEmail(contact)) payload.email = contact;
      else if (isPhone(contact)) payload.phone = contact.replace(/\D/g, "");
      else {
        setLoginStatus("Enter a valid email or 10-digit phone number.");
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/login`,
        payload,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setLoginStatus("Login successful.");
        location.href = '/dashboard';
      } else {
        setLoginStatus(res.data?.error || "Login failed.");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setLoginStatus(err.response.data?.error || `Error: ${err.response.status}`);
        } else if (err.request) {
          setLoginStatus("No response from server. Check your connection.");
        } else {
          setLoginStatus("Request setup error.");
        }
      } else {
        setLoginStatus("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'success') {
      location.href = '/dashboard';
    }
  }, [authStatus]);

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
          <div className="migrate-section">
            <p className="migrate-text">Don't have an account?</p>
            <button className="migrate-button" onClick={() => { router.push('/signup') }}>
              Sign Up <MoveRight size={20} />
            </button>
          </div>
          <div className="footer-text">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
