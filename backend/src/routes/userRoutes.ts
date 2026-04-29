import { Router } from 'express';
import { getBorrowers } from '../controllers/userController';
import { verifyToken, checkRole } from '../middlewares/auth';
import { Role } from '../models/User';

const router = Router();

router.get('/borrowers', verifyToken, checkRole([Role.ADMIN, Role.SALES]), getBorrowers);

export default router;
