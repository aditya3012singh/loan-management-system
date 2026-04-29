import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { DocumentModel } from '../models/Document';

export const uploadSalarySlip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { loanId } = req.body;
    
    const document = new DocumentModel({
      userId: req.user!.id,
      loanId: loanId || undefined,
      fileUrl: `/uploads/${req.file.filename}`,
      type: 'salary_slip',
    });

    await document.save();

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
