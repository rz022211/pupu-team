import React, { useState } from 'react';
import { POSHeader, POSTabType } from './components/pos/POSHeader';
import { POSCashier } from './components/pos/POSCashier';
import { InventoryTab } from './components/pos/InventoryTab';
import { AnalyticsTab } from './components/pos/AnalyticsTab';
import { BOMTab } from './components/pos/BOMTab';
import { TeaLabTab } from './components/pos/TeaLabTab';
import { StoreContactModal } from './components/pos/StoreContactModal';
import { POSCartItem, InventoryItem, CompletedOrder, RestockRecord } from './types/pos';
import { INITIAL_INVENTORY, INITIAL_ORDERS, INITIAL_RESTOCK_RECORDS } from './data/posData';
import { bobaAudio } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<POSTabType>('pos');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isStoreContactOpen, setIsStoreContactOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>(INITIAL_RESTOCK_RECORDS);
  const [orders, setOrders] = useState<CompletedOrder[]>(INITIAL_ORDERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    bobaAudio.setMuted(next);
  };

  // Cart Handlers
  const handleAddToCart = (item: POSCartItem) => {
    setCartItems((prev) => {
      // Check if identical item (same drink, size, ice, sweetness, toppings) already exists
      const existingIdx = prev.findIndex(
        (it) =>
          it.drink.id === item.drink.id &&
          it.size === item.size &&
          it.ice === item.ice &&
          it.sweetness === item.sweetness &&
          it.note === item.note &&
          it.toppings.length === item.toppings.length &&
          it.toppings.every((t) => item.toppings.some((ot) => ot.id === t.id))
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    showToast(`已加入點單：${item.drink.name} (${item.size}) x${item.quantity}`);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.cartItemId === cartItemId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Complete & Automatic Inventory Depletion
  const handleCompleteOrder = (order: CompletedOrder) => {
    // 1. Add order to sales analytics
    setOrders((prev) => [...prev, order]);

    // 2. Deplete inventory automatically based on drinks ordered
    setInventory((prev) => {
      const updated = prev.map((item) => ({ ...item }));

      order.items.forEach((it) => {
        const qty = it.quantity;

        // Cups
        if (it.size === 'L') {
          const cup700 = updated.find((i) => i.id === 'inv-cup-700');
          if (cup700) cup700.currentStock = Math.max(0, cup700.currentStock - qty);
        } else {
          const cup500 = updated.find((i) => i.id === 'inv-cup-500');
          if (cup500) cup500.currentStock = Math.max(0, cup500.currentStock - qty);
        }

        // Straws
        const straw = updated.find((i) => i.id === 'inv-straw-biodegradable');
        if (straw) straw.currentStock = Math.max(0, straw.currentStock - qty);

        // Milk
        if (it.drink.category === 'milk-tea') {
          const milk = updated.find((i) => i.id === 'inv-milk-jersey');
          if (milk) milk.currentStock = Math.max(0, milk.currentStock - 0.2 * qty);
        }

        // Toppings
        it.toppings.forEach((top) => {
          if (top.id.includes('boba')) {
            const boba = updated.find((i) => i.id === 'inv-topping-boba');
            if (boba) boba.currentStock = Math.max(0, boba.currentStock - 0.08 * qty);
          } else if (top.id.includes('golden')) {
            const golden = updated.find((i) => i.id === 'inv-topping-golden');
            if (golden) golden.currentStock = Math.max(0, golden.currentStock - 0.075 * qty);
          } else if (top.id.includes('lychee')) {
            const lychee = updated.find((i) => i.id === 'inv-topping-lychee');
            if (lychee) lychee.currentStock = Math.max(0, lychee.currentStock - 0.06 * qty);
          }
        });
      });

      return updated;
    });

    showToast(`訂單 ${order.orderNumber} 結帳成功，原物料庫存已同步扣減！`);
  };

  // Inventory Restock handler
  const handleRestock = (itemId: string, addAmount: number, operatorName: string = '門市人員') => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item || addAmount <= 0) return;

    const nowStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const fullDateStr = `今日 ${nowStr}`;

    const newRecord: RestockRecord = {
      id: `rst-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      amount: addAmount,
      unit: item.unit,
      unitCost: item.costPerUnit,
      totalCost: Math.round(addAmount * item.costPerUnit),
      timestamp: fullDateStr,
      stockBefore: item.currentStock,
      stockAfter: item.currentStock + addAmount,
      operator: operatorName,
    };

    setRestockRecords((prev) => [newRecord, ...prev]);

    setInventory((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            currentStock: it.currentStock + addAmount,
            totalRestocked: (it.totalRestocked || 0) + addAmount,
            lastRestockAmount: addAmount,
            lastRestocked: fullDateStr,
          };
        }
        return it;
      })
    );
    showToast(`進貨成功：${item.name} +${addAmount} ${item.unit}`);
  };

  // Update Fixed Stock (Par Level)
  const handleUpdateFixedStock = (itemId: string, newFixedStock: number) => {
    setInventory((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, fixedStock: Math.max(1, newFixedStock) };
        }
        return it;
      })
    );
    showToast('固定基準庫存數量已更新！');
  };

  // Bulk restock items to their target fixed stock
  const handleBulkRestockToFixed = (itemIds?: string[]) => {
    const targets = inventory.filter((it) => {
      const matchId = !itemIds || itemIds.includes(it.id);
      return matchId && it.currentStock < it.fixedStock;
    });

    if (targets.length === 0) {
      showToast('目前所有物料均已達固定基準數量，無須補貨！');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const fullDateStr = `今日 ${nowStr}`;

    const newRecords: RestockRecord[] = targets.map((item) => {
      const needed = Math.round((item.fixedStock - item.currentStock) * 10) / 10;
      return {
        id: `rst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        amount: needed,
        unit: item.unit,
        unitCost: item.costPerUnit,
        totalCost: Math.round(needed * item.costPerUnit),
        timestamp: fullDateStr,
        stockBefore: item.currentStock,
        stockAfter: item.fixedStock,
        operator: '一鍵配額補貨',
      };
    });

    setRestockRecords((prev) => [...newRecords, ...prev]);

    setInventory((prev) =>
      prev.map((it) => {
        const target = targets.find((t) => t.id === it.id);
        if (target) {
          const needed = Math.round((it.fixedStock - it.currentStock) * 10) / 10;
          return {
            ...it,
            currentStock: it.fixedStock,
            totalRestocked: (it.totalRestocked || 0) + needed,
            lastRestockAmount: needed,
            lastRestocked: fullDateStr,
          };
        }
        return it;
      })
    );
    showToast(`已一鍵將 ${targets.length} 項物料補滿至固定基準數量！`);
  };

  const cartItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0F1014] text-stone-100 font-sans antialiased">
      {/* Top Navigation Bar: 茶研所, 前台收銀 POS, 後台庫存與補貨, 銷售分析報表, 配方BOM管理 */}
      <POSHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        cartItemCount={cartItemCount}
        onOpenStoreContact={() => setIsStoreContactOpen(true)}
      />

      {/* Main Tab Content Viewports */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'pos' && (
          <POSCashier
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCompleteOrder={handleCompleteOrder}
            onOpenStoreContact={() => setIsStoreContactOpen(true)}
          />
        )}

        {activeTab === 'lab' && (
          <TeaLabTab
            onSendToPOSCart={(item) => {
              handleAddToCart(item);
              setActiveTab('pos');
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            restockRecords={restockRecords}
            onRestock={handleRestock}
            onUpdateFixedStock={handleUpdateFixedStock}
            onBulkRestockToFixed={handleBulkRestockToFixed}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab orders={orders} />}

        {activeTab === 'bom' && <BOMTab />}
      </main>

      {/* Store QR Code & Official Contact Modal */}
      <StoreContactModal
        isOpen={isStoreContactOpen}
        onClose={() => setIsStoreContactOpen(false)}
      />

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#1C1F2B] border border-amber-500/60 text-amber-200 px-4 py-2 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 animate-fade-in pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
