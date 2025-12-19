
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  vin: string;
  lastService: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  type: 'TOPUP' | 'SPEND';
  amount: number;
  description: string;
  date: string;
}

export interface AppState {
  currentUser: User | null;
  customers: Customer[];
  vehicles: Vehicle[];
  transactions: Transaction[];
}

export type AppTab = 'dashboard' | 'customers' | 'vehicles' | 'finance' | 'settings';
