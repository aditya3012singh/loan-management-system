import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Payment } from '../models/Payment';
import { Loan, LoanStatus } from '../models/Loan';

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId, utr, amount, date } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== LoanStatus.DISBURSED) {
      return res.status(400).json({ message: 'Can only record payments for DISBURSED loans' });
    }

    // Check UTR uniqueness
    const existingPayment = await Payment.findOne({ utr });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment with this UTR already exists' });
    }

    // Calculate total paid so far
    const existingPayments = await Payment.find({ loanId });
    const totalPaidSoFar = existingPayments.reduce((acc, curr) => acc + curr.amount, 0);

    const outstandingBalance = loan.totalRepayment - totalPaidSoFar;

    if (amount > outstandingBalance) {
      return res.status(400).json({
        message: `Overpayment detected. Outstanding balance is ${outstandingBalance}`,
      });
    }

    const payment = new Payment({
      loanId,
      utr,
      amount,
      date: date || new Date(),
    });

    await payment.save();

    const newTotalPaid = totalPaidSoFar + amount;
    
    // Auto-close loan if fully paid
    if (newTotalPaid >= loan.totalRepayment) {
      loan.status = LoanStatus.CLOSED;
      await loan.save();
    }

    res.status(201).json({ message: 'Payment recorded successfully', payment, loanClosed: loan.status === LoanStatus.CLOSED });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentsForLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.params;
    const payments = await Payment.find({ loanId }).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
