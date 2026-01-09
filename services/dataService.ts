import { Sale, Customer, Purchase, Supplier, QatCategory, Voucher, Expense, Waste, AppNotification, SaleTemplate, ExpenseTemplate, User, ActivityLog, PerformanceSummary } from "../types";

const getUserId = () => localStorage.getItem('local_user_id') || 'default_user';

const getLocal = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
  // --- التقارير المتقدمة ---
  async getPerformanceSummary(): Promise<PerformanceSummary[]> {
    // محاكاة تقارير الأداء من المبيعات والمصروفات المحلية
    const sales = getLocal('sales') as Sale[];
    const expenses = getLocal('expenses') as Expense[];
    const waste = getLocal('waste') as Waste[];
    
    // تجميع البيانات حسب التاريخ (تبسيط)
    return [{
      report_date: new Date().toISOString(),
      sales_count: sales.length,
      gross_sales: sales.reduce((a, b) => a + b.total, 0),
      total_expenses: expenses.reduce((a, b) => a + b.amount, 0),
      total_waste: waste.reduce((a, b) => a + b.estimated_loss, 0),
      net_profit: sales.reduce((a, b) => a + b.total, 0) - expenses.reduce((a, b) => a + b.amount, 0) - waste.reduce((a, b) => a + b.estimated_loss, 0)
    }];
  },

  // --- الأصناف والمخزون ---
  async getCategories(): Promise<QatCategory[]> {
    return getLocal('categories');
  },

  async saveCategory(cat: Partial<QatCategory>) {
    const current = getLocal('categories');
    const newCat = { ...cat, id: Date.now().toString(), created_at: new Date().toISOString() };
    setLocal('categories', [newCat, ...current]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<QatCategory>) {
    const current = getLocal('categories');
    setLocal('categories', current.map((c: any) => c.id === id ? { ...c, ...updates } : c));
  },

  // --- المبيعات ---
  async getSales(): Promise<Sale[]> {
    return getLocal('sales');
  },

  async saveSale(sale: Partial<Sale>) {
    const current = getLocal('sales');
    const newSale = { ...sale, id: Date.now().toString(), date: new Date().toISOString() };
    setLocal('sales', [newSale, ...current]);
    return newSale;
  },

  async updateSale(id: string, updates: Partial<Sale>) {
    const current = getLocal('sales');
    setLocal('sales', current.map((s: any) => s.id === id ? { ...s, ...updates } : s));
  },

  // --- المشتريات ---
  async getPurchases(): Promise<Purchase[]> {
    return getLocal('purchases');
  },

  async savePurchase(purchase: Partial<Purchase>) {
    const current = getLocal('purchases');
    const newPur = { ...purchase, id: Date.now().toString(), date: new Date().toISOString() };
    setLocal('purchases', [newPur, ...current]);
    return newPur;
  },

  async updatePurchase(id: string, updates: Partial<Purchase>) {
    const current = getLocal('purchases');
    setLocal('purchases', current.map((p: any) => p.id === id ? { ...p, ...updates } : p));
  },

  // --- العملاء والموردين ---
  async getCustomers(): Promise<Customer[]> {
    return getLocal('customers');
  },

  async saveCustomer(cust: Partial<Customer>) {
    const current = getLocal('customers');
    const newCust = { ...cust, id: Date.now().toString() };
    setLocal('customers', [newCust, ...current]);
    return newCust;
  },

  async getSuppliers(): Promise<Supplier[]> {
    return getLocal('suppliers');
  },

  async saveSupplier(supp: Partial<Supplier>) {
    const current = getLocal('suppliers');
    const newSupp = { ...supp, id: Date.now().toString() };
    setLocal('suppliers', [newSupp, ...current]);
    return newSupp;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const current = getLocal('suppliers');
    setLocal('suppliers', current.map((s: any) => s.id === id ? { ...s, ...updates } : s));
  },

  // --- السندات ---
  async getVouchers(): Promise<Voucher[]> {
    return getLocal('vouchers');
  },

  async saveVoucher(vouch: Partial<Voucher>) {
    const current = getLocal('vouchers');
    const newVouch = { ...vouch, id: Date.now().toString(), date: new Date().toISOString() };
    setLocal('vouchers', [newVouch, ...current]);
    return newVouch;
  },

  async updateVoucher(id: string, updates: Partial<Voucher>) {
    const current = getLocal('vouchers');
    setLocal('vouchers', current.map((v: any) => v.id === id ? { ...v, ...updates } : v));
  },

  // --- المصروفات والتالف ---
  async getExpenses(): Promise<Expense[]> {
    return getLocal('expenses');
  },

  async saveExpense(expense: Partial<Expense>) {
    const current = getLocal('expenses');
    const newExp = { ...expense, id: Date.now().toString(), date: new Date().toISOString() };
    setLocal('expenses', [newExp, ...current]);
    return newExp;
  },

  async updateExpense(id: string, updates: Partial<Expense>) {
    const current = getLocal('expenses');
    setLocal('expenses', current.map((e: any) => e.id === id ? { ...e, ...updates } : e));
  },

  async getWaste(): Promise<Waste[]> {
    return getLocal('waste');
  },

  async saveWaste(waste: Partial<Waste>) {
    const current = getLocal('waste');
    const newWst = { ...waste, id: Date.now().toString(), date: new Date().toISOString() };
    setLocal('waste', [newWst, ...current]);
    return newWst;
  },

  // --- القوالب ---
  async getSaleTemplates(): Promise<SaleTemplate[]> {
    return getLocal('sale_templates');
  },

  async saveSaleTemplate(tmpl: Partial<SaleTemplate>) {
    const current = getLocal('sale_templates');
    const newTmpl = { ...tmpl, id: Date.now().toString() };
    setLocal('sale_templates', [newTmpl, ...current]);
    return newTmpl;
  },

  async getExpenseTemplates(): Promise<ExpenseTemplate[]> {
    return getLocal('expense_templates');
  },

  async saveExpenseTemplate(tmpl: Partial<ExpenseTemplate>) {
    const current = getLocal('expense_templates');
    const newTmpl = { ...tmpl, id: Date.now().toString() };
    setLocal('expense_templates', [newTmpl, ...current]);
    return newTmpl;
  },

  // --- التنبيهات والضبط ---
  async getNotifications(): Promise<AppNotification[]> {
    return getLocal('notifications');
  },

  async saveNotification(notif: Partial<AppNotification>) {
    const current = getLocal('notifications');
    setLocal('notifications', [notif, ...current]);
  },

  async markNotificationsRead() {
    const current = getLocal('notifications');
    setLocal('notifications', current.map((n: any) => ({ ...n, read: true })));
  },

  async getUserSettings(userId: string): Promise<Partial<User> | null> {
    return JSON.parse(localStorage.getItem('user_profile') || 'null');
  },

  async updateUserSettings(userId: string, updates: Partial<User>) {
    const current = JSON.parse(localStorage.getItem('user_profile') || '{}');
    localStorage.setItem('user_profile', JSON.stringify({ ...current, ...updates }));
  },

  // --- الحذف العام ---
  async deleteRecord(table: string, id: string) {
    const current = getLocal(table);
    setLocal(table, current.filter((i: any) => i.id !== id));
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    return getLocal('activity_logs');
  },

  async saveActivityLog(log: Partial<ActivityLog>) {
    const current = getLocal('activity_logs');
    setLocal('activity_logs', [log, ...current].slice(0, 50));
  }
};