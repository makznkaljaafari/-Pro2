
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Expense } from '../types';

const ExpensesList: React.FC = () => {
  const { expenses, expenseTemplates, navigate, deleteExpense, updateExpense, addExpense, deleteExpenseTemplate, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  const filteredExpenses = expenses.filter(e => 
    e.title.includes(searchTerm) || e.category.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      deleteExpense(id);
      addNotification("تم الحذف ✅", "تم حذف سجل المصروف بنجاح.", "info");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const saveEdit = () => {
    if (editingId && editForm.title && editForm.amount) {
      updateExpense(editingId, editForm);
      setEditingId(null);
      addNotification("تم التحديث ✨", "تم حفظ تعديلات المصروف.", "success");
    }
  };

  const getSummary = () => {
    const currencies: ('YER' | 'SAR' | 'OMR')[] = ['YER', 'SAR', 'OMR'];
    return currencies.map(cur => {
      const total = filteredExpenses
        .filter(e => e.currency === cur)
        .reduce((sum, e) => sum + e.amount, 0);
      return { currency: cur, amount: total };
    });
  };

  return (
    <PageLayout title="سجل المصروفات" onBack={() => navigate('dashboard')} headerGradient="from-amber-600 to-orange-700">
      <div className="space-y-8 pt-2 page-enter">
        
        {expenseTemplates.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-black text-lg text-amber-900 dark:text-amber-400 px-2 flex items-center gap-2">
              <span>🔁</span> المصاريف المتكررة
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
              {expenseTemplates.map(template => (
                <div key={template.id} className="flex-shrink-0 bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-100 dark:border-slate-800 shadow-sm w-52 relative group transition-transform active:scale-95">
                  <button onClick={() => deleteExpenseTemplate(template.id)} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full text-[12px] hidden group-hover:flex items-center justify-center shadow-lg z-10">✕</button>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-slate-800 dark:text-white truncate flex-1 text-sm">{template.title}</p>
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[8px] font-black">{template.frequency}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{template.category}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-black text-amber-600 tabular-nums text-lg">{template.amount.toLocaleString()} <small className="text-[8px] uppercase">{template.currency}</small></span>
                    <button onClick={() => addExpense({ title: template.title, category: template.category, amount: template.amount, currency: template.currency, notes: `تكرار ${template.frequency}` })} className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90">＋</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="relative">
            <input 
              type="text"
              placeholder="ابحث عن مصروف..."
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-2xl p-5 pr-14 outline-none font-black text-lg shadow-inner text-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl opacity-40 dark:text-white">🔍</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-amber-600 dark:bg-amber-800 text-white font-black">
                  <th className="p-5 border-l border-white/10 text-center w-12 text-white">#</th>
                  <th className="p-5 border-l border-white/10 text-white">البيان</th>
                  <th className="p-5 border-l border-white/10 text-white">الفئة</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">المبلغ</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">التاريخ</th>
                  <th className="p-5 text-center text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e, index) => {
                  const isEditing = editingId === e.id;
                  return (
                    <tr key={e.id} className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30 dark:bg-slate-800/40'}`}>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center font-black opacity-40 dark:text-white">{index + 1}</td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800">
                        {isEditing ? (
                          <input className="w-full bg-white dark:bg-slate-700 border-2 border-amber-500 rounded p-1 font-black" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                        ) : (
                          <div>
                            <p className="font-black text-gray-900 dark:text-white">{e.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{e.notes || 'بدون ملاحظات'}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800">
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-lg text-xs font-black">{e.category}</span>
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center font-black text-amber-600 dark:text-amber-400 tabular-nums">
                        {isEditing ? (
                          <input type="number" className="w-24 bg-white dark:bg-slate-700 border-2 border-amber-500 rounded p-1 font-black text-center" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseInt(e.target.value) || 0})} />
                        ) : (
                          <>{e.amount.toLocaleString()} <span className="text-[10px] uppercase opacity-60">{e.currency}</span></>
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center text-xs font-bold text-gray-400">
                        {new Date(e.date).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="w-9 h-9 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-md">✅</button>
                              <button onClick={() => setEditingId(null)} className="w-9 h-9 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md">✕</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(e)} className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 active:scale-90 transition-all"><span className="text-lg">📝</span></button>
                              <button onClick={() => handleDelete(e.id)} className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200 active:scale-90 transition-all"><span className="text-lg">🗑️</span></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-900 dark:bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest opacity-80">إجمالي المصروفات</p>
            {getSummary().map(s => s.amount > 0 ? (
              <p key={s.currency} className="text-xl font-black text-amber-400 tabular-nums">{s.amount.toLocaleString()} <span className="text-[10px] uppercase">{s.currency}</span></p>
            ) : null)}
          </div>
          <button onClick={() => navigate('add-expense')} className="bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95 flex items-center gap-3 border-4 border-white/10">
            <span>إضافة مصروف</span>
            <span className="text-3xl">＋</span>
          </button>
        </div>
      </div>
      <div className="pb-40"></div>
    </PageLayout>
  );
};

export default ExpensesList;
