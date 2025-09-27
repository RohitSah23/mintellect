import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthenticatedRequest extends Request {
    user?: JwtPayload | string;
}

export const authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies?.mintellect_token;
    // console.log(req.cookies)

    if (!token) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Optionally check IP address
        if (decoded.ip && decoded.ip !== req.ip) {
            res.status(403).json({ error: 'Forbidden: IP mismatch' });
            return;
        }

        req.user = decoded; // Attach decoded token to request
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};
