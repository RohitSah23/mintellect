interface File {
    name: string;
    mimeType: string;
    cid: string;
    url: string;
}
interface IPMetadata {
    ip_id?: string;
    uid: string;
    applicationNo: string;
    jurisdiction: string;
    title: string;
    file?: File | null;
    abstract: string;
    filingDate: string;
    applicants: string[];
    ipcClasses: string[];
    pdfFile: File | null;
    ownershipVerified: boolean;
    status: 'DRAFT' | 'LISTED' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'MINTED';
    orgId: string;
    signature: string;
    createdAt?: number;
    updatedAt?: number;
}