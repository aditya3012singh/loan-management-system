'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function CollectionView() {
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans?status=DISBURSED');
      setLoans(res.data);
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
  };

  const fetchPayments = async (loanId: string) => {
    try {
      const res = await api.get(`/payments/${loanId}`);
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
      setPayments([]);
    }
  };

  const getTotalPaid = () => {
    return payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  };

  const handleSelectLoan = async (loan: any) => {
    if (selectedLoan?._id === loan._id) {
      setSelectedLoan(null);
      setPayments([]);
      return;
    }
    setSelectedLoan(loan);
    setError('');
    setUtr('');
    setAmount('');
    await fetchPayments(loan._id);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !utr || !amount) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/payments', {
        loanId: selectedLoan._id,
        utr,
        amount: Number(amount),
      });
      setUtr('');
      setAmount('');

      if (res.data.loanClosed) {
        // Loan is now closed, remove from active list
        setSelectedLoan(null);
        setPayments([]);
        fetchLoans();
        alert('✅ Loan fully paid! Status updated to CLOSED.');
      } else {
        // Refresh payments to show updated balance
        await fetchPayments(selectedLoan._id);
        alert('Payment recorded successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h2 className="text-xl font-semibold text-white">Active Collections</h2>
        <span className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          {loans.length} Active
        </span>
      </div>
      
      <div className="grid gap-4">
        {loans.length === 0 ? (
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-12 text-center">
            <p className="text-gray-500 text-sm">No active disbursed loans.</p>
          </div>
        ) : (
          loans.map((loan) => {
            const isSelected = selectedLoan?._id === loan._id;
            const totalPaid = isSelected ? getTotalPaid() : 0;
            const outstanding = isSelected ? (loan.totalRepayment - totalPaid) : loan.totalRepayment;

            return (
              <div key={loan._id} className={`bg-[#121212] border ${isSelected ? 'border-[#525252]' : 'border-[#262626]'} p-5 rounded-xl transition-colors relative overflow-hidden`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50"></div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-6 pl-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Applicant</p>
                      <p className="text-sm text-gray-100 font-medium">{loan.userId?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Total Repayment</p>
                      <p className="text-sm font-medium text-white">₹ {loan.totalRepayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Outstanding</p>
                      <p className="text-sm font-medium text-amber-400">₹ {isSelected ? outstanding.toLocaleString() : '—'}</p>
                    </div>
                    <div className="flex items-end lg:justify-end">
                      <button
                        onClick={() => handleSelectLoan(loan)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isSelected 
                            ? 'bg-[#1a1a1a] text-gray-300 border border-[#404040]' 
                            : 'bg-white hover:bg-gray-200 text-black border border-transparent'
                        }`}
                      >
                        {isSelected ? 'Close' : 'Manage'}
                      </button>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-6 pt-6 border-t border-[#262626] grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment History */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">Payment History</h3>
                      {payments.length === 0 ? (
                        <p className="text-gray-500 text-xs py-4 text-center">No payments recorded yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {payments.map((p: any) => (
                            <div key={p._id} className="flex justify-between items-center text-sm bg-[#121212] p-3 rounded-lg border border-[#1a1a1a]">
                              <div>
                                <p className="text-gray-300 font-medium">₹ {p.amount.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">UTR: {p.utr}</p>
                              </div>
                              <p className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 pt-3 border-t border-[#262626] flex justify-between text-sm">
                        <span className="text-gray-400">Total Paid</span>
                        <span className="text-emerald-400 font-semibold">₹ {totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Outstanding</span>
                        <span className="text-amber-400 font-semibold">₹ {outstanding.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Record Payment Form */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">Record Payment</h3>
                      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded text-xs mb-4">{error}</div>}
                      
                      <form onSubmit={handleRecordPayment} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">UTR Reference</label>
                          <input
                            type="text"
                            placeholder="e.g. UTR123456789"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            className="w-full p-2.5 bg-[#121212] border border-[#262626] rounded-lg text-sm text-white focus:border-[#525252] focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2.5 bg-[#121212] border border-[#262626] rounded-lg text-sm text-white focus:border-[#525252] focus:outline-none"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Max payable: ₹ {outstanding.toLocaleString()}</p>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-white hover:bg-gray-200 text-black py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 mt-2"
                        >
                          {isSubmitting ? 'Recording...' : 'Submit Payment'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
