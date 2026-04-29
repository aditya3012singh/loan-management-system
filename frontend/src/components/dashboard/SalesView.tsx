'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SalesView() {
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const res = await api.get('/users/borrowers');
        setBorrowers(res.data);
      } catch (err) {
        console.error('Failed to fetch borrowers', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBorrowers();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Registered Borrowers</h2>
        <span className="text-sm text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#262626]">
          {borrowers.length} Users
        </span>
      </div>
      
      <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-sm shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1a1a] border-b border-[#262626]">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">Loading borrowers...</td>
                </tr>
              ) : borrowers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-500 text-sm">
                    No registered borrowers without active applications found.
                  </td>
                </tr>
              ) : (
                borrowers.map((b) => (
                  <tr key={b._id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-200">{b.name}</td>
                    <td className="p-4 text-sm text-gray-400">{b.email}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
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
