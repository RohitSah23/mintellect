"use client";
import { useState } from "react";
import "./ip-table.css";
import { useRouter } from "next/navigation";

export enum IpType {
    PATENT = 'patent',
    TRADEMARK = 'trademark',
    COPYRIGHT = 'copyright',
    TRADE_SECRET = 'trade_secret',
    DESIGN = 'design'
}

export enum IpStatus {
    DRAFT = 'DRAFT',
    LISTED = 'LISTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUBMITTED = 'SUBMITTED',
    MINTED = 'MINTED'
}


interface IpVerifierTableProps {
    ipdata?: IPMetadata[];
}

export default function IpVerifierTable(props: IpVerifierTableProps) {
    const { ipdata } = props;
    const router = useRouter();

    const handleVerify = (id: any) => {
        router.push(`/listing/verify/${id}`);
    };

    const formatDate = (isoDate: any): string => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateText = (text: string, maxLength: number): string => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Card component for mobile view
    const IpCard = ({ ip }: { ip: IPMetadata }) => (
        <div className="ip-card">
            <div className="card-header">
                <div className="card-title-section">
                    <h3 className="card-title">{ip.title}</h3>
                    <span className="application-no">{ip.applicationNo}</span>
                </div>
                <div className="card-status-section">
                    <span className={`status-tag status-tag--${ip.status.toLowerCase()}`}>
                        {ip.status}
                    </span>
                    {ip.ownershipVerified && (
                        <span className="verified-badge">✓ Verified</span>
                    )}
                </div>
            </div>

            <div className="card-body">
                <div className="card-field">
                    <label className="card-label">Abstract</label>
                    <p className="card-value abstract-text">{ip.abstract}</p>
                </div>

                <div className="card-row">
                    <div className="card-field">
                        <label className="card-label">Jurisdiction</label>
                        <span className="card-value">{ip.jurisdiction}</span>
                    </div>
                    <div className="card-field">
                        <label className="card-label">Filing Date</label>
                        <span className="card-value date-text">{formatDate(ip.filingDate)}</span>
                    </div>
                </div>

                <div className="card-field">
                    <label className="card-label">Applicants</label>
                    <span className="card-value">{ip.applicants.join(', ')}</span>
                </div>

                <div className="card-field">
                    <label className="card-label">IPC Classes</label>
                    <span className="card-value">{ip.ipcClasses.join(', ')}</span>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="card-action-button card-action-button--verify"
                    onClick={() => handleVerify(ip.ip_id)}
                    title="Verify IP"
                >
                    Verify
                </button>
            </div>
        </div>
    );

    return (
        <div className="ip-verifier-dashboard">
            <div className="dashboard-header">
                <h1>IP Verification Dashboard</h1>
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-number">{ipdata?.length || 0}</span>
                        <span className="stat-label">Total Applications</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {ipdata?.filter(ip => ip.status === 'SUBMITTED').length || 0}
                        </span>
                        <span className="stat-label">Pending Review</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {ipdata?.filter(ip => ip.status !== 'SUBMITTED').length || 0}
                        </span>
                        <span className="stat-label">Verified</span>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="table-container desktop-view">
                <div className="table-wrapper">
                    <table className="ip-table">
                        <thead>
                            <tr>
                                <th>Title & Application No.</th>
                                <th>Abstract</th>
                                <th>Jurisdiction</th>
                                <th>Applicants</th>
                                <th>Status</th>
                                <th>Filing Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        {ipdata && ipdata.length > 0 ? (
                            <tbody>
                                {ipdata.map((ip) => (
                                    <tr key={ip.uid} className="table-row">
                                        <td className="title-cell">
                                            <div className="title-content">
                                                <div className="title-main">
                                                    <span className="ip-title">{ip.title}</span>
                                                    {ip.ownershipVerified && (
                                                        <span className="verified-icon" title="Ownership Verified">✓</span>
                                                    )}
                                                </div>
                                                <code className="application-no">{ip.applicationNo}</code>
                                            </div>
                                        </td>

                                        <td className="abstract-cell">
                                            <p className="abstract-text" title={ip.abstract}>
                                                {truncateText(ip.abstract, 100)}
                                            </p>
                                        </td>

                                        <td className="jurisdiction-cell">
                                            <span className="jurisdiction">{ip.jurisdiction}</span>
                                        </td>

                                        <td className="applicants-cell">
                                            <span className="applicants" title={ip.applicants.join(', ')}>
                                                {truncateText(ip.applicants.join(', '), 50)}
                                            </span>
                                        </td>

                                        <td className="status-cell">
                                            <span className={`status-tag status-tag--${ip.status.toLowerCase()}`}>
                                                {ip.status}
                                            </span>
                                        </td>

                                        <td className="date-cell">
                                            <span className="date-text">{formatDate(ip.createdAt)}</span>
                                        </td>

                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                {(ip.status !== 'APPROVED' && ip.status !== 'REJECTED' && ip.status !== 'MINTED') ? <button
                                                    className="action-button action-button--verify"
                                                    onClick={() => handleVerify(ip.ip_id)}
                                                    title="Verify IP"
                                                >
                                                    Verify
                                                </button> : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <tbody>
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <div className="empty-icon">📋</div>
                                            <h3 className="empty-title">No IP Applications to Review</h3>
                                            <p className="empty-description">
                                                There are currently no intellectual property applications pending verification
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="cards-container mobile-view">
                {ipdata && ipdata.length > 0 ? (
                    <div className="cards-grid">
                        {ipdata.map((ip) => (
                            <IpCard key={ip.uid} ip={ip} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3 className="empty-title">No IP Applications to Review</h3>
                        <p className="empty-description">
                            There are currently no intellectual property applications pending verification
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}