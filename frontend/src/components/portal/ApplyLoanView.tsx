'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';

const applySchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)'),
  dob: z.string().min(1, 'Date of Birth is required'),
  salary: z.number().min(25000, 'Minimum salary requirement is 25000'),
  employmentMode: z.enum(['Salaried', 'Self-Employed', 'Unemployed']),
  amount: z.number().min(50000).max(500000),
  tenure: z.number().min(30).max(365),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function ApplyLoanView() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      amount: 100000,
      tenure: 180,
      employmentMode: 'Salaried',
    },
  });

  const watchAmount = watch('amount');
  const watchTenure = watch('tenure');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const calculateRepayment = () => {
    const SI = (watchAmount * 12 * watchTenure) / (365 * 100);
    return (watchAmount + SI).toFixed(2);
  };

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      setError('');
      setSuccess('');

      if (!file) {
        setError('Salary slip is required');
        return;
      }

      // 1. Apply Loan
      const loanRes = await api.post('/loans/apply', data);
      const loanId = loanRes.data.loan._id;

      // 2. Upload Document
      const formData = new FormData();
      formData.append('file', file);
      formData.append('loanId', loanId);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Loan applied successfully! Your application is under review.');
      reset();
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply for loan');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">New Loan Application</h2>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">PAN Card</label>
              <input
                {...register('pan')}
                className="input-field uppercase"
                placeholder="ABCDE1234F"
              />
              {errors.pan && <p className="text-red-400 text-xs mt-1">{errors.pan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Date of Birth</label>
              <input
                {...register('dob')}
                type="date"
                className="input-field text-gray-300"
              />
              {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Monthly Salary (₹)</label>
              <input
                {...register('salary', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="50000"
              />
              {errors.salary && <p className="text-red-400 text-xs mt-1">{errors.salary.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Employment Mode</label>
              <select {...register('employmentMode')} className="input-field text-gray-300">
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
              {errors.employmentMode && <p className="text-red-400 text-xs mt-1">{errors.employmentMode.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-300">Salary Slip (PDF/JPG/PNG, Max 5MB)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="input-field text-gray-300"
              />
            </div>

            <div className="md:col-span-2 mt-4 p-6 bg-[#0a0a0a] rounded-xl border border-[#262626]">
              <h3 className="text-sm font-semibold mb-6 text-gray-300 uppercase tracking-wider">Loan Configuration</h3>
              
              <div className="mb-6">
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-400">Loan Amount</span>
                  <span className="text-white font-bold">₹ {watchAmount?.toLocaleString() || 0}</span>
                </label>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="5000"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹50,000</span>
                  <span>₹500,000</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-400">Tenure (Days)</span>
                  <span className="text-white font-bold">{watchTenure || 0} Days</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="5"
                  {...register('tenure', { valueAsNumber: true })}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>30</span>
                  <span>365</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#262626] flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Interest Rate</p>
                  <p className="font-medium text-white">12% p.a.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Total Repayment</p>
                  <p className="text-2xl font-bold text-white">
                    ₹ {calculateRepayment()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!success}
            className="btn-primary w-full text-lg mt-6"
          >
            {isSubmitting ? 'Processing Application...' : 'Submit Loan Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
