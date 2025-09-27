import { Request, Response } from "express";

// GET org name by orgId
export const getOrgs = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;

    try {
        const orgs = await db.collection("accounts")
            .find({ org_id: { $exists: true, $ne: null } })
            .toArray();

        if (orgs.length === 0) {
            res.status(404).json({ error: "No organizations found" });
            return;
        }

        res.status(200).json({
            message: "Organizations fetched successfully",
            data: orgs.map((org: { org_id: any; orgName: any; }) => ({
                org_id: org.org_id,
                orgName: org.orgName
            }))
        });
    } catch (err) {
        console.error("getOrgs error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Validate if org exists
export const validateOrg = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const { orgId } = req.body;

    if (!orgId) {
        res.status(400).json({ error: "orgId is required" });
        return;
    }

    try {
        const org = await db.collection("accounts").findOne({ org_id: orgId });

        if (!org) {
            res.status(200).json({ valid: false, message: "Invalid orgId" });
            return;
        }

        res.status(200).json({ valid: true, message: "Valid orgId", data: { orgName: org.orgName } });
    } catch (err) {
        console.error("validateOrg error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
