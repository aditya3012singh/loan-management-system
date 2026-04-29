'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DisbursementView() {
  const [loans, setLoans] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans?status=SANCTIONED');
      setLoans(res.data);
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      setActioningId(id);
      await api.patch(`/loans/${id}/status`, { status: 'DISBURSED' });
      fetchLoans();
    } catch (err) {
      console.error('Disbursement failed', err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">Ready for Disbursement</h2>
        <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          {loans.length} Accounts
        </span>
      </div>

      <div className="grid gap-4">
        {loans.length === 0 ? (
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-12 text-center">
            <p className="text-gray-500 text-sm">No sanctioned loans pending disbursement.</p>
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-[#121212] border border-[#262626] p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#404040] transition-colors relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>
              
              <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6 pl-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Applicant</p>
                  <p className="text-sm text-gray-100 font-medium">{loan.userId?.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Sanctioned Amount</p>
                  <p className="text-sm text-gray-100 font-medium">₹ {loan.amount.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Account Details</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="text-sm text-gray-400">Verified via PAN <span className="font-mono text-gray-300">{loan.userId?.pan}</span></p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 border-t border-[#262626] md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                <button
                  onClick={() => handleDisburse(loan._id)}
                  disabled={actioningId === loan._id}
                  className="w-full bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {actioningId === loan._id ? 'Processing...' : 'Disburse Funds'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
