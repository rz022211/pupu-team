import React, { useState } from 'react';
import { InventoryItem } from '../../types/pos';
import { Package, AlertTriangle, CheckCircle2, Plus, Search, RefreshCw } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onRestock: (itemId: string, addAmount: number) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, onRestock }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [customAddAmount, setCustomAddAmount] = useState<number>(10);

  const categories = ['全部', '茶葉', '乳製品', '配料', '糖漿', '包材耗材'];

  const filteredItems = inventory.filter((item) => {
    const matchCat = selectedCategory === '全部' || item.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      item.name.includes(searchQuery.trim()) ||
      item.category.includes(searchQuery.trim());
    return matchCat && matchSearch;
  });

  const lowStockCount = inventory.filter((item) => item.currentStock <= item.safetyStock).length;
  const totalValuation = inventory.reduce(
    (sum, item) => sum + item.currentStock * item.costPerUnit,
    0
  );

  const handleQuickAdd = (item: InventoryItem, amount: number) => {
    bobaAudio.playSeal();
    onRestock(item.id, amount);
  };

  const handleCustomRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || customAddAmount <= 0) return;
    bobaAudio.playSeal();
    onRestock(restockModalItem.id, customAddAmount);
    setRestockModalItem(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#0F1014] text-stone-100 overflow-y-auto select-none">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#171922] border border-[#262A37] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">總原物料品項</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {inventory.length} <span className="text-xs font-normal text-stone-400">項</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#232736] flex items-center justify-center text-amber-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171922] border border-[#262A37] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">低水位安全警戒品項</span>
            <div className="text-2xl font-mono font-bold text-red-400 mt-1">
              {lowStockCount} <span className="text-xs font-normal text-stone-400">項需補貨</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171922] border border-[#262A37] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">庫存總估值 (總成本)</span>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
              NT$ {Math.round(totalValuation).toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#232736] flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="bg-[#14161D] border border-[#262A37] rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-[#1C1F2A] border border-[#282C38] text-stone-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋物料品名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* High Density Inventory Data Table */}
      <div className="bg-[#14161D] border border-[#262A37] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
              <tr>
                <th className="py-3 px-4 font-semibold">物料名稱</th>
                <th className="py-3 px-4 font-semibold">分類</th>
                <th className="py-3 px-4 font-semibold text-right">現有庫存</th>
                <th className="py-3 px-4 font-semibold text-right">安全水位</th>
                <th className="py-3 px-4 font-semibold text-right">單位成本</th>
                <th className="py-3 px-4 font-semibold text-center">庫存狀態</th>
                <th className="py-3 px-4 font-semibold">最後補貨時間</th>
                <th className="py-3 px-4 font-semibold text-right">補貨操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212430]">
              {filteredItems.map((item) => {
                const isCritical = item.currentStock <= item.safetyStock;
                return (
                  <tr key={item.id} className="hover:bg-[#1B1E29] transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                    <td className="py-3 px-4 text-stone-400">{item.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isCritical ? 'text-red-400' : 'text-stone-200'}>
                        {item.currentStock.toFixed(item.unit === 'kg' ? 1 : 0)}
                      </span>{' '}
                      <span className="text-[11px] text-stone-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-400">
                      {item.safetyStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-300">
                      NT$ {item.costPerUnit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-950/50 border border-red-800/60 px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> 庫存偏低
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> 充足正常
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                      {item.lastRestocked}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleQuickAdd(item, item.unit === 'kg' ? 5 : 20)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-[#232736] hover:bg-[#2C3144] text-stone-200 rounded-lg transition-colors border border-[#323749]"
                      >
                        +快速進貨
                      </button>
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setCustomAddAmount(item.unit === 'kg' ? 10 : 50);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg transition-colors border border-amber-600/40"
                      >
                        自訂補貨
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleCustomRestockSubmit}
            className="w-full max-w-sm bg-[#181A22] border border-[#2D3240] rounded-2xl p-5 text-stone-100 shadow-2xl space-y-4 animate-fade-in"
          >
            <div>
              <h3 className="text-sm font-bold text-white">自訂原物料補貨</h3>
              <p className="text-xs text-amber-400 mt-0.5">
                {restockModalItem.name} ({restockModalItem.category})
              </p>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">
                補貨進貨數量 ({restockModalItem.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={customAddAmount}
                onChange={(e) => setCustomAddAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111319] border border-[#2D3240] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-xs text-stone-400 space-y-0.5 bg-[#14161E] p-2.5 rounded-lg border border-[#262A37]">
              <div>目前庫存：{restockModalItem.currentStock} {restockModalItem.unit}</div>
              <div className="text-emerald-400">
                補貨後預計：{(restockModalItem.currentStock + customAddAmount).toFixed(1)} {restockModalItem.unit}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-white rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
              >
                確認入庫進貨
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
