import React, { useState } from 'react';
import { POSHeader, POSTabType } from './components/pos/POSHeader';
import { POSCashier } from './components/pos/POSCashier';
import { InventoryTab } from './components/pos/InventoryTab';
import { AnalyticsTab } from './components/pos/AnalyticsTab';
import { BOMTab } from './components/pos/BOMTab';
import { TeaLabTab } from './components/pos/TeaLabTab';
import { POSCartItem, InventoryItem, CompletedOrder } from './types/pos';
import { INITIAL_INVENTORY, INITIAL_ORDERS } from './data/posData';
import { bobaAudio } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<POSTabType>('pos');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
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
  const handleRestock = (itemId: string, addAmount: number) => {
    setInventory((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const nowStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
          return {
            ...it,
            currentStock: it.currentStock + addAmount,
            lastRestocked: `今日 ${nowStr}`,
          };
        }
        return it;
      })
    );
    showToast('原物料進貨入庫已完成！');
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
          <InventoryTab inventory={inventory} onRestock={handleRestock} />
        )}

        {activeTab === 'analytics' && <AnalyticsTab orders={orders} />}

        {activeTab === 'bom' && <BOMTab />}
      </main>

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
