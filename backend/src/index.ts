import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import loanRoutes from './routes/loanRoutes';
import paymentRoutes from './routes/paymentRoutes';
import documentRoutes from './routes/documentRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('LMS API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
