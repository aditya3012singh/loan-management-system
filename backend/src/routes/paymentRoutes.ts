import { Router } from 'express';
import { recordPayment, getPaymentsForLoan } from '../controllers/paymentController';
import { verifyToken, checkRole } from '../middlewares/auth';
import { Role } from '../models/User';

const router = Router();

router.post('/', verifyToken, checkRole([Role.ADMIN, Role.COLLECTION]), recordPayment);
router.get('/:loanId', verifyToken, getPaymentsForLoan);

export default router;
