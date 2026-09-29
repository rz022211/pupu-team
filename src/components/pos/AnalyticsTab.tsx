import React from 'react';
import { CompletedOrder } from '../../types/pos';
import { POS_DRINKS } from '../../data/posData';
import { TrendingUp, DollarSign, CupSoda, CreditCard, Award, BarChart3 } from 'lucide-react';

interface AnalyticsTabProps {
  orders: CompletedOrder[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ orders }) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCups = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Best seller drinks calculation
  const drinkSalesMap: { [name: string]: { cups: number; revenue: number } } = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const name = it.drink.name;
      if (!drinkSalesMap[name]) {
        drinkSalesMap[name] = { cups: 0, revenue: 0 };
      }
      drinkSalesMap[name].cups += it.quantity;
      drinkSalesMap[name].revenue += it.itemUnitPrice * it.quantity;
    });
  });

  const bestSellers = Object.entries(drinkSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.cups - a.cups)
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#0F1014] text-stone-100 overflow-y-auto select-none space-y-6">
      {/* 4 Stat Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">今日累計營收 (Revenue)</span>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
              NT$ {totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">達標率 118%</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">今日總出杯量 (Total Cups)</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {totalCups} <span className="text-xs font-normal text-stone-400">杯</span>
            </div>
            <span className="text-[11px] text-stone-400">外帶 68% · 內用 32%</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CupSoda className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">平均單筆客單價 (AOV)</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              NT$ {avgOrderValue}
            </div>
            <span className="text-[11px] text-stone-400">共 {orders.length} 筆點單</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">電子支付佔比</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              74.5%
            </div>
            <span className="text-[11px] text-stone-400">LINE Pay / 街口 / 信用卡</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Best Sellers & Flavor Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="lg:col-span-7 bg-[#14161D] border border-[#262A37] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">熱門熱銷飲品排行榜 (Top Sellers)</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">今日數據即時更新</span>
          </div>

          <div className="space-y-3">
            {bestSellers.map((item, idx) => {
              const drinkImg = POS_DRINKS.find((d) => d.name === item.name)?.image;
              return (
                <div
                  key={item.name}
                  className="bg-[#1A1D27] border border-[#242835] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-600 text-white'
                          : idx === 1
                          ? 'bg-stone-600 text-white'
                          : idx === 2
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-[#252836] text-stone-400'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    {drinkImg && (
                      <img
                        src={drinkImg}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-[#2B2F3D] shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      <span className="text-[11px] text-stone-400">出杯量：{item.cups} 杯</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-amber-400">
                      NT$ {item.revenue.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-500">貢獻營業額</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Preference Distributions */}
        <div className="lg:col-span-5 bg-[#14161D] border border-[#262A37] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">客製偏好分佈 (Preferences)</h3>
            </div>
          </div>

          {/* Ice preference */}
          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5">
              <span>冰量偏好度</span>
              <span className="font-semibold text-amber-300">微冰 (45%) 居首</span>
            </div>
            <div className="h-3 w-full bg-[#1F222D] rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: '45%' }} title="微冰 45%" />
              <div className="bg-amber-600 h-full" style={{ width: '28%' }} title="少冰 28%" />
              <div className="bg-amber-700 h-full" style={{ width: '15%' }} title="去冰 15%" />
              <div className="bg-amber-800 h-full" style={{ width: '8%' }} title="正常冰 8%" />
              <div className="bg-stone-600 h-full" style={{ width: '4%' }} title="溫熱 4%" />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>微冰 45%</span>
              <span>少冰 28%</span>
              <span>去冰 15%</span>
              <span>正常 8%</span>
              <span>溫熱 4%</span>
            </div>
          </div>

          {/* Sweetness preference */}
          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5">
              <span>甜度偏好度</span>
              <span className="font-semibold text-amber-300">微糖 30% (52%) 佔多數</span>
            </div>
            <div className="h-3 w-full bg-[#1F222D] rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '52%' }} title="微糖 52%" />
              <div className="bg-emerald-600 h-full" style={{ width: '26%' }} title="半糖 26%" />
              <div className="bg-emerald-700 h-full" style={{ width: '14%' }} title="無糖 14%" />
              <div className="bg-stone-600 h-full" style={{ width: '8%' }} title="正常 8%" />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>微糖(30%) 52%</span>
              <span>半糖(50%) 26%</span>
              <span>無糖(0%) 14%</span>
              <span>全糖 8%</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="pt-2 border-t border-[#232734]">
            <span className="text-xs text-stone-400 block mb-2">支付金流管道細分</span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#1A1D27] p-2 rounded-lg border border-[#242835]">
                <div className="text-[10px] text-stone-400">LINE Pay</div>
                <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">42%</div>
              </div>
              <div className="bg-[#1A1D27] p-2 rounded-lg border border-[#242835]">
                <div className="text-[10px] text-stone-400">現金</div>
                <div className="font-mono text-xs font-bold text-stone-300 mt-0.5">25.5%</div>
              </div>
              <div className="bg-[#1A1D27] p-2 rounded-lg border border-[#242835]">
                <div className="text-[10px] text-stone-400">街口支付</div>
                <div className="font-mono text-xs font-bold text-red-400 mt-0.5">18%</div>
              </div>
              <div className="bg-[#1A1D27] p-2 rounded-lg border border-[#242835]">
                <div className="text-[10px] text-stone-400">信用卡</div>
                <div className="font-mono text-xs font-bold text-blue-400 mt-0.5">14.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger Table */}
      <div className="bg-[#14161D] border border-[#262A37] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-white mb-3">今日點單即時流水帳 (Live Order Transactions)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">單號</th>
                <th className="py-2.5 px-4 font-semibold">時間</th>
                <th className="py-2.5 px-4 font-semibold">類型</th>
                <th className="py-2.5 px-4 font-semibold">點單內容</th>
                <th className="py-2.5 px-4 font-semibold">支付方式</th>
                <th className="py-2.5 px-4 font-semibold text-right">結帳總額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212430]">
              {orders.slice().reverse().map((o) => (
                <tr key={o.orderNumber} className="hover:bg-[#1B1E29] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{o.orderNumber}</td>
                  <td className="py-3 px-4 font-mono text-stone-400">{o.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#232736] text-stone-300">
                      {o.orderType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-300 max-w-xs truncate">
                    {o.items.map((it) => `${it.drink.name} x${it.quantity}`).join('、')}
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-400">{o.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    NT$ {o.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
