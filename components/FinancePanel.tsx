
import React, { useState } from 'react';
import { Transaction, Customer } from '../types';

interface Props {
  transactions: Transaction[];
  customers: Customer[];
  onAddTransaction: (t: Transaction) => void;
  isAdmin: boolean;
}

const FinancePanel: React.FC<Props> = ({ transactions, customers, onAddTransaction, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customerId: '', type: 'TOPUP' as 'TOPUP' | 'SPEND', amount: 0, description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    onAddTransaction(newTx);
    setShowModal(false);
    setFormData({ customerId: '', type: 'TOPUP', amount: 0, description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">财务中心 (储值与消费)</h2>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            登记新交易
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-700">近期流水记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">时间</th>
                <th className="px-6 py-4">客户</th>
                <th className="px-6 py-4">类型</th>
                <th className="px-6 py-4">金额</th>
                <th className="px-6 py-4">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {[...transactions].reverse().map(t => {
                const customer = customers.find(c => c.id === t.customerId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-400 font-mono">{t.date}</td>
                    <td className="px-6 py-4 font-medium">{customer?.name || '未知'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        t.type === 'TOPUP' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {t.type === 'TOPUP' ? '储值' : '扣费'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${t.type === 'TOPUP' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'TOPUP' ? '+' : '-'}¥{t.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{t.description}</td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">暂无财务流水</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6">新增交易登记</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择客户</label>
                <select required className="w-full border p-2.5 rounded-lg" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                  <option value="">请选择客户</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (余额: ¥{c.balance})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">业务类型</label>
                <select className="w-full border p-2.5 rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="TOPUP">客户储值 (余额增加)</option>
                  <option value="SPEND">维修扣费 (余额减少)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">交易金额 (¥)</label>
                <input required type="number" step="0.01" className="w-full border p-2.5 rounded-lg font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注说明</label>
                <textarea className="w-full border p-2.5 rounded-lg resize-none" rows={3} placeholder="如: 充1000送200, 或 二手车喷漆费用" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">取消</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">确认入账</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinancePanel;
