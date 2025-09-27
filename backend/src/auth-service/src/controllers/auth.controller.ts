
import { Request, Response } from 'express';
import crypto from 'crypto';
import { Wallet } from 'ethers';

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { v7 as uuidv7 } from 'uuid';

dotenv.config();

const isEmail = (val: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
// Custodial wallet creation using ethers.js
async function createCustodialWallet(db: any, uid: any): Promise<string> {
    const wallet = Wallet.createRandom();
    // Optionally, store wallet.privateKey securely if you need to manage funds
    await db.collection('wallets').insertOne({ uid, walletInfo: { address: wallet.address, privateKey: wallet.privateKey, provider: 'ethers' } });
    return wallet.address;
}
// Helper to send OTP (replace with SMS/email integration)
function sendOtpToUser(contact: string, otp: string): void {
    // For demo: just log. Replace with SMS/email API.
    console.log(`Send OTP ${otp} to ${contact}`);
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const { phone, email, isLogin } = req.body;
    console.log(req.body)
    // Input validation
    if (!email && !phone) {
        res.status(400).json({ error: "Phone or email required for OTP." })
        return;
    }

    if (email && !isEmail(email)) {
        res.status(400).json({ error: "Invalid email format." });
        return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
        res.status(400).json({ error: "Invalid phone number." });
        return;
    }
    const contact = email || phone;
    if (isLogin) {
        try {
            const user = await db
                .collection("accounts")
                .findOne({ $or: [{ email }, { phone }] });
            console.log(user)

            if (!user) {
                res.status(404).json({ error: "User not found." })
                return;
            }
        } catch (dbErr) {
            console.error("DB error:", dbErr);
            res.status(500).json({ error: "Database query failed." })
            return;
        }
    }

    // Generate OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 min expiry

    // Remove any previous OTP for this contact
    await db.collection('otps').deleteMany({ contact });
    // Store OTP in DB
    await db.collection('otps').insertOne({ contact, otp, expires, verified: false });
    sendOtpToUser(contact, otp);
    res.status(200).json({ message: 'OTP sent.' });
};

// OTP-based login
export const login = async (req: Request, res: Response): Promise<void> => {
    const db = req.app.locals.db;
    const { email, phone, otp } = req.body;
    const contact = phone || email;
    if (!contact || !otp) {
        res.status(400).json({ error: 'Contact and OTP required.' });
        return;
    }
    const record = await db.collection('otps').findOne({ contact });
    if (!record || record.otp !== otp) {
        res.status(401).json({ error: 'Invalid OTP.' });
        return;
    }
    if (Date.now() > record.expires) {
        res.status(410).json({ error: 'OTP expired.' });
        return;
    }
    // Mark OTP as verified in DB
    await db.collection('otps').updateOne({ contact }, { $set: { verified: true } });
    // Check OTP
    const otpRecord = await db.collection('otps').findOne({ contact });
    if (!otpRecord || otpRecord.otp !== otp || !otpRecord.verified) {
        res.status(401).json({ error: 'Invalid or unverified OTP.' });
        return;
    }
    // Find user by email or phone
    const user = await db.collection('accounts').findOne({ $or: [{ email }, { phone }] });
    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }
    // Issue JWT
    const token = jwt.sign({ uid: user.uid, name: user.name || user.orgName, ip: req.ip }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
    res.cookie("mintellect_token", token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 * 24 * 30,
        secure: false
    });
    res.status(200).json({ message: "Login successful" });
};

export const authMe = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    // console.log(user);
    const db = req.app.locals.db;
    try {
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const userData = await db.collection('accounts').findOne({ uid: user.uid });
        if (!userData) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        const { name, email, uid, walletAddress, role, phone, org_id } = userData;
        const data = { name, email, uid, walletAddress, role, phone, org_id };

        // console.log(data); // 🔥 Now you can access uid safely
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

