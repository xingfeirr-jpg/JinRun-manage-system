
import React from 'react';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onReset: () => void;
  isAdmin: boolean;
}

const Settings: React.FC<Props> = ({ state, onReset, isAdmin }) => {
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "autofix_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isCloudConnected = localStorage.getItem('autofix_db_v3_sync') !== null;
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">系统设置</h2>
        <p className="text-slate-500 text-sm mb-8">管理您的应用程序数据和云端同步状态。</p>

        <div className="space-y-8">
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">云数据库状态</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">ID: zdypjlnqwqjedssuqvvs</span>
            </div>
            
            <div className={`p-5 rounded-xl border flex flex-col gap-4 ${isCloudConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <span className={`font-bold ${isCloudConnected ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {isCloudConnected ? '正在尝试云端同步' : '云端同步准备就绪'}
                </span>
              </div>

              <div className="bg-white/60 p-4 rounded-lg border border-emerald-100 text-sm">
                <p className="text-slate-600 mb-4">您的数据会自动尝试推送到 Supabase 云端。</p>
                
                {/* 错误自查区 */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    为什么点击保存没有反应？
                  </p>
                  <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                    如果您在浏览器控制台（F12）看到 <code className="bg-amber-200 px-1">401 (RLS Policy)</code> 错误，说明您需要去 Supabase 后台关闭权限锁。
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-amber-900">请在 Supabase SQL Editor 执行：</p>
                    <code className="text-[10px] block bg-slate-800 text-amber-300 p-3 rounded leading-loose">
                      ALTER TABLE customers DISABLE ROW LEVEL SECURITY;<br/>
                      ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;<br/>
                      ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">数据操作</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="mb-4">
                  <p className="font-semibold text-slate-700">导出备份</p>
                  <p className="text-xs text-slate-500">下载当前所有数据的 JSON 镜像文件。</p>
                </div>
                <button 
                  onClick={exportData}
                  className="w-full bg-white py-2 border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  导出数据
                </button>
              </div>

              {isAdmin && (
                <div className="flex flex-col justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="mb-4">
                    <p className="font-semibold text-red-700">重置系统</p>
                    <p className="text-xs text-red-500/70">清除所有本地缓存并重新从云端加载。</p>
                  </div>
                  <button 
                    onClick={onReset}
                    className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    立即重置
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
