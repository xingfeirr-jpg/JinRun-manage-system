
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (username === 'admin') {
      onLogin({ id: '1', username: 'admin', role: UserRole.ADMIN, name: '超级管理员' });
    } else {
      onLogin({ id: '2', username: 'staff', role: UserRole.STAFF, name: '前台工作人员' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-block p-4 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">AutoFix Pro</h1>
          <p className="text-slate-400">登入修车管理信息系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">用户名</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin 或 staff"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">密码</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            立即登录
          </button>
        </form>

        <div className="mt-10 text-center text-xs text-slate-400">
          <p>测试账号: admin (管理员) / staff (职员)</p>
          <p>默认密码: 任意</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
