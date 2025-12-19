
import { AppState, Customer, Vehicle, Transaction } from "../types";

/**
 * Supabase 云端 API 配置
 * 项目 ID: zdypjlnqwqjedssuqvvs
 */
const API_CONFIG = {
  ENDPOINT: 'https://zdypjlnqwqjedssuqvvs.supabase.co/rest/v1',
  TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeXBqbG5xd3FqZWRzc3VxdnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjEwODAsImV4cCI6MjA4MTY5NzA4MH0.Lnu2auFeaB1JsUqSGOlvUHOMytErjwhjvyyu9khBxC0', 
};

const LOCAL_STORAGE_KEY = 'autofix_db_v3_sync';

// --- 映射逻辑：处理前端 ID 与后端 ID 的同步 ---
const mapCustomer = {
  fromDB: (c: any): Customer => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    balance: parseFloat(c.balance || 0),
    createdAt: c.created_at
  }),
  toDB: (c: Customer) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    balance: c.balance,
    created_at: c.createdAt
  })
};

const mapVehicle = {
  fromDB: (v: any): Vehicle => ({
    id: v.id,
    customerId: v.customer_id,
    plateNumber: v.plate_number,
    brand: v.brand,
    model: v.model,
    year: v.year,
    vin: v.vin,
    lastService: v.last_service
  }),
  toDB: (v: Vehicle) => ({
    id: v.id,
    customer_id: v.customerId,
    plate_number: v.plateNumber,
    brand: v.brand,
    model: v.model,
    year: v.year,
    vin: v.vin,
    last_service: v.lastService
  })
};

class DatabaseService {
  private isCloudEnabled(): boolean {
    return !!API_CONFIG.TOKEN && API_CONFIG.TOKEN.startsWith('eyJ') && API_CONFIG.TOKEN.length > 50;
  }

  private getHeaders() {
    return {
      'apikey': API_CONFIG.TOKEN,
      'Authorization': `Bearer ${API_CONFIG.TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  private async safeFetch(url: string, options: RequestInit) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        
        // 专门处理 RLS 权限错误
        if (response.status === 401 || errorText.includes('row-level security')) {
          console.error("⛔ [权限阻止] 数据已发往 Supabase 但被 RLS 策略拦截。");
          console.error("👉 解决方法：请在 Supabase SQL Editor 执行: ALTER TABLE 表名 DISABLE ROW LEVEL SECURITY;");
        } else if (response.status === 404) {
          console.error("❓ [表不存在] 请确认数据库中已创建 customers, vehicles, transactions 表。");
        } else {
          console.error(`❌ Supabase 响应异常 [${response.status}]:`, errorText);
        }
        return null;
      }
      return response;
    } catch (e) {
      console.error("❌ 网络请求失败:", e);
      return null;
    }
  }

  async fetchAllState(): Promise<AppState> {
    if (this.isCloudEnabled()) {
      const results = await Promise.all([
        this.safeFetch(`${API_CONFIG.ENDPOINT}/customers?select=*&order=created_at.desc`, { headers: this.getHeaders() }),
        this.safeFetch(`${API_CONFIG.ENDPOINT}/vehicles?select=*`, { headers: this.getHeaders() }),
        this.safeFetch(`${API_CONFIG.ENDPOINT}/transactions?select=*&order=date.desc`, { headers: this.getHeaders() })
      ]);

      if (results[0] && results[1] && results[2]) {
        const rawCust = await results[0].json();
        const rawVeh = await results[1].json();
        const rawTx = await results[2].json();

        const cloudData: AppState = {
          currentUser: null,
          customers: rawCust.map(mapCustomer.fromDB),
          vehicles: rawVeh.map(mapVehicle.fromDB),
          transactions: rawTx.map((t: any) => ({
            id: t.id,
            customerId: t.customer_id,
            type: t.type,
            amount: parseFloat(t.amount),
            description: t.description,
            date: t.date
          }))
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
        return cloudData;
      }
    }

    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    return local ? JSON.parse(local) : { currentUser: null, customers: [], vehicles: [], transactions: [] };
  }

  async saveCustomer(customer: Customer): Promise<void> {
    if (!this.isCloudEnabled()) return;
    await this.safeFetch(`${API_CONFIG.ENDPOINT}/customers`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(mapCustomer.toDB(customer))
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    if (!this.isCloudEnabled()) return;
    await this.safeFetch(`${API_CONFIG.ENDPOINT}/customers?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    if (!this.isCloudEnabled()) return;
    await this.safeFetch(`${API_CONFIG.ENDPOINT}/vehicles`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(mapVehicle.toDB(vehicle))
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    if (!this.isCloudEnabled()) return;
    await this.safeFetch(`${API_CONFIG.ENDPOINT}/vehicles?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    if (!this.isCloudEnabled()) return;
    
    const txRes = await this.safeFetch(`${API_CONFIG.ENDPOINT}/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        id: transaction.id,
        customer_id: transaction.customerId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date
      })
    });

    if (txRes) {
      const custRes = await this.safeFetch(`${API_CONFIG.ENDPOINT}/customers?id=eq.${transaction.customerId}&select=balance`, { headers: this.getHeaders() });
      if (custRes) {
        const custData = await custRes.json();
        if (custData[0]) {
          const currentBalance = parseFloat(custData[0].balance);
          const newBalance = transaction.type === 'TOPUP' 
            ? currentBalance + transaction.amount 
            : currentBalance - transaction.amount;
          
          await this.safeFetch(`${API_CONFIG.ENDPOINT}/customers?id=eq.${transaction.customerId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ balance: newBalance })
          });
        }
      }
    }
  }

  async resetData(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export const dbService = new DatabaseService();
