"use client";

import { Oval } from "react-loader-spinner";
import "./style.css";
import { FileText, LogOut, Mail, MoveRight, QrCode, Shield, User, Wallet, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface FormData {
    name: string;
    orgName: string;
    email: string;
    phone: string;
    otp: string;
    role: string;
    orgType: string;
}

const roleOptions = [
    {
        id: 'patent-owner',
        title: 'Patent Owner',
        description: 'Register and tokenize your patents',
        icon: User,
        color: 'from-blue-500 to-purple-600'
    },
    {
        id: 'licensee',
        title: 'Licensee',
        description: 'Acquire licenses for IP assets',
        icon: Wallet,
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'verifier',
        title: 'Verifier',
        description: 'Verify, review, and manage platform integrity',
        icon: Shield,
        color: 'from-orange-500 to-red-600'
    }
];

export default function Signup() {
    const { isAuthPending, signup, statusAuthText } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        orgName: "",
        email: "",
        phone: "",
        otp: "",
        role: "",
        orgType: ""
    });
    const [currentStep, setCurrentStep] = useState<'role' | 'basic' | 'otp'>('role');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpStatus, setOtpStatus] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSubmit = () => {
        if (formData.role) {
            setCurrentStep('basic');
        }
    };

    const handleRoleSelect = (roleId: string) => {
        setFormData(prev => ({ ...prev, role: roleId }));
    };

    const sendOtp = async () => {
        setOtpStatus("");
        setErrorMsg("");
        setIsLoading(true);
        try {
            let contact = formData.phone || formData.email;
            if (!contact) {
                setErrorMsg("Please enter your phone or email to receive OTP.");
                setIsLoading(false);
                return;
            }
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/send-otp`, {
                phone: formData.phone,
                email: formData.email
            });
            setOtpSent(true);
            setCurrentStep('otp');
            setOtpStatus("OTP sent successfully.");
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.error || "Failed to send OTP.");
        }
        setIsLoading(false);
    };

    const handleBasicSubmit = () => {
        // Basic details validation
        if (
            (formData.role === 'patent-owner' && formData.name && formData.email && formData.phone) ||
            (formData.role === 'verifier' && formData.orgName && formData.email && formData.phone) ||
            (formData.role === 'licensee' && formData.orgName && formData.email && formData.phone)
        ) {
            sendOtp();
        } else {
            setErrorMsg('Please fill all required basic details.');
        }
    };

    const verifyOtp = async () => {
        setOtpStatus("");
        setErrorMsg("");
        setIsLoading(true);

        try {
            const contact = formData.phone || formData.email;
            if (!contact || !formData.otp) {
                setErrorMsg("Please enter the OTP sent to your contact.");
                return;
            }

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/verify-otp`,
                {
                    phone: formData.phone,
                    email: formData.email,
                    otp: formData.otp,
                }
            );

            if (res.status === 200) {
                setOtpVerified(true);
                setOtpStatus("OTP verified successfully.");
            } else {
                setErrorMsg("Unexpected response from server.");
            }
        } catch (err: any) {
            if (err.response) {
                // Server responded with an error
                setErrorMsg(err.response.data?.error || "Invalid OTP. Please try again.");
            } else if (err.request) {
                // No response received
                setErrorMsg("No response from server. Check your internet connection.");
            } else {
                // Something else failed
                setErrorMsg("Error verifying OTP. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleOtpVerify = () => {
        if (formData.otp.length === 6) {
            verifyOtp();
        }
    };

    const handleSignup = () => {
        setErrorMsg("");
        if (!otpVerified) {
            setErrorMsg("Please verify OTP before completing signup.");
            return;
        }
        signup(formData);
    };

    useEffect(() => {
        if (otpVerified) {
            // Automatically proceed to signup after OTP verification
            handleSignup();
        }
    }, [otpVerified]);

    const handleBackToRole = () => {
        setCurrentStep('role');
    };

    const handleBackToBasic = () => {
        setCurrentStep('basic');
    };

    return (
        <div className="signup-body">
            <div className="grid-overlay"></div>
            <div className="signup-container">
                <div className="signup-card">
                    {/* Step Progress Header */}
                    <div className="signup-header">
                        <h1 className="signup-title">Mintellect</h1>
                        <div className="step-progress">
                            <div className={`step-item${currentStep === 'role' ? ' active' : ''}`}>Role</div>
                            <div className={`step-item${currentStep === 'basic' ? ' active' : ''}`}>Basic</div>
                            <div className={`step-item${currentStep === 'otp' ? ' active' : ''}`}>OTP</div>
                        </div>
                        <p className="signup-subtitle">
                            {currentStep === 'role' && 'Choose your role to get started. This will customize your signup experience.'}
                            {currentStep === 'basic' && 'Fill in your basic details.'}
                            {currentStep === 'otp' && 'Enter the OTP sent to your phone/email.'}
                        </p>
                    </div>
                    <div id="signupForm" className="signup-form">
                        {errorMsg && <div className="error-msg">{errorMsg}</div>}
                        {!statusAuthText ? (
                            <>
                                {currentStep === 'role' && (
                                    <div className="role-step">
                                        <div className="role-selection">
                                            {roleOptions.map((role) => {
                                                const IconComponent = role.icon;
                                                const isSelected = formData.role === role.id;
                                                return (
                                                    <div
                                                        key={role.id}
                                                        className={`role-card ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleRoleSelect(role.id)}
                                                    >
                                                        <div className={`role-icon bg-gradient-to-r ${role.color}`}>
                                                            <IconComponent size={24} />
                                                        </div>
                                                        <div className="role-content">
                                                            <h3 className="role-title">{role.title}</h3>
                                                            <p className="role-description">{role.description}</p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="role-selected">
                                                                <CheckCircle size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            className="signup-button"
                                            onClick={handleRoleSubmit}
                                            disabled={!formData.role}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                )}
                                {currentStep === 'basic' && (
                                    <div className="form-step">
                                        <button className="back-button" onClick={handleBackToRole}>
                                            ← Back to role selection
                                        </button>
                                        {/* Basic Details */}
                                        {formData.role === 'patent-owner' && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="name">Full Name</label>
                                                    <input type="text" id="name" className="form-input" placeholder="Enter your full name" required onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} value={formData.name} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="email">Email Address</label>
                                                    <input type="email" id="email" className="form-input" placeholder="Enter your email address" required onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} value={formData.email} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="phone">Phone Number</label>
                                                    <input type="tel" id="phone" className="form-input" placeholder="Enter your phone number" required maxLength={10} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} value={formData.phone} />
                                                </div>
                                            </>
                                        )}
                                        {formData.role === 'verifier' && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="orgName">Organization Name</label>
                                                    <input type="text" id="orgName" className="form-input" placeholder="Enter your organization name" required onChange={e => setFormData(prev => ({ ...prev, orgName: e.target.value }))} value={formData.orgName} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="orgType">Organization Type</label>
                                                    <select
                                                        id="orgType"
                                                        className="form-input"
                                                        required
                                                        onChange={e => setFormData(prev => ({ ...prev, orgType: e.target.value }))}
                                                        value={formData.orgType || ""}
                                                    >
                                                        <option value="" disabled>Select type</option>
                                                        <option value="private">Private</option>
                                                        <option value="public">Public</option>
                                                        <option value="government">Government</option>
                                                        <option value="ngo">NGO</option>
                                                        <option value="academic">Academic/Research</option>
                                                        <option value="startup">Startup</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="email">Email Address</label>
                                                    <input type="email" id="email" className="form-input" placeholder="Enter your email address" required onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} value={formData.email} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="phone">Phone Number</label>
                                                    <input type="tel" id="phone" className="form-input" placeholder="Enter your phone number" required maxLength={10} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} value={formData.phone} />
                                                </div>
                                            </>
                                        )}
                                        {formData.role === 'licensee' && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="orgName">Organization Name</label>
                                                    <input type="text" id="orgName" className="form-input" placeholder="Enter your organization name" required onChange={e => setFormData(prev => ({ ...prev, orgName: e.target.value }))} value={formData.orgName} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="email">Email Address</label>
                                                    <input type="email" id="email" className="form-input" placeholder="Enter your email address" required onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} value={formData.email} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="phone">Phone Number</label>
                                                    <input type="tel" id="phone" className="form-input" placeholder="Enter your phone number" required maxLength={10} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} value={formData.phone} />
                                                </div>
                                            </>
                                        )}
                                        <button type="button" className="signup-button" onClick={handleBasicSubmit} disabled={isLoading}>
                                            {isLoading ? <Oval visible={true} height="20" width="20" color="#2563eb" secondaryColor="#7c3aed" /> : "Continue"}
                                        </button>
                                    </div>
                                )}
                                {currentStep === 'otp' && (
                                    <div className="otp-step">
                                        <button
                                            className="back-button"
                                            onClick={handleBackToBasic}
                                        >
                                            ← Back to Basic Details
                                        </button>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="otp">Enter OTP</label>
                                            <input
                                                type="text"
                                                id="otp"
                                                className="form-input"
                                                placeholder="Enter the 6-digit OTP"
                                                required
                                                maxLength={6}
                                                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                                                value={formData.otp}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="signup-button"
                                            onClick={handleOtpVerify}
                                            disabled={formData.otp.length !== 6 || otpVerified || isLoading}
                                        >
                                            {isLoading ? <Oval visible={true} height="20" width="20" color="#2563eb" secondaryColor="#7c3aed" /> : otpVerified ? "Signup Complete" : "Verify OTP & Complete Signup"}
                                        </button>
                                        {otpStatus && (
                                            <div className={`otp-status ${otpStatus.includes('successfully') ? 'success' : ''}`}>{otpStatus}</div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="status-cont">
                                {!statusAuthText.includes('successful') ? (
                                    <Oval
                                        visible={true}
                                        height="30"
                                        width="30"
                                        color="#2563eb"
                                        ariaLabel="oval-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                        secondaryColor="#7c3aed"
                                    />
                                ) : (
                                    '✔️'
                                )}
                                {statusAuthText}
                            </div>
                        )}
                        <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.98rem" }}>
                            By signing up you agree to our <a href="#" style={{ color: "#2563eb", textDecoration: "underline" }}>T&amp;C</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}