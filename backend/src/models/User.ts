import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  ADMIN = 'Admin',
  SALES = 'Sales',
  SANCTION = 'Sanction',
  DISBURSEMENT = 'Disbursement',
  COLLECTION = 'Collection',
  BORROWER = 'Borrower',
}

export enum EmploymentMode {
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-Employed',
  UNEMPLOYED = 'Unemployed',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  pan?: string;
  dob?: Date;
  salary?: number;
  employmentMode?: EmploymentMode;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.BORROWER },
    pan: { type: String },
    dob: { type: Date },
    salary: { type: Number },
    employmentMode: { type: String, enum: Object.values(EmploymentMode) },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
