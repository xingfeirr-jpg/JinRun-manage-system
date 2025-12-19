
import React, { useState } from 'react';
import { Customer } from '../types';

interface Props {
  customers: Customer[];
  onSave: (c: Customer) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const CustomerList: React.FC<Props> = ({ customers, onSave, onDelete, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const filtered = customers.filter(c => 
    c.name.includes(search) || c.phone.includes(search)
  );

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({ name: customer.name, phone: customer.phone, email: customer.email });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '' });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData: Customer = {
      id: editingId || Date.now().toString(),
      ...formData,
      balance: editingId ? (customers.find(c => c.id === editingId)?.balance || 0) : 0,
      createdAt: editingId ? (customers.find(c => c.id === editingId)?.createdAt || '') : new Date().toISOString().split('T')[0]
    };
    onSave(customerData);
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">客户信息库</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="搜索姓名或电话..." 
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              新增客户
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">联系电话</th>
              <th className="px-6 py-4">电子邮箱</th>
              <th className="px-6 py-4">账户余额</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                <td className="px-6 py-4 text-slate-600">{c.email}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${c.balance < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                    ¥{c.balance.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                      编辑
                    </button>
                    {isAdmin && (
                      <button onClick={() => onDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">未找到匹配记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? '修改客户信息' : '登记新客户'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                <input required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                <input required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
                <input type="email" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">取消</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
