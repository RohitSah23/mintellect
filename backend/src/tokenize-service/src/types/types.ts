export enum IpType {
    PATENT = 'patent',
    TRADEMARK = 'trademark',
    COPYRIGHT = 'copyright',
    TRADE_SECRET = 'trade_secret',
    DESIGN = 'design'
}
interface File {
    name: string;
    mimeType: string;
    cid: string;
    url: string;
}

export interface IpMetadata {
    uid: string;              // Unique identifier for the user who created this draft
    applicationNo: string;    // Patent application number (assigned or temporary)
    ip_id: string;
    jurisdiction: string;     // Country/region where the patent is filed (e.g., "IN", "US")
    title: string;            // Title of the invention
    abstract: string;         // Short summary of the invention
    filingDate: string;       // Filing date in ISO string format (e.g., "2025-09-09")
    applicants: string[];       // Names of applicants (could be single or comma-separated string)
    ipcClasses: string[];       // IPC (International Patent Classification) codes, e.g., "A01B 1/00"
    file: File | null;     // Uploaded draft specification document as a File object, or null if not uploaded
    ownershipVerified: boolean; // Flag showing if applicant’s ownership was verified
    status: string;           // Current status of the draft (e.g., "draft", "approved", "rejected","listed")
    orgId: string;
    signature: string;
    createdAt: number;
    updatedAt: number;
}
