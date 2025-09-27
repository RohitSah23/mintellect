import { Router } from 'express';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { EditIP, getIpById, getIpListByUid, getTxInfo, ListingIP, mintIP, submitIp } from '../controllers/user/application';
import { authenticate } from '../../../auth-service/src/middleware/auth.midleware';
import { getIpByOrg, verifyIp } from '../controllers/verifier/application';

const router = Router();
dotenv.config();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document and media types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'audio/mpeg',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
export const uploadMiddleware = upload.single('file');
router.use(cookieParser());


router.post('/listing', uploadMiddleware, ListingIP)
router.put('/listing/edit/:id', uploadMiddleware, EditIP)
router.put('/listing/submit/:id', authenticate, submitIp)
router.post('/listing/verify', authenticate, verifyIp)
router.get('/getiplistbyuid/:uid', authenticate, getIpListByUid)
router.get('/getipbyid/:id', authenticate, getIpById)
router.get('/getipbyorg/:orgId', authenticate, getIpByOrg)
router.post('/mint', authenticate, mintIP)
router.get('/tx-info/:id', getTxInfo)

export default router;
