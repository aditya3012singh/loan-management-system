'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SanctionView() {
  const [loans, setLoans] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans?status=APPLIED');
      setLoans(res.data);
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
  };

  const handleAction = async (id: string, action: 'SANCTIONED' | 'REJECTED') => {
    try {
      setActioningId(id);
      const payload: any = { status: action };
      if (action === 'REJECTED') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) {
          setActioningId(null);
          return;
        }
        payload.rejectionReason = reason;
      }
      
      await api.patch(`/loans/${id}/status`, payload);
      fetchLoans();
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">Pending Applications</h2>
        <span className="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          {loans.length} in Queue
        </span>
      </div>

      <div className="grid gap-4">
        {loans.length === 0 ? (
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-12 text-center">
            <p className="text-gray-500 text-sm">No pending applications at the moment.</p>
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-[#121212] border border-[#262626] p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#404040] transition-colors relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50"></div>
              
              <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6 pl-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Applicant</p>
                  <p className="text-sm text-gray-100 font-medium">{loan.userId?.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Amount</p>
                  <p className="text-sm text-gray-100 font-medium">₹ {loan.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Tenure</p>
                  <p className="text-sm text-gray-100">{loan.tenure} Days</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">PAN Details</p>
                  <p className="text-sm text-gray-400 font-mono text-xs mt-0.5">{loan.userId?.pan}</p>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto shrink-0 border-t border-[#262626] md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                <button
                  onClick={() => handleAction(loan._id, 'SANCTIONED')}
                  disabled={actioningId === loan._id}
                  className="flex-1 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(loan._id, 'REJECTED')}
                  disabled={actioningId === loan._id}
                  className="flex-1 bg-transparent hover:bg-[#1a1a1a] text-gray-300 border border-[#404040] px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
