

// src/controllers/ipController.ts

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadToFilebase } from '../../../../utils/ipfs';
import { Readable } from 'stream';
import { IpMetadata } from '../../types/types';
import { ethers } from 'ethers';

export const ListingIP = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    console.log(req.body);
    try {
        const {
            uid,
            applicationNo,
            jurisdiction,
            title,
            abstract,
            filingDate,
            applicants,
            ipcClasses,
            ownershipVerified,
            status,
            orgId,
            signature
        } = req.body;

        if (!uid || !jurisdiction || !title || !abstract) {
            res.status(400).json({ error: 'Missing required fields: uid, jurisdiction, title or abstract' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'PDF file is required' });
            return;
        }

        // validate orgId if provided
        if (orgId && orgId !== '') {
            if (!/^ORG-\d{16}$/.test(orgId)) {
                res.status(400).json({ error: 'Invalid orgId format. Expect ORG-16digits' });
                return;
            }
            try {
                const orgExists = await db.collection('accounts').findOne({ org_id: orgId });
                if (!orgExists) {
                    res.status(400).json({ error: 'orgId not found' });
                    return;
                }
            } catch (dbErr) {
                console.error('Org lookup error:', dbErr);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
        }

        let pdfCid: string | null = null;
        let pdfUrl: string | null = null;

        try {
            const uploadResult = await uploadToFilebase(req.file);
            pdfCid = uploadResult.ipfsHash ?? null;
            pdfUrl = uploadResult.ipfsUrl ?? null;
            console.log(`PDF uploaded to IPFS: ${pdfCid}`);
        } catch (uploadError: any) {
            console.error('PDF upload failed:', uploadError);
            res.status(500).json({
                error: 'Failed to upload PDF to IPFS',
                details: uploadError?.message ?? String(uploadError)
            });
            return;
        }

        const assignedApplicationNo =
            applicationNo && applicationNo.trim() !== '' ? applicationNo : `TEMP-${uuidv4()}`;

        const ownershipFlag = ownershipVerified === true || ownershipVerified === 'true';
        const draftStatus = status && typeof status === 'string' ? status : 'draft';
        const filingDateIso = filingDate ? new Date(filingDate).toISOString() : '';

        const patentDraft: IpMetadata & { createdAt?: number; updatedAt?: number } = {
            uid,
            ip_id: `ip_${uuidv4()}`,
            applicationNo: assignedApplicationNo,
            jurisdiction,
            title,
            abstract,
            filingDate: filingDateIso,
            applicants: applicants ?? '',
            ipcClasses: ipcClasses ?? '',
            file: {
                name: req.file.originalname,
                mimeType: req.file.mimetype,
                cid: pdfCid ?? '',
                url: pdfUrl ?? ''
            },
            ownershipVerified: ownershipFlag,
            signature: signature ?? '',
            status: draftStatus,
            orgId: orgId ?? '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.collection('ip_metadata').insertOne(patentDraft);

        res.status(201).json({
            message: 'Patent draft stored successfully',
            data: patentDraft
        });
    } catch (err) {
        console.error('Upload Patent Draft error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const EditIP = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const ip_id = req.params.id; // Get patent ID from URL params
    console.log('Edit request body:', req.body);
    console.log('Edit request file:', req.file);

    try {
        const {
            uid,
            applicationNo,
            jurisdiction,
            title,
            abstract,
            filingDate,
            applicants,
            ipcClasses,
            ownershipVerified,
            status,
            orgId,
            signature
        } = req.body;

        // Validation
        if (!uid || !jurisdiction || !title || !abstract) {
            res.status(400).json({ error: 'Missing required fields: uid, jurisdiction, title or abstract' });
            return;
        }

        if (!ip_id) {
            res.status(400).json({ error: 'Patent ID is required' });
            return;
        }

        // Check if patent exists and belongs to user
        const existingPatent = await db.collection('ip_metadata').findOne({
            ip_id: ip_id,
            uid: uid
        });

        if (!existingPatent) {
            res.status(404).json({ error: 'Patent not found or access denied' });
            return;
        }





        // Handle file upload (optional for edit)
        let fileData = existingPatent.file; // Keep existing file by default

        if (req.file) {
            try {
                const uploadResult = await uploadToFilebase(req.file);
                fileData = {
                    name: req.file.originalname,
                    mimeType: req.file.mimetype,
                    cid: uploadResult.ipfsHash ?? '',
                    url: uploadResult.ipfsUrl ?? ''
                };
                console.log(`New PDF uploaded to IPFS: ${uploadResult.ipfsHash}`);
            } catch (uploadError: any) {
                console.error('PDF upload failed:', uploadError);
                res.status(500).json({
                    error: 'Failed to upload PDF to IPFS',
                    details: uploadError?.message ?? String(uploadError)
                });
                return;
            }
        }

        const ownershipFlag = ownershipVerified === true || ownershipVerified === 'true';
        const updatedStatus = status && typeof status === 'string' ? status : existingPatent.status;
        const filingDateIso = filingDate ? new Date(filingDate).toISOString() : existingPatent.filingDate;

        const updateData = {
            applicationNo: applicationNo || existingPatent.applicationNo,
            jurisdiction,
            title,
            abstract,
            filingDate: filingDateIso,
            applicants: applicants,
            ipcClasses: ipcClasses,
            file: fileData,
            ownershipVerified: ownershipFlag,
            signature: signature ?? existingPatent.signature,
            status: updatedStatus,
            orgId: orgId ?? existingPatent.orgId,
            updatedAt: Date.now()
        };

        const result = await db.collection('ip_metadata').updateOne(
            { ip_id: ip_id, uid: uid },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Patent not found or access denied' });
            return;
        }

        // Get updated document
        const updatedPatent = await db.collection('ip_metadata').findOne({ ip_id: ip_id });

        res.status(200).json({
            message: 'Patent updated successfully',
            data: updatedPatent
        });

    } catch (err) {
        console.error('Edit Patent error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getIpListByUid = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const uid = req.params.uid;
    const user = (req as any).user;

    try {
        if (user.uid !== uid) {
            res.status(400).json({ error: 'unauthorized access' });
            return;
        }

        const drafts = await db.collection('ip_metadata').find({ uid: user.uid }).sort({ createdAt: -1 }).toArray();
        console.log(drafts);

        res.status(200).json({
            message: 'Patent drafts fetched successfully',
            data: drafts
        });
    } catch (err) {
        console.error('get patent drafts error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const submitIp = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const id = req.params.id;
    const user = (req as any).user;

    try {
        const draft = await db.collection('ip_metadata').findOne({ ip_id: id });
        if (!draft) {
            res.status(404).json({ error: 'Patent draft not found' });
            return;
        }

        // Ownership check
        if (draft.uid !== user.uid) {
            res.status(403).json({ error: 'You are not authorized to submit this draft' });
            return;
        }

        // Update status to SUBMITTED
        const updated = await db.collection('ip_metadata').findOneAndUpdate(
            { ip_id: id },
            { $set: { status: 'SUBMITTED', updatedAt: Date.now() } },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            message: 'Patent draft submitted successfully',
            data: updated.value
        });
    } catch (err) {
        console.error('submit patent draft error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getIpById = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const id = req.params.id;
    const user = (req as any).user;

    try {
        const draft = await db.collection('ip_metadata').findOne({ ip_id: id });
        if (!draft) {
            res.status(404).json({ error: 'Patent draft not found' });
            return;
        }

        res.status(200).json({
            message: 'Patent draft fetched successfully',
            data: draft
        });
    } catch (err) {
        console.error('get patent draft error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};