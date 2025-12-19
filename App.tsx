
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Customer, Vehicle, Transaction, AppState, AppTab } from './types';
import { dbService } from './services/databaseService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import VehicleList from './components/VehicleList';
import FinancePanel from './components/FinancePanel';
import Settings from './components/Settings';
import Navbar from './components/Navbar';

const INITIAL_STATE: AppState = {
  currentUser: null,
  customers: [],
  vehicles: [],
  transactions: [],
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dbService.fetchAllState();
      setState(prev => ({ ...data, currentUser: prev.currentUser })); // 保持登录状态
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 当状态改变时，如果是本地模式，自动备份到本地
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('autofix_db_cloud_sync_v3', JSON.stringify(state));
    }
  }, [state, isLoading]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const saveCustomer = async (customer: Customer) => {
    await dbService.saveCustomer(customer);
    setState(prev => {
      const exists = prev.customers.find(c => c.id === customer.id);
      return { 
        ...prev, 
        customers: exists 
          ? prev.customers.map(c => c.id === customer.id ? customer : c)
          : [...prev.customers, customer] 
      };
    });
  };

  const deleteCustomer = async (id: string) => {
    if (!window.confirm('确定要删除该客户吗？关联记录将同步处理。')) return;
    await dbService.deleteCustomer(id);
    setState(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
  };

  const saveVehicle = async (vehicle: Vehicle) => {
    await dbService.saveVehicle(vehicle);
    setState(prev => {
      const exists = prev.vehicles.find(v => v.id === vehicle.id);
      return { 
        ...prev, 
        vehicles: exists 
          ? prev.vehicles.map(v => v.id === vehicle.id ? vehicle : v)
          : [...prev.vehicles, vehicle] 
      };
    });
  };

  const deleteVehicle = async (id: string) => {
    if (!window.confirm('确定要删除该车辆档案吗？')) return;
    await dbService.deleteVehicle(id);
    setState(prev => ({ ...prev, vehicles: prev.vehicles.filter(v => v.id !== id) }));
  };

  const addTransaction = async (transaction: Transaction) => {
    await dbService.addTransaction(transaction);
    setState(prev => {
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === transaction.customerId) {
          return {
            ...c,
            balance: transaction.type === 'TOPUP' 
              ? c.balance + transaction.amount 
              : c.balance - transaction.amount
          };
        }
        return c;
      });
      return {
        ...prev,
        customers: updatedCustomers,
        transactions: [...prev.transactions, transaction]
      };
    });
  };

  const resetSystem = async () => {
    if (window.confirm('警告：这将清除所有存储数据！确定继续吗？')) {
      await dbService.resetData();
      setState({ ...INITIAL_STATE, currentUser: state.currentUser });
      setActiveTab('dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">同步数据中...</p>
      </div>
    );
  }

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        user={state.currentUser} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard state={state} />}
        {activeTab === 'customers' && (
          <CustomerList customers={state.customers} onSave={saveCustomer} onDelete={deleteCustomer} isAdmin={state.currentUser.role === UserRole.ADMIN} />
        )}
        {activeTab === 'vehicles' && (
          <VehicleList vehicles={state.vehicles} customers={state.customers} onSave={saveVehicle} onDelete={deleteVehicle} isAdmin={state.currentUser.role === UserRole.ADMIN} />
        )}
        {activeTab === 'finance' && (
          <FinancePanel transactions={state.transactions} customers={state.customers} onAddTransaction={addTransaction} isAdmin={state.currentUser.role === UserRole.ADMIN} />
        )}
        {activeTab === 'settings' && (
          <Settings state={state} onReset={resetSystem} isAdmin={state.currentUser.role === UserRole.ADMIN} />
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-400 text-sm">
        © 2024 AutoFix Pro - 云端/本地多模态数据库系统
      </footer>
    </div>
  );
};

export default App;
