import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../stores/useFinanceStore';
import { GlassCard } from '../components/GlassCard';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit3, X, Calendar } from 'lucide-react';
import { Transaction } from '../types';

export const Finance: React.FC = () => {
  const { transactions, isLoading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openNewTxModal = () => {
    setSelectedTx(null);
    setDescription('');
    setAmount('');
    setType('EXPENSE');
    setCategory('Food');
    setDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const openEditTxModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setDescription(tx.description);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setCategory(tx.category || 'Food');
    setDate(tx.date);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    };

    if (selectedTx) {
      await updateTransaction(selectedTx.id, data);
    } else {
      await createTransaction(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTx = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      await deleteTransaction(id);
      setIsModalOpen(false);
    }
  };

  // Summaries
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <DollarSign className="text-purple-500 dark:text-purple-400" size={24} /> Financial ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep an accurate log of your cash flow, income streams, and overheads.</p>
        </div>
        <button
          onClick={openNewTxModal}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Log Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Balance</span>
            <h3 className={`text-xl font-black mt-1 ${balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-500'}`}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <DollarSign className="text-purple-500" size={24} />
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Income</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <ArrowUpRight className="text-emerald-500" size={24} />
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Expenses</span>
            <h3 className="text-xl font-black text-red-500 mt-1">
              -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <ArrowDownRight className="text-red-500" size={24} />
        </GlassCard>
      </div>

      {/* Ledger Table */}
      <GlassCard className="p-6">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Transaction Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No transactions recorded.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                    <td className="py-3.5 font-bold text-slate-800 dark:text-white">{tx.description}</td>
                    <td className="py-3.5"><span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-semibold">{tx.category || 'General'}</span></td>
                    <td className="py-3.5 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold uppercase ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3.5 text-right font-black ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-850 dark:text-white'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openEditTxModal(tx)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition inline-block"
                      >
                        <Edit3 size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal dialog form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <DollarSign size={16} className="text-purple-500" />
              {selectedTx ? 'Modify transaction' : 'Log transaction ledger'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Description / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Monthly Cloud bill"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.50"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="EXPENSE">EXPENSE</option>
                    <option value="INCOME">INCOME</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Salary, Utilities, Food"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input-cyber text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
                {selectedTx ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTx(selectedTx.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Remove record
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-cyber py-2 px-5 rounded-xl text-xs font-bold text-white"
                  >
                    {selectedTx ? 'Save Changes' : 'Log Transaction'}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
