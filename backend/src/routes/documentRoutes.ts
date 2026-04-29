import { Router } from 'express';
import { uploadSalarySlip } from '../controllers/documentController';
import { verifyToken, checkRole } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { Role } from '../models/User';

const router = Router();

router.post('/upload', verifyToken, checkRole([Role.BORROWER]), upload.single('file'), uploadSalarySlip);

export default router;
