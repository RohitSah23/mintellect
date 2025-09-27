import { Router } from 'express';
import { authMe, login, logout, sendOtp, signup, verifyOtp } from '../controllers/auth.controller';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middleware/auth.midleware';
import dotenv from 'dotenv';
import cors from 'cors';
import { getOrgs, validateOrg } from '../controllers/org';

const router = Router();
dotenv.config();

router.use(cookieParser());
router.post('/signup', signup);
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/orgs', getOrgs);
router.get('/org/validate/:orgId', validateOrg);
router.get('/me', authenticate, authMe);

export default router;
