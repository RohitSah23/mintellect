

"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import './style.css';

interface RejectionData {
    _id: string;
    orgId: string;
    ip_id: string;
    status: string;
    reason: string;
    signature: string;
    verifiedBy: string;
    verifiedAt: string;
}

export default function RejectionReason() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [rejectionData, setRejectionData] = useState<RejectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock data - replace with actual API call
    useEffect(() => {
        if (id) {
            // Simulate API call
            setTimeout(() => {
                // Mock rejection data based on the provided MongoDB document
                const mockData = {
                    _id: "68c6ff6dc0da2abe818d66a8",
                    orgId: "ORG-1757688060681552",
                    ip_id: id,
                    status: "REJECTED",
                    reason: "details not sufficient",
                    signature: "",
                    verifiedBy: "user_01993e5f-5aa9-76aa-87de-b63c088a3a67",
                    verifiedAt: "2025-09-14T17:46:21.273Z"
                };
                setRejectionData(mockData);
                setLoading(false);
            }, 1000);
        }
    }, [id]);

    const handleReapply = () => {
        // Navigate to reapplication page or form
        router.push(`/listing/editor`);
    };

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <>
                <title>Loading - Rejection Details</title>
                <div className="rejection-body">
                    <div className="grid-overlay"></div>
                    <div className="blockchain-node node-1"></div>
                    <div className="blockchain-node node-2"></div>
                    <div className="blockchain-node node-3"></div>
                    <div className="blockchain-node node-4"></div>
                    <div className="connection-line line-1"></div>
                    <div className="connection-line line-2"></div>
                    <div className="particle particle-1"></div>
                    <div className="particle particle-2"></div>
                    <div className="particle particle-3"></div>
                    <div className="particle particle-4"></div>
                    <div className="rejection-container">
                        <div className="rejection-card">
                            <div className="rejection-header">
                                <div className="logo-container">
                                    <div className="logo">
                                        <div className="logo-icon">⚡</div>
                                        <div className="logo-text">Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <title>Error - Rejection Details</title>
                <div className="rejection-body">
                    <div className="rejection-container">
                        <div className="rejection-card">
                            <div className="rejection-header">
                                <div className="logo-container">
                                    <div className="logo">
                                        <div className="logo-icon">❌</div>
                                        <div className="logo-text">Error</div>
                                    </div>
                                </div>
                                <h1 className="rejection-title">Something went wrong</h1>
                            </div>
                            <div className="error-message">{error}</div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <title>Application Rejected - Rejection Details</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <div className="rejection-body">
                {/* Background Elements */}
                <div className="grid-overlay"></div>
                <div className="blockchain-node node-1"></div>
                <div className="blockchain-node node-2"></div>
                <div className="blockchain-node node-3"></div>
                <div className="blockchain-node node-4"></div>
                <div className="connection-line line-1"></div>
                <div className="connection-line line-2"></div>
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="rejection-container">
                    <div className="rejection-card">
                        {/* Header */}
                        <div className="rejection-header">
                            <div className="logo-container">
                                <div className="logo">
                                    <div className="logo-icon">❌</div>
                                    <div className="logo-text">Application Status</div>
                                </div>
                            </div>
                            <h1 className="rejection-title">Application Rejected</h1>
                        </div>
                        {/* Status Badge */}
                        <div className="status-badge rejected">
                            <span className="status-icon">🚫</span>
                            <span className="status-text">REJECTED</span>
                        </div>
                        {/* Rejection Details */}
                        <div className="rejection-details">
                            <div className="detail-section">
                                <div className="detail-label">Application ID:</div>
                                <div className="detail-value">{rejectionData?.ip_id}</div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-label">Organization ID:</div>
                                <div className="detail-value">{rejectionData?.orgId}</div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-label">Rejection Reason:</div>
                                <div className="detail-value reason-text">{rejectionData?.reason}</div>
                            </div>
                            <div className="detail-section">
                                <div className="detail-label">Verified At:</div>
                                <div className="detail-value">
                                    {rejectionData?.verifiedAt ? new Date(rejectionData.verifiedAt).toLocaleString() : ''}
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="button-group">
                            <button onClick={handleReapply} className="primary-btn reapply-btn">
                                <span>Reapply Now</span>
                            </button>

                            <button onClick={handleGoBack} className="secondary-btn back-btn">
                                <span className="btn-icon">←</span>
                                <span>Go Back</span>
                            </button>
                        </div>
                        {/* Help Section */}
                        <div className="help-section">
                            <div className="help-text">
                                Need help understanding the rejection reason?
                            </div>
                            <button className="help-button">
                                <span>📞</span>
                                <span>Contact Support</span>
                            </button>
                        </div>
                        {/* Footer */}
                        <div className="footer-text">
                            If you believe this rejection was made in error, please{' '}
                            <a href="/contact">contact our support team</a> for assistance.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}