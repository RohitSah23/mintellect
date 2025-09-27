
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadToFilebase } from '../../../../utils/ipfs';
import { IpMetadata } from '../../types/types';

export const getIpByOrg = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const orgId = req.params.orgId;
    const user = (req as any).user;

    try {
        // Optional: org membership check
        // if (!user.orgIds?.includes(orgId)) {
        //     res.status(403).json({ error: 'unauthorized access' });
        //     return;
        // }

        const ips = await db.collection("ip_metadata")
            .find({
                orgId,
                status: { $ne: "DRAFT" } // exclude drafts
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            message: "Patents fetched successfully (excluding drafts)",
            data: ips
        });
    } catch (err) {
        console.error("getIpByOrg error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const verifyIp = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const { status, reason, org_id, ip_id } = req.body;
    const user = (req as any).user;

    try {
        if (!["APPROVED", "REJECTED"].includes(status)) {
            res.status(400).json({ error: "Invalid status, must be APPROVED or REJECTED" });
            return;
        }

        // Update ip_metadata status
        const ipDoc = await db.collection("ip_metadata").findOneAndUpdate(
            { ip_id: ip_id, orgId: org_id },
            { $set: { status } },
            { returnDocument: "after" }
        );

        if (!ipDoc) {
            res.status(404).json({ error: "IP record not found" });
            return;
        }

        // Insert verification record
        const verificationRecord = {
            orgId: org_id,
            ip_id: ip_id,
            status,
            reason: status === "REJECTED" ? reason || "No reason provided" : null,
            signature: '',
            verifiedBy: user.uid,
            verifiedAt: new Date()
        };

        await db.collection("ip_verifications").insertOne(verificationRecord);

        res.status(200).json({
            message: `IP ${status.toLowerCase()} successfully`,
            data: {
                ip: ipDoc.value,
                verification: verificationRecord
            }
        });
    } catch (err) {
        console.error("verifyIp error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

