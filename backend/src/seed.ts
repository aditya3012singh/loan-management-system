import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Role } from './models/User';
import connectDB from './config/db';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@lms.com',
        password,
        role: Role.ADMIN,
      },
      {
        name: 'Sales User',
        email: 'sales@lms.com',
        password,
        role: Role.SALES,
      },
      {
        name: 'Sanction User',
        email: 'sanction@lms.com',
        password,
        role: Role.SANCTION,
      },
      {
        name: 'Disbursement User',
        email: 'disbursement@lms.com',
        password,
        role: Role.DISBURSEMENT,
      },
      {
        name: 'Collection User',
        email: 'collection@lms.com',
        password,
        role: Role.COLLECTION,
      },
      {
        name: 'Borrower One',
        email: 'borrower1@test.com',
        password,
        role: Role.BORROWER,
      },
      {
        name: 'Borrower Two',
        email: 'borrower2@test.com',
        password,
        role: Role.BORROWER,
      }
    ];

    await User.insertMany(users);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
