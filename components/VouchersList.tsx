
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, shareToTelegram, formatVoucherReceipt } from '../services/shareService';
import { Voucher, VoucherEditEntry } from '../types';

const VouchersList: React.FC = () => {
  const { vouchers, navigate, deleteVoucher, updateVoucher } = useApp();
  const [filter, setFilter] = useState<'الكل' | 'قبض' | 'دفع'>('الكل');
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Voucher>>({});
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);

  const filteredVouchers = vouchers.filter(v => 
    filter === 'الكل' || v.type === filter
  );

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السند؟')) {
      deleteVoucher(id);
    }
  };

  const handleStartEdit = (voucher: Voucher) => {
    setEditingVoucherId(voucher.id);
    setEditForm({ ...voucher });
  };

  const handleSaveEdit = () => {
    if (!editingVoucherId || !editForm.amount || editForm.amount <= 0) return;

    const originalVoucher = vouchers.find(v => v.id === editingVoucherId);
    if (!originalVoucher) return;

    // سجل التغييرات
    const newHistoryEntry: VoucherEditEntry = {
      date: new Date().toISOString(),
      previous_amount: originalVoucher.amount,
      previous_notes: originalVoucher.notes || ''
    };

    const updatedHistory = [
      newHistoryEntry,
      ...(originalVoucher.edit_history || [])
    ].slice(0, 5); // الاحتفاظ بآخر 5 تعديلات فقط

    updateVoucher(editingVoucherId, {
      amount: editForm.amount,
      notes: editForm.notes,
      currency: editForm.currency,
      edit_history: updatedHistory
    });

    setEditingVoucherId(null);
  };

  const handleShare = (voucher: Voucher, platform: 'wa' | 'tg') => {
    const text = formatVoucherReceipt(voucher);
    if (platform === 'wa') shareToWhatsApp(text);
    else shareToTelegram(text);
  };

  const totalReceipts = filteredVouchers.filter(v => v.type === 'قبض').reduce((sum, v) => sum + v.amount, 0);
  const totalPayments = filteredVouchers.filter(v => v.type === 'دفع').reduce((sum, v) => sum + v.amount, 0);

  return (
    <PageLayout title="سجل السندات المالية" onBack={() => navigate('dashboard')} headerGradient="from-indigo-700 to-slate-900">
      <div className="space-y-6 pt-2 page-enter">
        
        <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          {['الكل', 'قبض', 'دفع'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-indigo-600 dark:bg-indigo-800 text-white font-black">
                  <th className="p-5 border-l border-white/10 text-center w-12 text-white">#</th>
                  <th className="p-5 border-l border-white/10 text-white">النوع</th>
                  <th className="p-5 border-l border-white/10 text-white">المستلم/المسدد</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">المبلغ</th>
                  <th className="p-5 text-center text-white">الإجراءات والمشاركة</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v, index) => {
                  const isEditing = editingVoucherId === v.id;
                  const hasHistory = v.edit_history && v.edit_history.length > 0;

                  return (
                    <React.Fragment key={v.id}>
                      <tr className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30 dark:bg-slate-800/40'}`}>
                        <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center font-black opacity-40 dark:text-white">{index + 1}</td>
                        <td className="p-4 border-l border-gray-100 dark:border-slate-800">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-xl font-black text-[10px] w-fit ${
                              v.type === 'قبض' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                              {v.type === 'قبض' ? '📥 قبض' : '📤 دفع'}
                            </span>
                            {hasHistory && (
                              <button 
                                onClick={() => setShowHistoryId(showHistoryId === v.id ? null : v.id)}
                                className="text-[9px] font-black text-indigo-500 hover:underline text-right"
                              >
                                (تم التعديل - عرض السجل)
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border-l border-gray-100 dark:border-slate-800">
                          {isEditing ? (
                            <div className="space-y-2">
                               <p className="font-black text-xs text-slate-400">{v.person_name}</p>
                               <input 
                                 type="text" 
                                 className="w-full bg-gray-50 dark:bg-slate-800 border border-indigo-200 rounded-lg p-2 font-black text-sm outline-none" 
                                 value={editForm.notes} 
                                 onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                 placeholder="البيان..."
                               />
                            </div>
                          ) : (
                            <div>
                              <p className="font-black text-gray-900 dark:text-white">{v.person_name}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{v.notes || 'بدون بيان'}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                type="number" 
                                className="w-24 bg-gray-50 dark:bg-slate-800 border border-indigo-200 rounded-lg p-2 font-black text-sm text-center outline-none tabular-nums" 
                                value={editForm.amount} 
                                onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                              />
                              <select 
                                className="text-[10px] font-black p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                                value={editForm.currency}
                                onChange={e => setEditForm({...editForm, currency: e.target.value as any})}
                              >
                                <option value="YER">YER</option>
                                <option value="SAR">SAR</option>
                                <option value="OMR">OMR</option>
                              </select>
                            </div>
                          ) : (
                            <span className="font-black text-lg text-indigo-600 dark:text-indigo-400 tabular-nums">
                              {v.amount.toLocaleString()} <small className="text-[10px] opacity-60">{v.currency}</small>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button onClick={handleSaveEdit} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md active:scale-90" title="حفظ">✅</button>
                                <button onClick={() => setEditingVoucherId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md active:scale-90" title="إلغاء">✕</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleShare(v, 'wa')} className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center border border-green-100 shadow-sm" title="مشاركة واتساب">💬</button>
                                <button onClick={() => handleStartEdit(v)} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm" title="تعديل">📝</button>
                                <button onClick={() => handleDelete(v.id)} className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 shadow-sm" title="حذف">🗑️</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {showHistoryId === v.id && (
                        <tr className="bg-indigo-50/50 dark:bg-indigo-950/20 animate-in fade-in duration-300">
                          <td colSpan={5} className="p-4">
                             <div className="space-y-2 border-r-4 border-indigo-400 pr-4">
                               <p className="font-black text-xs text-indigo-600 dark:text-indigo-400">سجل التعديلات السابقة:</p>
                               {v.edit_history?.map((entry, i) => (
                                 <div key={i} className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                                   <span>المبلغ السابق: {entry.previous_amount.toLocaleString()}</span>
                                   <span>البيان: {entry.previous_notes || 'بدون'}</span>
                                   <span className="opacity-60">{new Date(entry.date).toLocaleString('ar-YE')}</span>
                                 </div>
                               ))}
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-900 dark:bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl text-white transition-colors">
          <div className="flex gap-12">
            <div className="text-right">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest opacity-80">إجمالي القبض</p>
              <p className="text-3xl font-black text-green-400 tabular-nums">{totalReceipts.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest opacity-80">إجمالي الدفع</p>
              <p className="text-3xl font-black text-amber-400 tabular-nums">{totalPayments.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('add-voucher', { type: 'قبض' })}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 flex items-center gap-3 border-4 border-white/10"
          >
            <span>سند جديد</span>
            <span className="text-2xl">＋</span>
          </button>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default VouchersList;
