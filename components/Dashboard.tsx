
import React, { useEffect, useState } from 'react';
import { AppState } from '../types';
import { analyzeBusinessData } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const [aiInsight, setAiInsight] = useState<string>('正在获取经营建议...');

  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await analyzeBusinessData(state.customers, state.transactions);
      setAiInsight(insight);
    };
    fetchInsight();
  }, [state.customers, state.transactions]);

  const stats = [
    { label: '总客户数', value: state.customers.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '登记车辆', value: state.vehicles.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '储值余额', value: `¥${state.customers.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '今日交易', value: state.transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  // 模拟图表数据
  const chartData = [
    { name: '周一', value: 400 },
    { name: '周二', value: 300 },
    { name: '周三', value: 600 },
    { name: '周四', value: 800 },
    { name: '周五', value: 500 },
    { name: '周六', value: 900 },
    { name: '周日', value: 1200 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">营收趋势</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold">AI 经营洞察 (暂停)</h3>
          </div>
          <p className="text-slate-200 leading-relaxed italic">
            "{aiInsight}"
          </p>
          <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-400">
            * 智能分析功能目前处于离线状态
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
