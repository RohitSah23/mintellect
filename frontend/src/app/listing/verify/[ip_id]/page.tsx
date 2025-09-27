'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './style.css';
import axios from 'axios';
import { useAlert } from '@/context/alertContext';
import { useAuth } from '@/hooks/useAuth';


export default function VerifyIPPage() {
    const router = useRouter();
    const alert = useAlert();
    const params = useParams();
    const [ipData, setIpData] = useState<IPMetadata | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Mock data - replace with actual API call

        loadPatentData(params.ip_id);

    }, [params.ip_id]);
    const loadPatentData = async (id: any) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/getipbyid/${id}`, {
                withCredentials: true
            });

            const patentData = response.data.data;
            console.log('Fetched patent data:', patentData);
            setIpData(patentData);



        } catch (err) {
            console.error('Failed to load patent data:', err);
            alert.error('Failed to load patent data for editing.');
            //router.push('/listing'); // Redirect back if loading fails
        } finally {
            setIsLoading(false);
        }
    };
    const handleApprove = async () => {
        setProcessing(true);
        try {

            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/listing/verify`,
                {
                    ip_id: params.ip_id,
                    status: "APPROVED",
                    org_id: user?.org_id
                },
                { withCredentials: true }
            );

            alert.success("IP Application Approved Successfully!");
            router.push("/");
        } catch (err) {
            console.error("Approve error:", err);
            alert.error("Failed to approve IP.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert.warn("Please provide a reason for rejection");
            return;
        }

        setProcessing(true);
        try {


            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/listing/verify`,
                {
                    ip_id: params.ip_id,
                    status: "REJECTED",
                    reason: rejectReason,
                    org_id: user?.org_id
                },
                { withCredentials: true }
            );

            alert.success("IP Application Rejected");
            setShowRejectModal(false);
            router.push("/");
        } catch (err) {
            console.error("Reject error:", err);
            alert.error("Failed to reject IP.");
        } finally {
            setProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="app-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading IP Application...</p>
                </div>
            </div>
        );
    }

    if (!ipData) {
        return (
            <div className="app-container">
                <div className="error-container">
                    <h2>IP Application Not Found</h2>
                    <button onClick={() => router.push('/')} className="back-button">
                        Go Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }
    if (ipData.status !== 'SUBMITTED') {
        return (
            <div className="app-container">
                <div className="error-container">
                    <h2>IP Application Already Verified</h2>
                    <button onClick={() => router.push('/')} className="back-button">
                        Go Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="page-header">
                <h1 className="page-title">Verify IP Application</h1>
                <div className="header-actions">
                    <span className={`status-badge status-${ipData.status.toLowerCase()}`}>
                        {ipData.status}
                    </span>
                </div>
            </div>

            <div className="verification-card">
                <div className="card-header">
                    <h2 className="card-title">Application Details</h2>
                    <div className="application-meta">
                        <span className="application-no">#{ipData.applicationNo}</span>
                        <span className="jurisdiction-badge">{ipData.jurisdiction}</span>
                    </div>
                </div>

                <div className="card-content">
                    <div className="info-grid">
                        <div className="info-section">
                            <h3 className="section-title">Basic Information</h3>
                            <div className="info-item">
                                <label>Title:</label>
                                <span>{ipData.title}</span>
                            </div>
                            <div className="info-item">
                                <label>Abstract:</label>
                                <p>{ipData.abstract}</p>
                            </div>
                            <div className="info-item">
                                <label>Filing Date:</label>
                                <span>{new Date(ipData.filingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                                <label>IPC Classes:</label>
                                <div className="classes-container">
                                    {ipData.ipcClasses.map((cls, index) => (
                                        <span key={index} className="class-badge">{cls}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h3 className="section-title">Applicant Information</h3>
                            <div className="applicants-list">
                                {ipData.applicants.map((applicant, index) => (
                                    <div key={index} className="applicant-item">
                                        <div className="applicant-address">{applicant}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="ownership-status">
                                <span className={`ownership-badge ${ipData.ownershipVerified ? 'verified' : 'pending'}`}>
                                    {ipData.ownershipVerified ? '✓ Ownership Verified' : '⏳ Pending Verification'}
                                </span>
                            </div>
                        </div>

                        <div className="info-section">
                            <h3 className="section-title">Supporting Documents</h3>
                            <div className="file-info">
                                <div className="file-item">
                                    <div className="file-icon">📄</div>
                                    <div className="file-details">
                                        <span className="file-name">{ipData.file?.name ?? 'No file name'}</span>
                                    </div>
                                    {ipData.file?.url ? (
                                        <a
                                            href={ipData.file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-download"
                                        >
                                            View Document
                                        </a>
                                    ) : (
                                        <span className="file-download">No document available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="verification-actions">
                    <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="approve-button"
                    >
                        {processing ? (
                            <>
                                <div className="button-spinner"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="button-icon">✓</span>
                                Approve Application
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={processing}
                        className="reject-button"
                    >
                        <span className="button-icon">✕</span>
                        Reject Application
                    </button>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Reject Application</h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="modal-close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <label htmlFor="rejectReason" className="modal-label">
                                Please provide a reason for rejection:
                            </label>
                            <textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter detailed reason for rejection..."
                                className="modal-textarea"
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="modal-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processing}
                                className="modal-confirm"
                            >
                                {processing ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        Rejecting...
                                    </>
                                ) : (
                                    'Confirm Rejection'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}