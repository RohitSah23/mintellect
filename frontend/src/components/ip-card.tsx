import React from 'react';
import './ip-card.css';
import { useRouter } from 'next/navigation';

// IpCard component
// Props: Ip (object) — shape matches the JSON you provided

export default function IpCard({ Ip }: { Ip: any[] }) {
    if (!Ip || !Array.isArray(Ip)) return null;

    const router = useRouter();

    const formatDate = (iso: any) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('en-GB');
        } catch (e) {
            return iso || '-';
        }
    };

    const formatApplicants = (applicants: any) => {
        if (!applicants) return '—';
        if (Array.isArray(applicants)) {
            return applicants.join(', ');
        }
        return String(applicants);
    };

    const formatIpcClasses = (ipcClasses: any) => {
        if (!ipcClasses) return '—';
        if (Array.isArray(ipcClasses)) {
            return ipcClasses.join(', ');
        }
        return String(ipcClasses);
    };

    const handleEdit = (e: React.MouseEvent, patentId: string) => {
        e.stopPropagation();
        router.push(`/listing/editor?id=${patentId}`);
    };

    const handleCheckReason = (e: React.MouseEvent, patentId: string) => {
        e.stopPropagation();
        // Navigate to rejection reason page or show modal
        router.push(`/listing/rejection-reason?id=${patentId}`);
    };

    const handleTokenize = (e: React.MouseEvent, patentId: string) => {
        e.stopPropagation();
        // Navigate to tokenization page
        router.push(`/listing/tokenize?id=${patentId}`);
    };

    const getStatusButton = (patent: any) => {
        const status = patent.status?.toUpperCase();

        switch (status) {
            case 'DRAFT':
                return (
                    <button
                        className="ip-card-action-button edit-button"
                        onClick={(e) => handleEdit(e, patent.ip_id)}
                        title="Edit Patent"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="m18.5 2.5 3 3L10 17l-4 1 1-4L18.5 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Edit
                    </button>
                );

            case 'REJECTED':
                return (
                    <button
                        className="ip-card-action-button reason-button"
                        onClick={(e) => handleCheckReason(e, patent.ip_id)}
                        title="Check Rejection Reason"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Check Reason
                    </button>
                );

            case 'APPROVED':
                return (
                    <button
                        className="ip-card-action-button tokenize-button"
                        onClick={(e) => handleTokenize(e, patent.ip_id)}
                        title="Tokenize Patent"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="m4.93 4.93 1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="m17.66 17.66 1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="m6.34 17.66-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="m19.07 4.93-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Tokenize
                    </button>
                );

            case 'MINTED':
                return (
                    <>
                        <button
                            className="ip-card-action-button tx-details-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/listing/tx-info?id=${patent.ip_id}`);
                            }}
                            title="View Transaction Details"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Tx Details
                        </button>
                    </>
                );

            case 'SUBMITTED':
            case 'LISTED':
            default:
                return null;
        }
    };
    if (Ip.length === 0) {
        return <div className='pc-list'>
            <p>No intellectual properties found.</p>
        </div>
    }

    return (
        <div className="pc-list">
            {Ip.map((patent, idx) => (
                <article key={patent._id?.$oid || idx} className="patent-card" onClick={() => router.push(`/listing/editor?id=${patent.ip_id}`)}>
                    <header className="pc-header">
                        <div className="pc-title">
                            <h3>{patent.title || 'Untitled'}</h3>
                            <p className="muted">App No: <span className="semi">{patent.applicationNo}</span></p>
                        </div>

                        <div className="pc-meta">
                            <p className={`status ${patent.status?.toLowerCase() || 'draft'}`}>{patent.status}</p>
                            <p className="muted small">{patent.jurisdiction || '—'}</p>
                        </div>
                    </header>

                    <section className="pc-grid">
                        <div>
                            <div className="muted small">Filing date</div>
                            <div className="semi">{formatDate(patent.filingDate)}</div>
                        </div>

                        <div>
                            <div className="muted small">Created</div>
                            <div className="semi">{formatDate(patent.createdAt?.['$date'] || patent.createdAt)}</div>
                        </div>

                        <div>
                            <div className="muted small">Applicants</div>
                            <div className="semi truncate">{formatApplicants(patent.applicants)}</div>
                        </div>

                        <div>
                            <div className="muted small">IPC</div>
                            <div className="semi">{formatIpcClasses(patent.ipcClasses)}</div>
                        </div>
                    </section>

                    <section className="pc-actions">
                        <div className="ownership">
                            {patent.ownershipVerified ? (
                                <svg className="check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg className="dot" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            )}
                            <span className="muted small">{patent.ownershipVerified ? 'Ownership verified' : 'Ownership unverified'}</span>
                        </div>

                        <div className="links">
                            {getStatusButton(patent)}
                            {patent.file?.url ? (
                                <a href={patent.file.url} target="_blank" rel="noreferrer" className="link">View file</a>
                            ) : (
                                <span className="muted small">No file</span>
                            )}
                        </div>
                    </section>

                    {patent.orgId && (
                        <footer className="pc-footer muted small">Organization: {patent.orgId}</footer>
                    )}
                </article>
            ))}
        </div>
    );
}