import React, { useState } from 'react';
import { InventoryItem, RestockRecord } from '../../types/pos';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  History,
  Edit3,
  Sliders,
  ArrowDownToLine,
  Truck,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface InventoryTabProps {
  inventory: InventoryItem[];
  restockRecords?: RestockRecord[];
  onRestock: (itemId: string, addAmount: number, operatorName?: string) => void;
  onUpdateFixedStock?: (itemId: string, newFixedStock: number) => void;
  onBulkRestockToFixed?: (itemIds?: string[]) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  restockRecords = [],
  onRestock,
  onUpdateFixedStock,
  onBulkRestockToFixed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'history'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [healthFilter, setHealthFilter] = useState<'all' | 'critical' | 'shortfall' | 'healthy'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [customAddAmount, setCustomAddAmount] = useState<number>(10);
  const [operatorName, setOperatorName] = useState<string>('門市吧檯手');

  const [editFixedModalItem, setEditFixedModalItem] = useState<InventoryItem | null>(null);
  const [editingFixedStock, setEditingFixedStock] = useState<number>(0);

  const categories = ['全部', '茶葉', '乳製品', '配料', '糖漿', '包材耗材'];

  // Filtering
  const filteredItems = inventory.filter((item) => {
    const matchCat = selectedCategory === '全部' || item.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      item.category.includes(searchQuery.trim());

    const isCritical = item.currentStock <= item.safetyStock;
    const isShortfall = item.currentStock < item.fixedStock;
    const isHealthy = !isCritical && !isShortfall;

    let matchHealth = true;
    if (healthFilter === 'critical') matchHealth = isCritical;
    else if (healthFilter === 'shortfall') matchHealth = isShortfall;
    else if (healthFilter === 'healthy') matchHealth = isHealthy;

    return matchCat && matchSearch && matchHealth;
  });

  // Aggregated KPIs
  const lowStockCount = inventory.filter((item) => item.currentStock <= item.safetyStock).length;
  const shortfallCount = inventory.filter((item) => item.currentStock < item.fixedStock).length;
  const totalValuation = inventory.reduce(
    (sum, item) => sum + item.currentStock * item.costPerUnit,
    0
  );
  const totalFixedValuation = inventory.reduce(
    (sum, item) => sum + item.fixedStock * item.costPerUnit,
    0
  );
  const fulfillmentPercent = totalFixedValuation > 0
    ? Math.min(100, Math.round((totalValuation / totalFixedValuation) * 100))
    : 100;

  const totalRestockCount = restockRecords.length;
  const totalRestockCost = restockRecords.reduce((sum, r) => sum + r.totalCost, 0);

  // Quick Restock by default batch amount
  const handleQuickDefaultRestock = (item: InventoryItem) => {
    bobaAudio.playSeal();
    onRestock(item.id, item.defaultRestockAmount || (item.unit === 'kg' ? 10 : 30), '標準批次進貨');
  };

  // Quick Restock to reach Fixed Quota
  const handleFillToFixed = (item: InventoryItem) => {
    const needed = Math.round(Math.max(0, item.fixedStock - item.currentStock) * 10) / 10;
    if (needed <= 0) return;
    bobaAudio.playSeal();
    onRestock(item.id, needed, '補足固定基準量');
  };

  const handleCustomRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || customAddAmount <= 0) return;
    bobaAudio.playSeal();
    onRestock(restockModalItem.id, customAddAmount, operatorName);
    setRestockModalItem(null);
  };

  const handleSaveFixedStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFixedModalItem || editingFixedStock <= 0) return;
    bobaAudio.playIceClink();
    if (onUpdateFixedStock) {
      onUpdateFixedStock(editFixedModalItem.id, editingFixedStock);
    }
    setEditFixedModalItem(null);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 bg-[#0F1014] text-stone-100 overflow-y-auto select-none space-y-5">
      {/* Top Banner KPIs (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Items & Par Health */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">總原物料品項</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {inventory.length} <span className="text-xs font-normal text-stone-400">項物料</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              5 大類別 · 全自動扣減庫存
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Fixed Quota Fulfillment Rate (Số lượng cố định) */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">固定基準量達成率 (Par Level)</span>
            <span className="text-xs font-mono font-bold text-amber-400">{fulfillmentPercent}%</span>
          </div>
          <div className="my-2">
            <div className="h-2.5 w-full bg-[#202432] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${fulfillmentPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>現有 NT${Math.round(totalValuation).toLocaleString()}</span>
            <span>定額 NT${Math.round(totalFixedValuation).toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Inbound Restock Quantity & Expense (Số lượng nhập hàng) */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">累計進貨入庫總額 (Restock)</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              NT$ {totalRestockCost.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-400">共 {totalRestockCount} 筆入庫單紀錄</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Shortfall & Safety Alert + Bulk Restock Button */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">需補貨 / 低水位警戒</span>
            <div className="text-2xl font-mono font-bold text-red-400 mt-1">
              {shortfallCount} <span className="text-xs font-normal text-stone-400">項未達固定量</span>
            </div>
            {lowStockCount > 0 ? (
              <span className="text-[11px] text-red-400 font-medium">其中 {lowStockCount} 項低於安全水位</span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-medium">安全水位良好</span>
            )}
          </div>

          {shortfallCount > 0 && onBulkRestockToFixed && (
            <button
              onClick={() => onBulkRestockToFixed()}
              className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
              title="一鍵將所有未達標物料補足至固定基準量"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>一鍵補滿</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: 庫存與進貨配額總表 vs 進貨入庫流水帳紀錄 */}
      <div className="flex items-center justify-between border-b border-[#252837] pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'inventory'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>庫存配額與進貨總表 (Inventory & Quota)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>進貨入庫歷史流水帳 ({restockRecords.length} 筆)</span>
          </button>
        </div>

        {activeSubTab === 'inventory' && onBulkRestockToFixed && shortfallCount > 0 && (
          <button
            onClick={() => onBulkRestockToFixed()}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>將全店 {shortfallCount} 項物料批次進貨至固定基準數量</span>
          </button>
        )}
      </div>

      {activeSubTab === 'inventory' ? (
        <>
          {/* Filter Bar: Categories, Health status filter, Search input */}
          <div className="bg-[#14161D] border border-[#262A37] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-[#1C1F2A] border border-[#282C38] text-stone-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Health Filter & Search */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Quick Health Status Pills */}
              <div className="flex items-center bg-[#181A22] border border-[#262A37] p-0.5 rounded-xl text-xs shrink-0">
                <button
                  onClick={() => setHealthFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    healthFilter === 'all' ? 'bg-[#292D3C] text-white font-medium' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  全部 ({inventory.length})
                </button>
                <button
                  onClick={() => setHealthFilter('shortfall')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    healthFilter === 'shortfall' ? 'bg-amber-600/30 text-amber-300 font-medium' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  未達固定量 ({shortfallCount})
                </button>
                <button
                  onClick={() => setHealthFilter('critical')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    healthFilter === 'critical' ? 'bg-red-950/60 text-red-300 font-medium' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  低警戒 ({lowStockCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜尋物料名稱或類別..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl pl-9 pr-7 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* High-Density Master Inventory & Quota Table */}
          <div className="bg-[#14161D] border border-[#262A37] rounded-2xl overflow-hidden shadow-sm flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">原物料品名</th>
                    <th className="py-3 px-3 font-semibold text-right">現有庫存</th>
                    <th className="py-3 px-3 font-semibold text-right bg-amber-500/5 text-amber-300">
                      固定基準量 (Par)
                    </th>
                    <th className="py-3 px-3 font-semibold text-right">安全低標</th>
                    <th className="py-3 px-3 font-semibold text-right">缺口 / 建議進貨</th>
                    <th className="py-3 px-3 font-semibold text-center">進貨入庫數量 (Restock)</th>
                    <th className="py-3 px-3 font-semibold text-center">配額達成進度</th>
                    <th className="py-3 px-4 font-semibold text-right">進貨與配額操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212430]">
                  {filteredItems.map((item) => {
                    const isCritical = item.currentStock <= item.safetyStock;
                    const shortfall = Math.max(0, item.fixedStock - item.currentStock);
                    const isShortfall = shortfall > 0;
                    const parPercent = Math.min(100, Math.round((item.currentStock / item.fixedStock) * 100));

                    return (
                      <tr key={item.id} className="hover:bg-[#1B1E29] transition-colors">
                        {/* Name & Category */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white text-xs">{item.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-400 font-mono">
                            <span className="px-1.5 py-0.2 rounded bg-[#222533] text-stone-300">
                              {item.category}
                            </span>
                            <span>單價 NT$ {item.costPerUnit}/{item.unit}</span>
                          </div>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              isCritical
                                ? 'text-red-400'
                                : isShortfall
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                            }
                          >
                            {item.currentStock.toFixed(item.unit === 'kg' ? 1 : 0)}
                          </span>{' '}
                          <span className="text-[11px] text-stone-400 font-normal">{item.unit}</span>
                        </td>

                        {/* Fixed Quota (Số lượng cố định) with Edit Icon */}
                        <td className="py-3 px-3 text-right font-mono bg-amber-500/5">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <span className="font-bold text-amber-300">
                              {item.fixedStock.toFixed(item.unit === 'kg' ? 1 : 0)} {item.unit}
                            </span>
                            <button
                              onClick={() => {
                                setEditFixedModalItem(item);
                                setEditingFixedStock(item.fixedStock);
                              }}
                              className="p-1 hover:bg-amber-600/30 rounded text-stone-400 hover:text-amber-300 transition-colors"
                              title="調整固定基準數量 (Số lượng cố định)"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-stone-400">標準維持庫存</div>
                        </td>

                        {/* Safety Stock */}
                        <td className="py-3 px-3 text-right font-mono text-stone-400">
                          {item.safetyStock} {item.unit}
                          {isCritical && (
                            <div className="text-[10px] text-red-400 font-bold flex items-center justify-end gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> 低水位
                            </div>
                          )}
                        </td>

                        {/* Shortfall / Suggested Reorder */}
                        <td className="py-3 px-3 text-right font-mono">
                          {isShortfall ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-300">
                                需進貨 +{shortfall.toFixed(item.unit === 'kg' ? 1 : 0)} {item.unit}
                              </span>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                預算 NT$ {Math.round(shortfall * item.costPerUnit).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                              已達定額標
                            </span>
                          )}
                        </td>

                        {/* Restock Quantities (Số lượng nhập hàng) */}
                        <td className="py-3 px-3 text-center font-mono">
                          <div className="text-xs font-semibold text-stone-200">
                            標準批次: +{item.defaultRestockAmount} {item.unit}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            累計進貨: {item.totalRestocked || 0} {item.unit} · 最近 {item.lastRestockAmount ? `+${item.lastRestockAmount}` : '無'}
                          </div>
                        </td>

                        {/* Progress Bar towards Fixed Quota */}
                        <td className="py-3 px-3 text-center">
                          <div className="w-24 mx-auto">
                            <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
                              <span>{parPercent}%</span>
                              <span>{item.currentStock > item.fixedStock ? '超額' : '配額'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#202432] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  parPercent >= 100
                                    ? 'bg-emerald-400'
                                    : parPercent >= 50
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                                }`}
                                style={{ width: `${Math.min(100, parPercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Restock Actions */}
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* 1. Quick Batch Restock */}
                          <button
                            onClick={() => handleQuickDefaultRestock(item)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#232736] hover:bg-[#2C3144] text-stone-200 rounded-lg transition-colors border border-[#323749]"
                            title={`以標準批次進貨 +${item.defaultRestockAmount} ${item.unit}`}
                          >
                            +{item.defaultRestockAmount}{item.unit}進貨
                          </button>

                          {/* 2. Restock exactly to Fixed Quota */}
                          {isShortfall && (
                            <button
                              onClick={() => handleFillToFixed(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-lg transition-colors border border-emerald-700/60"
                              title={`一鍵補足到固定基準量 (${item.fixedStock} ${item.unit})`}
                            >
                              補至固定量
                            </button>
                          )}

                          {/* 3. Custom Restock Modal */}
                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setCustomAddAmount(item.defaultRestockAmount || (item.unit === 'kg' ? 10 : 50));
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg transition-colors border border-amber-600/40"
                          >
                            自訂進貨
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Restock History Records Tab (進貨入庫流水帳) */
        <div className="bg-[#14161D] border border-[#262A37] rounded-2xl overflow-hidden shadow-sm flex-1 space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#252837]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">原物料進貨入庫歷史流水帳 (Restock Inbound Ledger)</h3>
            </div>
            <div className="text-xs text-stone-400 font-mono">
              累計入庫總值：<span className="text-emerald-400 font-bold">NT$ {totalRestockCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">入庫單號</th>
                  <th className="py-2.5 px-4 font-semibold">進貨時間</th>
                  <th className="py-2.5 px-4 font-semibold">物料品名</th>
                  <th className="py-2.5 px-4 font-semibold">類別</th>
                  <th className="py-2.5 px-4 font-semibold text-right text-emerald-400">進貨入庫數量</th>
                  <th className="py-2.5 px-4 font-semibold text-right">進貨單價</th>
                  <th className="py-2.5 px-4 font-semibold text-right">入庫總採購金額</th>
                  <th className="py-2.5 px-4 font-semibold text-center">庫存變化</th>
                  <th className="py-2.5 px-4 font-semibold text-center">經手人員</th>
                  <th className="py-2.5 px-4 font-semibold text-center">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212430]">
                {restockRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#1B1E29] transition-colors font-mono">
                    <td className="py-3 px-4 text-amber-400 font-bold">{rec.id}</td>
                    <td className="py-3 px-4 text-stone-400">{rec.timestamp}</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">{rec.itemName}</td>
                    <td className="py-3 px-4 font-sans text-stone-400">
                      <span className="px-1.5 py-0.5 rounded bg-[#232736] text-[11px]">
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      +{rec.amount} {rec.unit}
                    </td>
                    <td className="py-3 px-4 text-right text-stone-300">
                      NT$ {rec.unitCost}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      NT$ {rec.totalCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-stone-400 text-[11px]">
                      {rec.stockBefore.toFixed(rec.unit === 'kg' ? 1 : 0)} → <span className="text-emerald-300 font-bold">{rec.stockAfter.toFixed(rec.unit === 'kg' ? 1 : 0)}</span> {rec.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-stone-300 text-[11px]">
                      {rec.operator || '門市驗收'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium">
                        已驗收入庫
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Custom Restock Quantity Modal (自訂進貨數量) */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
          <form
            onSubmit={handleCustomRestockSubmit}
            className="w-full max-w-md bg-[#181A22] border border-[#2D3240] rounded-2xl p-5 sm:p-6 text-stone-100 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#262A37]">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  原物料進貨入庫 (Inbound Restock)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {restockModalItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current vs Fixed Target comparison */}
            <div className="grid grid-cols-3 gap-2 bg-[#12141A] p-3 rounded-xl border border-[#262A37] text-center">
              <div>
                <span className="text-[10px] text-stone-400 block">現有庫存</span>
                <span className="font-mono font-bold text-white text-sm">
                  {restockModalItem.currentStock} {restockModalItem.unit}
                </span>
              </div>
              <div className="border-x border-[#262A37]">
                <span className="text-[10px] text-amber-400 block">固定基準量 (Par)</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {restockModalItem.fixedStock} {restockModalItem.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">建議缺口</span>
                <span className="font-mono font-bold text-red-400 text-sm">
                  +{Math.max(0, restockModalItem.fixedStock - restockModalItem.currentStock).toFixed(1)} {restockModalItem.unit}
                </span>
              </div>
            </div>

            {/* Input: Restock Quantity */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                填寫進貨入庫數量 ({restockModalItem.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={customAddAmount}
                onChange={(e) => setCustomAddAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111319] border border-[#2D3240] rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />

              {/* Quick increment chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[
                  restockModalItem.defaultRestockAmount,
                  Math.round(Math.max(0, restockModalItem.fixedStock - restockModalItem.currentStock)),
                  (restockModalItem.unit === 'kg' ? 5 : 20),
                  (restockModalItem.unit === 'kg' ? 20 : 100),
                ]
                  .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                  .map((amt, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCustomAddAmount(amt)}
                      className="px-2.5 py-1 text-xs font-mono bg-[#1E222D] hover:bg-[#282D3C] border border-[#2D3242] rounded-lg text-amber-300 transition-colors"
                    >
                      {amt === Math.round(Math.max(0, restockModalItem.fixedStock - restockModalItem.currentStock))
                        ? `補足固定量 (${amt})`
                        : `+${amt}${restockModalItem.unit}`}
                    </button>
                  ))}
              </div>
            </div>

            {/* Operator / Staff Name */}
            <div>
              <label className="text-xs text-stone-400 block mb-1">驗收入庫人員 / 經手人</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="例：門市店長、早班吧檯組長..."
                className="w-full bg-[#111319] border border-[#2D3240] rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Forecast Calculation */}
            <div className="text-xs text-stone-400 space-y-1 bg-[#14161E] p-3 rounded-xl border border-[#262A37]">
              <div className="flex justify-between">
                <span>進貨後預計庫存：</span>
                <span className="font-mono font-bold text-emerald-400">
                  {(restockModalItem.currentStock + customAddAmount).toFixed(1)} {restockModalItem.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>本次進貨預估成本：</span>
                <span className="font-mono font-bold text-amber-400">
                  NT$ {Math.round(customAddAmount * restockModalItem.costPerUnit).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl shadow-md transition-transform active:scale-95"
              >
                確認進貨入庫
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Edit Fixed Stock (調整固定基準數量 / Số lượng cố định) */}
      {editFixedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
          <form
            onSubmit={handleSaveFixedStock}
            className="w-full max-w-sm bg-[#181A22] border border-[#2D3240] rounded-2xl p-5 sm:p-6 text-stone-100 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#262A37]">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  設定固定基準數量 (Par Level Target)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {editFixedModalItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditFixedModalItem(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              固定基準數量為門市營運標準配額（Par Level），當庫存低於此數值時，系統會自動提示缺口並計算建議進貨量。
            </p>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                新固定基準數量 ({editFixedModalItem.unit})
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={editingFixedStock}
                onChange={(e) => setEditingFixedStock(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111319] border border-[#2D3240] rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-[#12141A] p-3 rounded-xl border border-[#262A37] text-xs space-y-1 text-stone-400 font-mono">
              <div className="flex justify-between">
                <span>目前現有庫存：</span>
                <span className="text-white">{editFixedModalItem.currentStock} {editFixedModalItem.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>安全警戒低標：</span>
                <span className="text-stone-300">{editFixedModalItem.safetyStock} {editFixedModalItem.unit}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#20232E]">
                <span>調整後新缺口：</span>
                <span className="text-amber-300 font-bold">
                  {Math.max(0, editingFixedStock - editFixedModalItem.currentStock).toFixed(1)} {editFixedModalItem.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditFixedModalItem(null)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
              >
                儲存固定數量
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
