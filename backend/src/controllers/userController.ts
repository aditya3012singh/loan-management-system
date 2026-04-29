import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User, Role } from '../models/User';
import { Loan } from '../models/Loan';

export const getBorrowers = async (req: AuthRequest, res: Response) => {
  try {
    // Find all users who have applied for a loan
    const usersWithLoans = await Loan.distinct('userId');
    
    // Find borrowers whose ID is not in the list of users with loans
    const borrowers = await User.find({ 
      role: Role.BORROWER,
      _id: { $nin: usersWithLoans }
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(borrowers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
