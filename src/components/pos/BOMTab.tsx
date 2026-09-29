import React, { useState } from 'react';
import { BOMRecipe } from '../../types/pos';
import { INITIAL_BOM_RECIPES, POS_DRINKS } from '../../data/posData';
import { Layers, DollarSign, Percent, Plus, Edit2, Check } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

export const BOMTab: React.FC = () => {
  const [recipes, setRecipes] = useState<BOMRecipe[]>(INITIAL_BOM_RECIPES);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0].drinkId);
  const [editingIngredientIdx, setEditingIngredientIdx] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const activeRecipe = recipes.find((r) => r.drinkId === selectedRecipeId) || recipes[0];
  const activeDrinkMeta = POS_DRINKS.find((d) => d.id === activeRecipe.drinkId);

  const handleStartEdit = (idx: number, currentAmount: number) => {
    setEditingIngredientIdx(idx);
    setEditAmount(currentAmount);
  };

  const handleSaveEdit = (idx: number) => {
    bobaAudio.playSeal();
    setRecipes((prev) =>
      prev.map((rec) => {
        if (rec.drinkId !== activeRecipe.drinkId) return rec;

        const updatedIngs = [...rec.ingredients];
        const oldIng = updatedIngs[idx];
        const costRatio = editAmount / oldIng.amount;
        const newUnitCost = Math.round(oldIng.unitCost * costRatio * 10) / 10;

        updatedIngs[idx] = {
          ...oldIng,
          amount: editAmount,
          unitCost: newUnitCost,
        };

        const newTotalCost =
          Math.round(updatedIngs.reduce((sum, ing) => sum + ing.unitCost, 0) * 10) / 10;
        const newMargin =
          Math.round(((rec.basePrice - newTotalCost) / rec.basePrice) * 1000) / 10;

        return {
          ...rec,
          ingredients: updatedIngs,
          totalCost: newTotalCost,
          marginPercent: newMargin,
        };
      })
    );
    setEditingIngredientIdx(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden select-none bg-[#0F1014] text-stone-100">
      {/* Left List of Drink Recipes */}
      <div className="w-full lg:w-72 xl:w-80 bg-[#14161D] border-r border-[#22252F] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#22252F]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">標準飲品配方庫 (BOM)</h3>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">精算茶湯、乳源與杯材成本</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {recipes.map((rec) => {
            const isSelected = rec.drinkId === selectedRecipeId;
            const drinkImg = POS_DRINKS.find((d) => d.id === rec.drinkId)?.image;
            return (
              <div
                key={rec.drinkId}
                onClick={() => setSelectedRecipeId(rec.drinkId)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1F222D] border-amber-500/80 shadow-xs'
                    : 'bg-[#171922] border-[#242836] hover:bg-[#1C1F2B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {drinkImg && (
                    <img
                      src={drinkImg}
                      alt={rec.drinkName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-[#2B2F3D] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate">{rec.drinkName}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#252938] text-amber-300 shrink-0">
                        {rec.category}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">NT$ {rec.basePrice}</span>
                      <span className="text-emerald-400 font-bold">毛利 {rec.marginPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Recipe Ingredients Breakdown Table & Financial Health */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* Active Recipe Header & Economics Cards */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22252F]">
          <div className="flex items-center gap-3.5">
            {activeDrinkMeta?.image && (
              <img
                src={activeDrinkMeta.image}
                alt={activeRecipe.drinkName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 shadow-sm shrink-0"
              />
            )}
            <div>
              <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                {activeRecipe.category} · 標準配方表
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {activeRecipe.drinkName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#171922] border border-[#262A37] px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-stone-400 block">門市建議售價</span>
              <span className="text-base font-mono font-bold text-white">
                NT$ {activeRecipe.basePrice}
              </span>
            </div>
            <div className="bg-[#171922] border border-[#262A37] px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-stone-400 block">單杯總物料成本</span>
              <span className="text-base font-mono font-bold text-red-400">
                NT$ {activeRecipe.totalCost}
              </span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-emerald-400 block">毛利率 (Margin)</span>
              <span className="text-base font-mono font-bold text-emerald-300">
                {activeRecipe.marginPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed BOM Ingredients Table */}
        <div className="bg-[#14161D] border border-[#262A37] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#262A37] flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              原物料耗用細項明細表 (Bill of Materials)
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              共 {activeRecipe.ingredients.length} 項物料
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
                <tr>
                  <th className="py-3 px-4 font-semibold">物料與包材品名</th>
                  <th className="py-3 px-4 font-semibold text-right">標準配方劑量</th>
                  <th className="py-3 px-4 font-semibold text-right">單項成本 (TWD)</th>
                  <th className="py-3 px-4 font-semibold text-right">成本佔比</th>
                  <th className="py-3 px-4 font-semibold text-right">劑量調整操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212430]">
                {activeRecipe.ingredients.map((ing, idx) => {
                  const percentOfCost =
                    activeRecipe.totalCost > 0
                      ? Math.round((ing.unitCost / activeRecipe.totalCost) * 100)
                      : 0;
                  const isEditing = editingIngredientIdx === idx;

                  return (
                    <tr key={idx} className="hover:bg-[#1B1E29] transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{ing.ingredientName}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                              className="w-16 bg-[#111319] border border-amber-500 rounded px-1.5 py-0.5 text-right font-mono text-white text-xs"
                            />
                            <span className="text-stone-400">{ing.unit}</span>
                          </div>
                        ) : (
                          <span className="text-stone-200">
                            {ing.amount} <span className="text-stone-500">{ing.unit}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400 font-semibold">
                        NT$ {ing.unitCost}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-400">
                        {percentOfCost}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(idx)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3 h-3" /> 儲存
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(idx, ing.amount)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#232736] hover:bg-[#2B3042] text-stone-300 rounded-lg border border-[#303548] inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> 調整劑量
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Optimization Advice Box */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">BOM 毛利分析建議</h4>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              當前 {activeRecipe.drinkName} 毛利率為{' '}
              <span className="text-emerald-400 font-semibold">{activeRecipe.marginPercent}%</span>
              ，符合茶飲店 60%–70% 健全標準。鮮乳與抹茶為主要成本權重，若乳源進價波動，可透過適度調整中杯/大杯配比或推廣原葉純茶系列提升門市整體利潤。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
