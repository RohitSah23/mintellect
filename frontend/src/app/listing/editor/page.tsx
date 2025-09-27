"use client";

import React, { useEffect, useState } from 'react';
import "./style.css";
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/context/alertContext';

interface Organization {
    org_id: string;
    orgName: string;
    type?: string; // e.g., "University", "Corporation", "Research Institute"
}

export default function NewPatent() {
    const router = useRouter();
    const { user, authStatus } = useAuth();
    const alert = useAlert();

    const [formData, setFormData] = useState<IPMetadata>({
        uid: user?.uid || '',
        applicationNo: '',
        jurisdiction: 'IN',
        title: '',
        abstract: '',
        filingDate: '',
        applicants: [`${user?.walletAddress}`], // array of strings
        ipcClasses: [],
        pdfFile: null,
        ownershipVerified: false,
        status: 'DRAFT',
        orgId: '',
        signature: ''
    });
    const [applicantInput, setApplicantInput] = useState('');
    const [applicantList, setApplicantList] = useState<string[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof IPMetadata, string>>>({});
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpStatus, setOtpStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [patentId, setPatentId] = useState<string | null>(null);
    // Organization-related states
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState('');
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const [orgValidationStatus, setOrgValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');


    // Uncomment these if you want to handle auth redirection
    // if (authStatus === 'pending') return (<p>Loading...</p>);
    // if (authStatus === 'failed') {
    //     router.push('/login');
    //     return null;
    // }
    // if (!user) return null;
    useEffect(() => {
        // Check if we're in edit mode by looking for patent data in router query or props
        const searchParams = new URLSearchParams(window.location.search);
        const editPatentId = searchParams.get('id');

        if (editPatentId) {
            setIsEditMode(true);
            setPatentId(editPatentId);
            loadPatentData(editPatentId);
        }
    }, []);

    useEffect(() => {
        if (user?.uid) {
            setFormData(prev => ({
                ...prev,
                uid: user.uid
            }));
        }
    }, [user?.uid]);
    useEffect(() => {
        if (user?.walletAddress && applicantList.length === 0) {
            setApplicantList([user.walletAddress]);
            setFormData(prev => ({
                ...prev,
                applicants: [user.walletAddress]
            }));
        }
    }, [user?.walletAddress, applicantList.length]);

    // Load organizations on component mount
    useEffect(() => {
        loadOrganizations();
    }, []);


    const loadPatentData = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/getipbyid/${id}`, {
                withCredentials: true
            });

            const patentData = response.data.data;

            // Populate form with existing data
            setFormData({
                uid: patentData.uid || user?.uid || '',
                applicationNo: patentData.applicationNo || '',
                jurisdiction: patentData.jurisdiction || 'IN',
                title: patentData.title || '',
                abstract: patentData.abstract || '',
                filingDate: patentData.filingDate || '',
                applicants: patentData.applicants || [],
                ipcClasses: patentData.ipcClasses || [],
                pdfFile: null, // Keep as null, user will need to re-upload if changing
                ownershipVerified: patentData.ownershipVerified || false,
                status: patentData.status || 'DRAFT',
                orgId: patentData.orgId || '',
                signature: patentData.signature || ''
            });

            // Set applicant list and organization data
            setApplicantList(patentData.applicants || []);
            if (patentData.orgId) {
                const org = organizations.find(o => o.org_id === patentData.orgId);
                if (org) {
                    setSelectedOrganization(org);
                    setOrgSearchQuery(org.orgName);
                    setOrgValidationStatus('valid');
                }
            }

        } catch (err) {
            console.error('Failed to load patent data:', err);
            alert.error('Failed to load patent data for editing.');
            //router.push('/listing'); // Redirect back if loading fails
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formData.orgId && organizations.length > 0) {
            const org = organizations.find(o => o.org_id === formData.orgId);
            if (org) {
                setSelectedOrganization(org);
                setOrgSearchQuery(org.orgName);
                setOrgValidationStatus('valid');
            }
        }
    }, [selectedOrganization, organizations]);



    // Function to load organizations from API
    const loadOrganizations = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/orgs`, {
                withCredentials: true
            });
            console.log('Organizations loaded:', response.data);
            setOrganizations(response.data.data || []);
        } catch (err) {
            console.error('Failed to load organizations:', err);
            // Fallback to sample organizations for development
            setOrganizations([
                { org_id: 'ORG001', orgName: 'Indian Institute of Technology', type: 'University' },
                { org_id: 'ORG002', orgName: 'Tata Consultancy Services', type: 'Corporation' },
                { org_id: 'ORG003', orgName: 'Council of Scientific and Industrial Research', type: 'Research Institute' },
                { org_id: 'ORG004', orgName: 'Indian Space Research Organisation', type: 'Government' },
                { org_id: 'ORG005', orgName: 'Infosys Limited', type: 'Corporation' }
            ]);
        }
    };

    // Function to validate organization ID
    const validateOrgId = async (orgId: string): Promise<boolean> => {
        if (!orgId.trim()) return false;

        setOrgValidationStatus('validating');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/orgs/validate/${orgId}`, {
                withCredentials: true
            });
            const isValid = response.data?.exists === true;
            setOrgValidationStatus(isValid ? 'valid' : 'invalid');
            return isValid;
        } catch (err) {
            console.error('Organization validation error:', err);
            // Fallback validation for development
            const isValid = organizations.some(org => org.org_id === orgId);
            setOrgValidationStatus(isValid ? 'valid' : 'invalid');
            return isValid;
        }
    };

    // Debounced organization validation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.orgId && !selectedOrganization) {
                validateOrgId(formData.orgId);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.orgId, selectedOrganization, organizations]);

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter(org =>
        org.orgName.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
        org.org_id.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'applicants') {
            setApplicantInput(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (errors[name as keyof IPMetadata]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle organization search input
    const handleOrgSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOrgSearchQuery(value);
        setShowOrgDropdown(true);
        setSelectedOrganization(null);
        setOrgValidationStatus('idle');
        setFormData(prev => ({
            ...prev,
            orgId: value
        }));
    };

    // Handle organization selection (use mousedown to avoid blur closing dropdown before click)
    const handleOrganizationSelect = (org: Organization) => {
        setSelectedOrganization(org);
        setOrgSearchQuery(org.orgName);
        setFormData(prev => ({
            ...prev,
            orgId: org.org_id
        }));
        setTimeout(() => setShowOrgDropdown(false), 0);
        setOrgValidationStatus('valid');
        if (errors.orgId) {
            setErrors(prev => ({
                ...prev,
                orgId: ''
            }));
        }
    };

    // Add applicant to list
    const handleAddApplicant = () => {
        const val = applicantInput.trim();
        if (val && !applicantList.includes(val)) {
            setApplicantList(prev => [...prev, val]);
            setApplicantInput('');
        }
    };

    // Remove applicant from list
    const handleRemoveApplicant = (name: string) => {
        setApplicantList(prev => prev.filter(a => a !== name));
    };

    // Update formData.applicants when applicantList changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, applicants: applicantList }));
    }, [applicantList]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            pdfFile: file
        }));
        // Clear file error if file is selected
        if (file && errors.pdfFile) {
            setErrors(prev => ({
                ...prev,
                pdfFile: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof IPMetadata, string>> = {};

        if (!formData.applicationNo.trim()) newErrors.applicationNo = 'Application No. is required';
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.abstract.trim()) newErrors.abstract = 'Abstract is required';
        if (!formData.filingDate.trim()) newErrors.filingDate = 'Filing Date is required';
        if (applicantList.length === 0) newErrors.applicants = 'At least one applicant is required';
        if (!formData.ipcClasses || formData.ipcClasses.length === 0) newErrors.ipcClasses = 'IPC/CPC classes are required';
        if (!formData.pdfFile && !isEditMode) newErrors.pdfFile = 'Published spec PDF is required';
        if (!formData.orgId.trim()) {
            newErrors.orgId = 'Organization is required';
        } else if (orgValidationStatus === 'invalid') {
            newErrors.orgId = 'Invalid organization ID';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = async () => {
        if (formData.status !== 'DRAFT') return;
        if (!formData.ownershipVerified) {
            alert.warn('Please verify ownership before saving the draft.');
            return;
        }

        if (formData.orgId && orgValidationStatus !== 'valid') {
            const isValid = await validateOrgId(formData.orgId);
            if (!isValid) {
                setErrors(prev => ({ ...prev, orgId: 'Invalid organization ID' }));
                return;
            }
        }

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const form = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'pdfFile' && value) {
                    form.append('file', value as File);
                } else if (key === 'applicants' || key === 'ipcClasses') {
                    if (Array.isArray(value)) {
                        value.forEach(item => form.append(`${key}[]`, String(item)));
                    }
                } else if (value !== null && value !== undefined) {
                    form.append(key, String(value));
                }
            });

            const url = isEditMode
                ? `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/listing/edit/${patentId}`
                : `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/listing`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url,
                data: form,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            console.log('Draft saved successfully:', response.data);
            setPatentId(response.data.data.ip_id);
            alert.success('Draft saved successfully!');
        } catch (err: any) {
            console.error('Save Draft error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to save draft.';
            alert.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async () => {
        if (formData.status !== 'DRAFT') return;
        if (!formData.ownershipVerified) {
            alert.warn('Please verify ownership before submitting.');
            return;
        }

        if (formData.orgId && orgValidationStatus !== 'valid') {
            const isValid = await validateOrgId(formData.orgId);
            if (!isValid) {
                setErrors(prev => ({ ...prev, orgId: 'Invalid organization ID' }));
                return;
            }
        }

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const form = new FormData();

            // Append all form data
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'pdfFile' && value) {
                    form.append('file', value as File);
                } else if (key === 'applicants' || key === 'ipcClasses') {
                    if (Array.isArray(value)) {
                        value.forEach(item => form.append(key, String(item)));
                    } else {
                        form.append(key, String(value));
                    }
                } else if (value !== null && value !== undefined) {
                    form.append(key, String(value));
                }
            });

            // Set status to SUBMITTED for final submission
            form.set('status', 'SUBMITTED');

            const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/tokenize/listing/submit/${patentId}`;

            const method = 'PUT';

            const response = await axios({
                method,
                url,
                data: form,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            console.log('Patent submitted successfully:', response.data);
            alert.success(`Patent ${isEditMode ? 'updated' : 'submitted'} successfully!`);
            router.push('/'); // Redirect to patents list

        } catch (err: any) {
            console.error('Submit error:', err);
            const errorMessage = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'submit'} patent.`;
            alert.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const sendOtp = async () => {
        if (!user?.email && !user?.phone) {
            setOtpStatus('User email or phone not available.');
            return;
        }

        setOtpStatus('');
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/send-otp`, {
                email: user?.email,
                phone: user?.phone
            }, {
                withCredentials: true
            });

            console.log('OTP sent:', response.data);
            setOtpSent(true);
            setOtpStatus('OTP sent to applicant email/phone.');
        } catch (err: any) {
            console.error('Send OTP error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to send OTP.';
            setOtpStatus(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp.trim()) {
            setOtpStatus('Please enter OTP.');
            return;
        }

        setOtpStatus('');
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/verify-otp`, {
                email: user?.email,
                phone: user?.phone,
                otp: otp.trim()
            }, {
                withCredentials: true
            });

            console.log('OTP verified:', response.data);
            setFormData(prev => ({ ...prev, ownershipVerified: true }));
            setOtpStatus('Ownership verified successfully!');
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to verify OTP. Please check the OTP and try again.';
            setOtpStatus(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            uid: user?.uid ?? '',
            applicationNo: '',
            jurisdiction: 'IN',
            title: '',
            abstract: '',
            filingDate: '',
            applicants: [`${user?.walletAddress}`],
            ipcClasses: [],
            pdfFile: null,
            ownershipVerified: false,
            status: 'DRAFT',
            orgId: '',
            signature: ''
        });
        setApplicantList([]);
        setApplicantInput('');
        setErrors({});
        setOtp('');
        setOtpSent(false);
        setOtpStatus('');
        setSelectedOrganization(null);
        setOrgSearchQuery('');
        setShowOrgDropdown(false);
        setOrgValidationStatus('idle');
    };


    return (
        <div className="form-container">
            <div className="form-header">
                <h1 className="form-title">
                    {isEditMode ? 'Edit Patent Listing' : 'New Patent Listing'}
                </h1>
                <p className="form-subtitle">
                    {isEditMode ? 'Update your patent application details' : 'Create a draft listing for your patent application'}
                </p>
            </div>
            <form className="ip-form" onSubmit={e => e.preventDefault()}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="applicationNo" className="form-label">Patent Application No. *</label>
                        <input
                            type="text"
                            id="applicationNo"
                            name="applicationNo"
                            value={formData.applicationNo}
                            onChange={handleInputChange}
                            className={`form-input ${errors.applicationNo ? 'error' : ''}`}
                            placeholder="Enter application number"
                        />
                        {errors.applicationNo && <span className="error-message">{errors.applicationNo}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="jurisdiction" className="form-label">Jurisdiction *</label>
                        <select
                            id="jurisdiction"
                            name="jurisdiction"
                            value={formData.jurisdiction}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="IN">India</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="organization" className="form-label">Organization *</label>
                        <div className="organization-search-wrapper">
                            <input
                                type="text"
                                id="organization"
                                name="organization"
                                value={orgSearchQuery}
                                onChange={handleOrgSearchChange}
                                onFocus={() => setShowOrgDropdown(true)}
                                onBlur={e => {
                                    // Only close dropdown if not clicking on dropdown
                                    setTimeout(() => {
                                        if (!document.activeElement || !document.activeElement.classList.contains('organization-option')) {
                                            setShowOrgDropdown(false);
                                        }
                                    }, 120);
                                }}
                                className={`form-input ${errors.orgId ? 'error' : ''} ${orgValidationStatus === 'valid' ? 'valid' :
                                    orgValidationStatus === 'invalid' ? 'error' : ''
                                    }`}
                                placeholder="Search organizations or enter Organization ID"
                                autoComplete="off"
                            />
                            <div className="org-validation-indicator">
                                {orgValidationStatus === 'validating' && <span className="validating">⏳</span>}
                                {orgValidationStatus === 'valid' && <span className="valid">✓</span>}
                                {orgValidationStatus === 'invalid' && <span className="invalid">✗</span>}
                            </div>
                            {showOrgDropdown && filteredOrganizations.length > 0 && (
                                <div className="organization-dropdown">
                                    {filteredOrganizations.map(org => (
                                        <div
                                            key={org.org_id}
                                            className="organization-option"
                                            onMouseDown={() => handleOrganizationSelect(org)}
                                        >
                                            <div className="org-name">{org.orgName}</div>
                                            <div className="org-details">
                                                <span className="org-id">ID: {org.org_id}</span>
                                                {org.type && <span className="org-type">{org.type}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedOrganization && (
                            <div className="selected-organization">
                                <strong>{selectedOrganization.orgName}</strong> (ID: {selectedOrganization.org_id})
                            </div>
                        )}
                        {errors.orgId && <span className="error-message">{errors.orgId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            placeholder="Enter patent title"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="abstract" className="form-label">Abstract *</label>
                        <textarea
                            id="abstract"
                            name="abstract"
                            value={formData.abstract}
                            onChange={handleInputChange}
                            className={`form-textarea ${errors.abstract ? 'error' : ''}`}
                            placeholder="Enter abstract"
                            rows={3}
                        />
                        {errors.abstract && <span className="error-message">{errors.abstract}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">IPC/CPC Classes *</label>
                        <div className="checkbox-group">
                            {[
                                { value: "A", label: "A - Human Necessities" },
                                { value: "B", label: "B - Performing Operations; Transporting" },
                                { value: "C", label: "C - Chemistry; Metallurgy" },
                                { value: "D", label: "D - Textiles; Paper" },
                                { value: "E", label: "E - Fixed Constructions" },
                                { value: "F", label: "F - Mechanical Engineering; Lighting; Heating" },
                                { value: "G", label: "G - Physics" },
                                { value: "H", label: "H - Electricity" },
                            ].map(opt => (
                                <label key={opt.value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={formData.ipcClasses?.includes(opt.value) || false}
                                        onChange={e => {
                                            const checked = e.target.checked;
                                            setFormData(prev => {
                                                const current = prev.ipcClasses || [];
                                                return {
                                                    ...prev,
                                                    ipcClasses: checked
                                                        ? [...current, opt.value]
                                                        : current.filter(v => v !== opt.value),
                                                };
                                            });
                                            if (errors.ipcClasses) {
                                                setErrors(prev => ({ ...prev, ipcClasses: "" }));
                                            }
                                        }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                        {errors.ipcClasses && (
                            <span className="error-message">{errors.ipcClasses}</span>
                        )}
                    </div>



                    <div className="form-group">
                        <label htmlFor="filingDate" className="form-label">Filing Date *</label>
                        <input
                            type="date"
                            id="filingDate"
                            name="filingDate"
                            value={formData.filingDate}
                            onChange={handleInputChange}
                            className={`form-input ${errors.filingDate ? 'error' : ''}`}
                        />
                        {errors.filingDate && <span className="error-message">{errors.filingDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="applicants" className="form-label">Applicants *</label>
                        <div className="applicants-search">
                            <input
                                type="text"
                                id="applicants"
                                name="applicants"
                                value={applicantInput}
                                onChange={handleInputChange}
                                className={`form-input ${errors.applicants ? 'error' : ''}`}
                                placeholder="Enter applicants wallet address"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddApplicant();
                                    }
                                }}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="add-applicant-btn"
                                onClick={handleAddApplicant}
                                disabled={!applicantInput.trim()}
                            >
                                Add
                            </button>
                        </div>
                        <div className="applicant-list">
                            {applicantList.map(name => (
                                <span key={name} className="applicant-chip">
                                    {name}
                                    <button
                                        type="button"
                                        className="remove-applicant-btn"
                                        onClick={() => handleRemoveApplicant(name)}
                                        aria-label={`Remove ${name}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        {errors.applicants && <span className="error-message">{errors.applicants}</span>}
                    </div>


                    {formData.status === 'DRAFT' && <div className="form-group">
                        <label htmlFor="pdfFile" className="form-label">Published PDF *</label>
                        <div className="pdf-upload-wrapper">
                            <label htmlFor="pdfFile" className="pdf-upload-label">Choose PDF</label>
                            <input
                                type="file"
                                id="pdfFile"
                                name="pdfFile"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className={`pdf-file-input ${errors.pdfFile ? 'error' : ''}`}
                            />
                            {formData.pdfFile && <span className="pdf-file-name">{formData.pdfFile.name}</span>}
                        </div>
                        {errors.pdfFile && <span className="error-message">{errors.pdfFile}</span>}
                    </div>}
                    {!formData.ownershipVerified && (
                        <div className="ownership-verification-section">
                            <h3>Ownership Verification</h3>
                            <p>Please verify your ownership before saving the draft.</p>
                            <button
                                type="button"
                                onClick={sendOtp}
                                className="btn btn-secondary"
                                disabled={isLoading || otpSent}
                            >
                                {isLoading ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send Verification OTP'}
                            </button>

                            {otpSent && (
                                <div className="otp-verification">
                                    <div className="form-group">
                                        <label htmlFor="otp" className="form-label">Enter OTP</label>
                                        <input
                                            type="text"
                                            id="otp"
                                            name="otp"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            className="form-input"
                                            maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                        />
                                        <button
                                            type="button"
                                            onClick={verifyOtp}
                                            className="btn btn-primary"
                                            disabled={otp.length < 4 || isLoading}
                                        >
                                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {otpStatus && (
                                <div className={`status-message ${formData.ownershipVerified ? 'success' : 'error'}`}>
                                    {otpStatus}
                                </div>
                            )}
                        </div>
                    )}

                    {formData.ownershipVerified && (
                        <div className="success-message">
                            ✓ Ownership verified! You can now Proceed.
                        </div>
                    )}
                </div>

                {/* OTP Section */}

                {formData.status === 'DRAFT' && <div className="form-actions">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="btn btn-secondary"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="btn btn-secondary"
                        disabled={isLoading || !formData.ownershipVerified}
                        title={!formData.ownershipVerified ? 'Please verify ownership first' : 'Save as draft'}
                    >
                        {isLoading ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={isLoading || !formData.ownershipVerified}
                        title={!formData.ownershipVerified ? 'Please verify ownership first' : 'Submit patent application'}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Patent'}
                    </button>
                </div>}
            </form>
        </div>
    );
}