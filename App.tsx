
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import SalesList from './components/SalesList';
import AddSale from './components/AddSale';
import PurchasesList from './components/PurchasesList';
import AddPurchase from './components/AddPurchase';
import CustomersList from './components/CustomersList';
import AddCustomer from './components/AddCustomer';
import SuppliersList from './components/SuppliersList';
import AddSupplier from './components/AddSupplier';
import CategoriesList from './components/CategoriesList';
import AddCategory from './components/AddCategory';
import VouchersList from './components/VouchersList';
import AddVoucher from './components/AddVoucher';
import AIAdvisor from './components/AIAdvisor';
import NotificationsPage from './components/NotificationsPage';
import ExpensesList from './components/ExpensesList';
import AddExpense from './components/AddExpense';
import DebtsReport from './components/DebtsReport';
import AddOpeningBalance from './components/AddOpeningBalance';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';
import BarcodeScanner from './components/BarcodeScanner';
import BottomNav from './components/BottomNav';
import VoiceAssistant from './components/VoiceAssistant';
import LoginPage from './components/LoginPage';
import VisualInvoice from './components/VisualInvoice';
import WasteList from './components/WasteList';
import AddWaste from './components/AddWaste';
import ActivityLogPage from './components/ActivityLogPage';

const AppContent: React.FC = () => {
  const { currentPage, theme, isLoggedIn } = useApp();

  const renderPage = () => {
    if (!isLoggedIn) return <LoginPage />;

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'sales': return <SalesList />;
      case 'add-sale': return <AddSale />;
      case 'purchases': return <PurchasesList />;
      case 'add-purchase': return <AddPurchase />;
      case 'customers': return <CustomersList />;
      case 'add-customer': return <AddCustomer />;
      case 'suppliers': return <SuppliersList />;
      case 'add-supplier': return <AddSupplier />;
      case 'categories': return <CategoriesList />;
      case 'add-category': return <AddCategory />;
      case 'vouchers': return <VouchersList />;
      case 'add-voucher': return <AddVoucher />;
      case 'expenses': return <ExpensesList />;
      case 'add-expense': return <AddExpense />;
      case 'waste': return <WasteList />;
      case 'add-waste': return <AddWaste />;
      case 'debts': return <DebtsReport />;
      case 'add-opening-balance': return <AddOpeningBalance />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      case 'ai-advisor': return <AIAdvisor />;
      case 'notifications': return <NotificationsPage />;
      case 'scanner': return <BarcodeScanner />;
      case 'invoice-view': return <VisualInvoice />;
      case 'activity-log': return <ActivityLogPage />;
      case 'login': return <LoginPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden w-full transition-colors duration-500 ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-gray-100'}`}>
      {renderPage()}
      {isLoggedIn && <BottomNav />}
      {isLoggedIn && <VoiceAssistant />}
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
