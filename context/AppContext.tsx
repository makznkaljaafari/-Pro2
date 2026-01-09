import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Page, Theme, AppNotification, Customer, Supplier, Sale, Purchase, Voucher, QatCategory, Expense, ExchangeRates, SaleTemplate, ExpenseTemplate, Waste, ActivityLog } from '../types';
import { dataService } from '../services/dataService';

const AppContext = createContext<any>(undefined);

// Fix: Removed cloud_status property from DEFAULT_USER as it is not defined in the User interface.
const DEFAULT_USER: User = {
  id: 'default',
  email: '',
  full_name: 'مدير النظام',
  agency_name: 'وكالة الشويع للقات',
  enable_voice_ai: true,
  autoBackupInterval: 'none'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<QatCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wasteRecords, setWasteRecords] = useState<Waste[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [saleTemplates, setSaleTemplates] = useState<SaleTemplate[]>([]);
  const [expenseTemplates, setExpenseTemplates] = useState<ExpenseTemplate[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ SAR_TO_YER: 430, OMR_TO_YER: 425 });
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  const addLog = async (action: string, details: string, type: ActivityLog['type']) => {
    const log = { id: Date.now().toString(), action, details, timestamp: new Date().toISOString(), type };
    await dataService.saveActivityLog(log);
    setActivityLogs(prev => [log as ActivityLog, ...prev.slice(0, 49)]);
  };

  const addNotification = async (title: string, message: string, type: AppNotification['type']) => {
    const notif: AppNotification = { id: Date.now().toString(), title, message, type, date: new Date().toISOString(), read: false };
    await dataService.saveNotification(notif);
    setNotifications(prev => [notif, ...prev]);
  };

  const loadAllData = useCallback(async (userId: string) => {
    try {
      const [prof, custs, supps, sls, purs, vchs, cats, exps, sTmpls, eTmpls, notifs, logs, wst] = await Promise.all([
        dataService.getUserSettings(userId),
        dataService.getCustomers(),
        dataService.getSuppliers(),
        dataService.getSales(),
        dataService.getPurchases(),
        dataService.getVouchers(),
        dataService.getCategories(),
        dataService.getExpenses(),
        dataService.getSaleTemplates(),
        dataService.getExpenseTemplates(),
        dataService.getNotifications(),
        dataService.getActivityLogs(),
        dataService.getWaste()
      ]);

      if (prof) setUser({ ...DEFAULT_USER, ...prof, id: userId });
      setCustomers(custs || []);
      setSuppliers(supps || []);
      setSales(sls || []);
      setPurchases(purs || []);
      setVouchers(vchs || []);
      setCategories(cats || []);
      setExpenses(exps || []);
      setSaleTemplates(sTmpls || []);
      setExpenseTemplates(eTmpls || []);
      setNotifications(notifs || []);
      setActivityLogs(logs || []);
      setWasteRecords(wst || []);
    } catch (e) { console.error("Load Error", e); }
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem('local_user_id');
    if (uid) {
      setIsLoggedIn(true);
      loadAllData(uid);
      setCurrentPage('dashboard');
    }
  }, [loadAllData]);

  const value = {
    isLoggedIn, user, customers, suppliers, sales, purchases, vouchers, categories, expenses, wasteRecords, notifications, activityLogs, saleTemplates, expenseTemplates, currentPage, theme, navigationParams, exchangeRates,
    
    navigate: (p: Page, params?: any) => { setCurrentPage(p); setNavigationParams(params); },
    toggleTheme: () => {
      const nt = theme === 'light' ? 'dark' : 'light';
      setTheme(nt);
      localStorage.setItem('theme', nt);
      document.documentElement.classList.toggle('dark', nt === 'dark');
    },

    loginAction: async (id: string, pass: string) => {
      localStorage.setItem('local_user_id', id);
      setIsLoggedIn(true);
      await loadAllData(id);
      setCurrentPage('dashboard');
    },

    registerAction: async (data: any) => {
      const userId = data.email || 'user_' + Date.now();
      await dataService.updateUserSettings(userId, { agency_name: data.agencyName, full_name: data.fullName });
      localStorage.setItem('local_user_id', userId);
      setIsLoggedIn(true);
      await loadAllData(userId);
      setCurrentPage('dashboard');
    },

    addNotification,
    markNotificationsAsRead: async () => {
      await dataService.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    },

    addSale: async (s: any) => {
      const saved = await dataService.saveSale(s);
      if (saved) {
        setSales(prev => [saved, ...prev]);
        const cat = categories.find(c => c.name === s.qat_type);
        if (cat) {
          const newStock = cat.stock - s.quantity;
          await dataService.updateCategory(cat.id, { stock: newStock });
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, stock: newStock } : c));
        }
        await addLog('بيع', `فاتورة لـ ${s.customer_name} بمبلغ ${s.total}`, 'sale');
        setCurrentPage('sales');
      }
    },

    returnSale: async (id: string) => {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        await dataService.updateSale(id, { is_returned: true });
        setSales(prev => prev.map(s => s.id === id ? { ...s, is_returned: true } : s));
        const cat = categories.find(c => c.name === sale.qat_type);
        if (cat) {
          const newStock = cat.stock + sale.quantity;
          await dataService.updateCategory(cat.id, { stock: newStock });
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, stock: newStock } : c));
        }
        await addLog('مرتجع بيع', `إرجاع فاتورة ${sale.customer_name}`, 'sale');
      }
    },
    
    addPurchase: async (p: any) => {
      const saved = await dataService.savePurchase(p);
      if (saved) {
        setPurchases(prev => [saved, ...prev]);
        const cat = categories.find(c => c.name === p.qat_type);
        if (cat) {
          const newStock = cat.stock + p.quantity;
          await dataService.updateCategory(cat.id, { stock: newStock });
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, stock: newStock } : c));
        }
        await addLog('شراء', `توريد من ${p.supplier_name}`, 'purchase');
        setCurrentPage('purchases');
      }
    },

    returnPurchase: async (id: string) => {
      const pur = purchases.find(p => p.id === id);
      if (pur) {
        await dataService.updatePurchase(id, { is_returned: true });
        setPurchases(prev => prev.map(p => p.id === id ? { ...p, is_returned: true } : p));
        const cat = categories.find(c => c.name === pur.qat_type);
        if (cat) {
          const newStock = cat.stock - pur.quantity;
          await dataService.updateCategory(cat.id, { stock: newStock });
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, stock: newStock } : c));
        }
        await addLog('مرتجع شراء', `إرجاع توريد من ${pur.supplier_name}`, 'purchase');
      }
    },

    addVoucher: async (v: any) => {
      const saved = await dataService.saveVoucher(v);
      if (saved) {
        setVouchers(prev => [saved, ...prev]);
        await addLog('سند مالي', `سند ${v.type} لـ ${v.person_name} بمبلغ ${v.amount}`, 'voucher');
        setCurrentPage('vouchers');
      }
    },

    addExpense: async (e: any) => {
      const saved = await dataService.saveExpense(e);
      if (saved) {
        setExpenses(prev => [saved, ...prev]);
        await addLog('مصروفات', `صرف ${e.title} بمبلغ ${e.amount}`, 'system');
        setCurrentPage('expenses');
      }
    },

    addWaste: async (w: any) => {
      const saved = await dataService.saveWaste(w);
      if (saved) {
        setWasteRecords(prev => [saved, ...prev]);
        const cat = categories.find(c => c.name === w.qat_type);
        if (cat) {
          const newStock = cat.stock - w.quantity;
          await dataService.updateCategory(cat.id, { stock: newStock });
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, stock: newStock } : c));
        }
        await addLog('تالف', `تسجيل تالف ${w.qat_type} كمية ${w.quantity}`, 'waste');
        setCurrentPage('waste');
      }
    },

    deleteRecord: async (table: string, id: string) => {
      await dataService.deleteRecord(table, id);
      if (table === 'sales') setSales(prev => prev.filter(s => s.id !== id));
      if (table === 'purchases') setPurchases(prev => prev.filter(p => p.id !== id));
      if (table === 'expenses') setExpenses(prev => prev.filter(e => e.id !== id));
      if (table === 'vouchers') setVouchers(prev => prev.filter(v => v.id !== id));
      if (table === 'waste') setWasteRecords(prev => prev.filter(w => w.id !== id));
      if (table === 'customers') setCustomers(prev => prev.filter(c => c.id !== id));
      if (table === 'suppliers') setSuppliers(prev => prev.filter(s => s.id !== id));
      if (table === 'categories') setCategories(prev => prev.filter(c => c.id !== id));
      await addLog('حذف', `تم حذف سجل من ${table}`, 'system');
    },

    updateExchangeRates: (rates: ExchangeRates) => {
      setExchangeRates(rates);
      localStorage.setItem('exchange_rates', JSON.stringify(rates));
    },
    
    addCustomer: async (c: any) => {
      const saved = await dataService.saveCustomer(c);
      if (saved) setCustomers(prev => [saved, ...prev]);
      setCurrentPage('customers');
    },
    
    addSupplier: async (s: any) => {
      const saved = await dataService.saveSupplier(s);
      if (saved) setSuppliers(prev => [saved, ...prev]);
      setCurrentPage('suppliers');
    },
    
    addCategory: async (c: any) => {
      const saved = await dataService.saveCategory(c);
      if (saved) setCategories(prev => [saved, ...prev]);
      setCurrentPage('categories');
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);