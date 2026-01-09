
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { QatCategory } from '../types';

const CategoriesList: React.FC = () => {
  const { categories, navigate, deleteCategory, updateCategory, isSyncing, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QatCategory>>({});

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      addNotification("تم الحذف بنجاح", "تمت إزالة الصنف من المخزون بنجاح.", "success");
    } catch (err) {
      addNotification("خطأ في الحذف", "فشل حذف الصنف، يرجى المحاولة مرة أخرى.", "warning");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (cat: QatCategory) => {
    setEditingId(cat.id);
    setEditForm(cat);
  };

  const saveEdit = () => {
    if (editingId && editForm.name) {
      updateCategory(editingId, editForm);
      setEditingId(null);
      addNotification("تم التحديث ✨", "تم حفظ تعديلات الصنف بنجاح.", "success");
    }
  };

  const getInventorySummary = () => {
    const currencies: ('YER' | 'SAR' | 'OMR')[] = ['YER', 'SAR', 'OMR'];
    return currencies.map(cur => {
      const total = filteredCategories
        .filter(cat => cat.currency === cur)
        .reduce((sum, cat) => sum + (cat.stock * cat.price), 0);
      return { currency: cur, amount: total };
    });
  };

  return (
    <PageLayout title="جرد الأصناف والمخزون" onBack={() => navigate('dashboard')} headerGradient="from-emerald-700 to-teal-900">
      <div className="space-y-6 pt-2 page-enter">
        
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">تأكيد حذف الصنف</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  هل أنت متأكد من حذف هذا الصنف؟ هذا الإجراء قد يؤثر على تقارير المبيعات المرتبطة به.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDeleteConfirm}
                    disabled={isSyncing}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSyncing ? 'جاري الحذف...' : 'نعم، حذف'}
                  </button>
                  <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black active:scale-95 transition-all">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative group">
          <input 
            type="text"
            placeholder="ابحث عن صنف..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl p-6 pr-16 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-black text-lg shadow-sm text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30 dark:text-white">🔍</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 transition-colors transform-gpu">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-emerald-600 dark:bg-emerald-800 text-white font-black">
                  <th className="p-5 border-l border-white/10 text-center w-12 text-white">#</th>
                  <th className="p-5 border-l border-white/10 text-white">اسم الصنف</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">الكمية</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">السعر</th>
                  <th className="p-5 border-l border-white/10 text-center text-white">إجمالي القيمة</th>
                  <th className="p-5 text-center text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat, index) => {
                  const isEditing = editingId === cat.id;
                  return (
                    <tr key={cat.id} className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30 dark:bg-slate-800/40'}`}>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center font-black opacity-40 dark:text-white">{index + 1}</td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800">
                        {isEditing ? (
                          <input className="w-full bg-white dark:bg-slate-700 border-2 border-emerald-500 rounded p-1 font-black" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🌿</span>
                            <span className="font-black text-gray-900 dark:text-white">{cat.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center">
                        {isEditing ? (
                          <input type="number" className="w-20 bg-white dark:bg-slate-700 border-2 border-emerald-500 rounded p-1 font-black text-center" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})} />
                        ) : (
                          <span className={`px-4 py-2 rounded-xl font-black tabular-nums text-lg ${cat.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                            {cat.stock} <small className="text-[10px] mr-1">كيس</small>
                          </span>
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center">
                        {isEditing ? (
                          <input type="number" className="w-24 bg-white dark:bg-slate-700 border-2 border-emerald-500 rounded p-1 font-black text-center" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseInt(e.target.value) || 0})} />
                        ) : (
                          <span className="font-bold text-gray-600 dark:text-white tabular-nums">{cat.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-100 dark:border-slate-800 text-center">
                        <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {(cat.stock * cat.price).toLocaleString()}
                          <span className="text-[10px] mr-1 uppercase opacity-60">{cat.currency}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-md">✅</button>
                              <button onClick={() => setEditingId(null)} className="w-10 h-10 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md">✕</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(cat)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 active:scale-90 transition-all" title="تعديل"><span className="text-lg">📝</span></button>
                              <button onClick={() => setDeleteId(cat.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center border border-red-100 active:scale-90 transition-all" title="حذف"><span className="text-lg">🗑️</span></button>
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

        <div className="bg-emerald-900 dark:bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl text-white transition-colors transform-gpu">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest opacity-80">عدد الأصناف</p>
              <p className="text-3xl font-black tabular-nums">{filteredCategories.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest opacity-80">قيمة المخزون</p>
              <div className="flex flex-col">
                {getInventorySummary().map(sum => sum.amount > 0 ? (
                   <p key={sum.currency} className="text-xl font-black text-emerald-400 tabular-nums">{sum.amount.toLocaleString()} <span className="text-[10px] uppercase">{sum.currency}</span></p>
                ) : null)}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('add-category')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 flex items-center gap-3 border-4 border-white/10">
            <span>إضافة صنف</span>
            <span className="text-2xl">＋</span>
          </button>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default CategoriesList;
