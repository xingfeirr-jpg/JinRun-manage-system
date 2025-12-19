
import React, { useState } from 'react';
import { Vehicle, Customer } from '../types';
import { getMaintenanceAdvice } from '../services/geminiService';

interface Props {
  vehicles: Vehicle[];
  customers: Customer[];
  onSave: (v: Vehicle) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const VehicleList: React.FC<Props> = ({ vehicles, customers, onSave, onDelete, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<{id: string, text: string} | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [formData, setFormData] = useState({ customerId: '', plateNumber: '', brand: '', model: '', year: '', vin: '' });

  const handleShowAdvice = async (v: Vehicle) => {
    const customer = customers.find(c => c.id === v.customerId);
    if (!customer) return;
    
    // 如果已经显示了当前车辆的建议，则关闭它（切换显示）
    if (advice?.id === v.id) {
      setAdvice(null);
      return;
    }

    setLoadingAdvice(true);
    const text = await getMaintenanceAdvice(v, customer);
    setAdvice({ id: v.id, text });
    setLoadingAdvice(false);
  };

  const handleEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setFormData({ 
      customerId: v.customerId, 
      plateNumber: v.plateNumber, 
      brand: v.brand, 
      model: v.model, 
      year: v.year, 
      vin: v.vin 
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ customerId: '', plateNumber: '', brand: '', model: '', year: '', vin: '' });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleData: Vehicle = {
      id: editingId || Date.now().toString(),
      ...formData,
      lastService: editingId ? (vehicles.find(v => v.id === editingId)?.lastService || '') : new Date().toISOString().split('T')[0]
    };
    onSave(vehicleData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">车辆档案库</h2>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          添加新车辆
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(v => {
          const owner = customers.find(c => c.id === v.customerId);
          return (
            <div key={v.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{v.brand} {v.model}</p>
                  <h3 className="text-lg font-bold text-slate-900">{v.plateNumber}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(v)} className="p-1 text-slate-300 hover:text-blue-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  {isAdmin && <button onClick={() => onDelete(v.id)} className="p-1 text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-500 mb-6">
                <p className="flex justify-between"><span>所属车主:</span> <span className="font-medium text-slate-700">{owner?.name || <span className="text-red-400 italic">未知车主</span>}</span></p>
                <p className="flex justify-between"><span>VIN:</span> <span className="font-mono text-[10px] text-slate-700">{v.vin || 'N/A'}</span></p>
                <p className="flex justify-between"><span>上次保养:</span> <span className="font-medium text-slate-700">{v.lastService}</span></p>
              </div>
              
              <button 
                onClick={() => handleShowAdvice(v)}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  advice?.id === v.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 hover:bg-blue-50 text-blue-600'
                }`}
                disabled={loadingAdvice}
              >
                {loadingAdvice && advice?.id === v.id ? '正在处理...' : advice?.id === v.id ? '收起建议' : '维护建议 (离线)'}
              </button>

              {advice?.id === v.id && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl text-xs text-amber-900 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                  <p className="font-bold mb-1">💡 专家提示 (静态):</p>
                  <div className="whitespace-pre-line">{advice.text}</div>
                </div>
              )}
            </div>
          );
        })}
        {vehicles.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>还没有车辆记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? '修改车辆信息' : '登记新车辆'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">关联客户</label>
                <select required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                  <option value="">选择车主</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">车牌号</label>
                <input required placeholder="如: 粤A88888" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">品牌</label>
                <input required placeholder="如: 丰田" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">型号</label>
                <input required placeholder="如: 凯美瑞" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">年份</label>
                <input required type="number" placeholder="2023" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">车架号 (VIN)</label>
                <input className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
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

export default VehicleList;
