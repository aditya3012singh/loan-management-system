import { Router } from 'express';
import { applyLoan, getMyLoans, getLoansByStatus, updateLoanStatus } from '../controllers/loanController';
import { verifyToken, checkRole } from '../middlewares/auth';
import { Role } from '../models/User';

const router = Router();

// Borrower routes
router.post('/apply', verifyToken, checkRole([Role.BORROWER]), applyLoan);
router.get('/my-loans', verifyToken, checkRole([Role.BORROWER]), getMyLoans);

// Dashboard routes
// Sanction can see APPLIED, Disbursement can see SANCTIONED, Collection can see DISBURSED
router.get('/', verifyToken, checkRole([Role.ADMIN, Role.SANCTION, Role.DISBURSEMENT, Role.COLLECTION]), getLoansByStatus);

router.patch('/:id/status', verifyToken, checkRole([Role.ADMIN, Role.SANCTION, Role.DISBURSEMENT]), updateLoanStatus);

export default router;
