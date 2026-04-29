'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredentials, initializeAuth } from '@/store/authSlice';
import api from '@/lib/api';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [error, setError] = useState('');
  const [quickLoading, setQuickLoading] = useState('');

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'Borrower') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginAs = async (email: string) => {
    try {
      setError('');
      setQuickLoading(email);
      const res = await api.post('/auth/login', { email, password: 'password123' });
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));

      if (res.data.user.role === 'Borrower') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setQuickLoading('');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError('');
      const res = await api.post('/auth/login', data);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      
      if (res.data.user.role === 'Borrower') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const quickLogins = [
    { email: 'admin@lms.com', label: 'Admin', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
    { email: 'sales@lms.com', label: 'Sales', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20' },
    { email: 'sanction@lms.com', label: 'Sanction', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
    { email: 'disbursement@lms.com', label: 'Disbursement', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
    { email: 'collection@lms.com', label: 'Collection', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
    { email: 'borrower1@test.com', label: 'Borrower', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            LMS Portal
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register('email')}
              className="input-field"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="input-field"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-6"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-gray-300 hover:text-white font-medium transition-colors border-b border-transparent hover:border-white">
            Register as Borrower
          </Link>
        </div>

        {/* Quick Login Buttons for Evaluator */}
        <div className="mt-8 pt-6 border-t border-[#262626]">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 text-center">Quick Login (Demo)</p>
          <div className="grid grid-cols-3 gap-2">
            {quickLogins.map((q) => (
              <button
                key={q.email}
                onClick={() => loginAs(q.email)}
                disabled={quickLoading === q.email}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 disabled:opacity-50 ${q.color}`}
              >
                {quickLoading === q.email ? '...' : q.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">All accounts use password: password123</p>
        </div>
      </div>
    </div>
  );
}
