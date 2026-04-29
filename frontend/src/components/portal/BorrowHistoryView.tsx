'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function BorrowHistoryView() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        const res = await api.get('/loans/my-loans');
        setLoans(res.data);
      } catch (err) {
        console.error('Failed to fetch loan history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyLoans();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'SANCTIONED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'DISBURSED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'CLOSED': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">Borrow History</h2>
        <span className="text-sm text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#262626]">
          {loans.length} Records
        </span>
      </div>
      
      <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-sm shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1a1a] border-b border-[#262626]">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenure</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Repayment</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Loading history...</td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 text-sm">
                    You haven't applied for any loans yet.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-white">
                      ₹ {loan.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {loan.tenure} Days
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      ₹ {loan.totalRepayment.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                      {loan.status === 'REJECTED' && loan.rejectionReason && (
                        <p className="text-xs text-red-400 mt-2 max-w-[200px] truncate" title={loan.rejectionReason}>
                          Reason: {loan.rejectionReason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
