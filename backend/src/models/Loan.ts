import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  tenure: number;
  interestRate: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    totalRepayment: { type: Number, required: true },
    status: { type: String, enum: Object.values(LoanStatus), default: LoanStatus.APPLIED },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
