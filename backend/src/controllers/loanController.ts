import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Loan, LoanStatus } from '../models/Loan';
import { User } from '../models/User';
import { z } from 'zod';

const applySchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  dob: z.string(),
  salary: z.number().min(0),
  employmentMode: z.enum(['Salaried', 'Self-Employed', 'Unemployed']),
  amount: z.number().min(50000).max(500000),
  tenure: z.number().min(30).max(365),
});

export const applyLoan = async (req: AuthRequest, res: Response) => {
  try {
    const parsedData = applySchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.issues });
    }

    const { pan, dob, salary, employmentMode, amount, tenure } = parsedData.data;

    // ── BRE: Business Rule Engine ──

    // Rule 1: Employment check
    if (employmentMode === 'Unemployed') {
      return res.status(400).json({ message: 'Loan rejected: Unemployed applicants are not eligible.' });
    }

    // Rule 2: Salary check
    if (salary < 25000) {
      return res.status(400).json({ message: 'Loan rejected: Minimum monthly salary requirement is ₹25,000.' });
    }

    // Rule 3: PAN format (already validated by zod regex above, but double-check)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return res.status(400).json({ message: 'Loan rejected: Invalid PAN format.' });
    }

    // Rule 4: Age check (must be between 23 and 50)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 23 || age > 50) {
      return res.status(400).json({ message: 'Loan rejected: Applicant age must be between 23 and 50.' });
    }

    // ── Update borrower profile with personal details ──
    const userId = req.user!.id;
    await User.findByIdAndUpdate(userId, { pan, dob: birthDate, salary, employmentMode });

    // ── Loan Calculation: Simple Interest ──
    // SI = (P × R × T) / (365 × 100), where T = tenure in days
    const interestRate = 12; // 12% per annum
    const SI = (amount * interestRate * tenure) / (365 * 100);
    const totalRepayment = parseFloat((amount + SI).toFixed(2));

    const loan = new Loan({
      userId,
      amount,
      tenure,
      interestRate,
      totalRepayment,
      status: LoanStatus.APPLIED,
    });

    await loan.save();

    res.status(201).json({ message: 'Loan applied successfully', loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLoansByStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = status ? { status: status as string } : {};
    const loans = await Loan.find(query).populate('userId', 'name email pan').sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLoanStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      [LoanStatus.APPLIED]: [LoanStatus.SANCTIONED, LoanStatus.REJECTED],
      [LoanStatus.SANCTIONED]: [LoanStatus.DISBURSED],
      [LoanStatus.DISBURSED]: [LoanStatus.CLOSED],
    };

    const allowed = validTransitions[loan.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition: cannot move from ${loan.status} to ${status}`,
      });
    }

    // If rejecting, require a reason
    if (status === LoanStatus.REJECTED) {
      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({ message: 'Rejection reason is required.' });
      }
      loan.rejectionReason = rejectionReason;
    }

    loan.status = status;
    await loan.save();

    res.json({ message: `Loan status updated to ${status}`, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
