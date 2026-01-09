
import { Sale, Customer, Purchase, Voucher, Expense, Supplier } from "../types";

const APP_NAME = "وكاله الشويع للقات";

export const shareToWhatsApp = (text: string, phone?: string) => {
  let finalPhone = "";
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    finalPhone = cleanPhone.startsWith('967') ? cleanPhone : `967${cleanPhone}`;
  }
  
  const url = finalPhone 
    ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareToTelegram = (text: string) => {
  const url = `https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const formatSaleInvoice = (sale: Sale, agencyName: string) => {
  return `*🧾 فاتورة مبيعات - ${agencyName}*\n` +
         `---------------------------\n` +
         `👤 *العميل:* ${sale.customer_name}\n` +
         `🌿 *الصنف:* ${sale.qat_type}\n` +
         `📦 *الكمية:* ${sale.quantity}\n` +
         `💰 *الإجمالي:* ${sale.total.toLocaleString()} ${sale.currency}\n` +
         `💳 *الحالة:* ${sale.status}\n` +
         `📅 *التاريخ:* ${new Date(sale.date).toLocaleString('ar-YE')}\n` +
         `---------------------------\n` +
         `✨ شكراً لتعاملكم معنا ✨`;
};

export const formatPurchaseInvoice = (purchase: Purchase, agencyName: string) => {
  return `*📦 إشعار توريد/شراء - ${agencyName}*\n` +
         `---------------------------\n` +
         `👤 *المورد:* ${purchase.supplier_name}\n` +
         `🌿 *الصنف:* ${purchase.qat_type}\n` +
         `📦 *الكمية:* ${purchase.quantity}\n` +
         `💰 *القيمة:* ${purchase.total.toLocaleString()} ${purchase.currency}\n` +
         `💳 *الحالة:* ${purchase.status}\n` +
         `📅 *التاريخ:* ${new Date(purchase.date).toLocaleString('ar-YE')}\n` +
         `---------------------------\n` +
         `✅ تم قيد المشتريات في النظام`;
};

export const formatVoucherReceipt = (voucher: Voucher) => {
  const typeText = voucher.type === 'قبض' ? 'إشعار استلام مبلغ' : 'إشعار سداد مبلغ';
  const emoji = voucher.type === 'قبض' ? '📥' : '📤';
  
  return `*${emoji} ${typeText}*\n` +
         `*${APP_NAME}*\n` +
         `---------------------------\n` +
         `👤 *إلى/من:* ${voucher.person_name}\n` +
         `💰 *المبلغ:* ${voucher.amount.toLocaleString()} ${voucher.currency}\n` +
         `📝 *البيان:* ${voucher.notes || 'بدون ملاحظات'}\n` +
         `📅 *التاريخ:* ${new Date(voucher.date).toLocaleString('ar-YE')}\n` +
         `---------------------------\n` +
         `✅ تم التوثيق مالياً في النظام`;
};

export const formatCustomerStatement = (
  customer: Customer, 
  sales: Sale[], 
  vouchers: Voucher[], 
  balances: {currency: string, amount: number}[]
) => {
  const lastOps = [...sales.filter(s => s.customer_id === customer.id), ...vouchers.filter(v => v.person_id === customer.id)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  let text = `*📑 كشف حساب عميل - ${customer.name}*\n` +
             `*${APP_NAME}*\n` +
             `---------------------------\n` +
             `*آخر 5 عمليات:*\n`;

  lastOps.forEach(op => {
    const isSale = 'qat_type' in op;
    text += isSale 
      ? `🔹 بيع: ${op.qat_type} | ${op.total.toLocaleString()} ${op.currency}\n`
      : `🔸 قبض: ${op.amount.toLocaleString()} ${op.currency} | ${op.notes || 'قبض حساب'}\n`;
  });

  text += `---------------------------\n` +
          `*📊 الأرصدة المستحقة حالياً:*\n`;
  
  balances.forEach(b => {
    if (b.amount > 0) text += `💰 ${b.amount.toLocaleString()} ${b.currency}\n`;
  });

  if (balances.every(b => b.amount <= 0)) text += `✅ الحساب مصفى بالكامل\n`;

  text += `---------------------------\n` +
          `📅 تاريخ الكشف: ${new Date().toLocaleDateString('ar-YE')}`;
  
  return text;
};

export const formatSupplierStatement = (
  supplier: Supplier, 
  purchases: Purchase[], 
  vouchers: Voucher[], 
  balances: {currency: string, amount: number}[]
) => {
  const lastOps = [...purchases.filter(p => p.supplier_id === supplier.id), ...vouchers.filter(v => v.person_id === supplier.id)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  let text = `*📦 كشف حساب مورد - ${supplier.name}*\n` +
             `*${APP_NAME}*\n` +
             `---------------------------\n` +
             `*آخر المشتريات والمدفوعات:*\n`;

  lastOps.forEach(op => {
    const isPurchase = 'supplier_id' in op;
    text += isPurchase 
      ? `🔺 شراء: ${op.qat_type} | ${op.total.toLocaleString()} ${op.currency}\n`
      : `🔻 سداد: ${op.amount.toLocaleString()} ${op.currency} | ${op.notes || 'سداد حساب'}\n`;
  });

  text += `---------------------------\n` +
          `*📊 رصيدكم المستحق لدينا:*\n`;
  
  balances.forEach(b => {
    if (b.amount > 0) text += `💰 ${b.amount.toLocaleString()} ${b.currency}\n`;
  });

  if (balances.every(b => b.amount <= 0)) text += `✅ لا توجد مستحقات حالياً\n`;

  return text + `\n📅 ${new Date().toLocaleDateString('ar-YE')}`;
};

export const formatBudgetSummary = (summary: {currency: string, assets: number, liabilities: number}[]) => {
  let text = `*⚖️ ملخص الميزانية العامة*\n` +
             `*${APP_NAME}*\n` +
             `---------------------------\n`;
             
  summary.forEach(s => {
    text += `*عملة: ${s.currency}*\n` +
            `🔹 لنا عند العملاء: ${s.assets.toLocaleString()}\n` +
            `🔸 علينا للموردين: ${s.liabilities.toLocaleString()}\n` +
            `📈 الصافي: ${(s.assets - s.liabilities).toLocaleString()}\n` +
            `----------\n`;
  });
  
  return text + `📅 التاريخ: ${new Date().toLocaleString('ar-YE')}`;
};

export const formatDailyReport = (sales: Sale[], expenses: Expense[], netProfit: number) => {
  const totalS = sales.reduce((sum, s) => sum + s.total, 0);
  const totalE = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return `*📊 التقرير المالي اليومي - ${APP_NAME}*\n` +
         `---------------------------\n` +
         `📅 *التاريخ:* ${new Date().toLocaleDateString('ar-YE')}\n\n` +
         `💵 *إجمالي المبيعات:* ${totalS.toLocaleString()} ريال\n` +
         `💸 *إجمالي المصاريف:* ${totalE.toLocaleString()} ريال\n` +
         `📈 *صافي الأرباح:* ${netProfit.toLocaleString()} ريال\n\n` +
         `✅ تم التصدير آلياً من نظام الشويع الذكي`;
};
