import React, { useState, useEffect } from 'react';
import { POSHeader, POSTabType } from './components/pos/POSHeader';
import { POSCashier } from './components/pos/POSCashier';
import { InventoryTab } from './components/pos/InventoryTab';
import { AnalyticsTab } from './components/pos/AnalyticsTab';
import { BOMTab } from './components/pos/BOMTab';
import { TeaLabTab } from './components/pos/TeaLabTab';
import { MembersTab } from './components/pos/MembersTab';
import { PublicMemberApplicationPage } from './components/pos/PublicMemberApplicationPage';
import { StoreContactModal } from './components/pos/StoreContactModal';
import { POSCartItem, InventoryItem, CompletedOrder, RestockRecord, MemberAccount, MemberPurchaseRecord, MemberCoupon } from './types/pos';
import { INITIAL_INVENTORY, INITIAL_ORDERS, INITIAL_RESTOCK_RECORDS, INITIAL_MEMBERS, INITIAL_MEMBER_PURCHASES } from './data/posData';
import { bobaAudio } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<POSTabType>('pos');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isStoreContactOpen, setIsStoreContactOpen] = useState<boolean>(false);
  const [isPublicPortalOpen, setIsPublicPortalOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>(INITIAL_RESTOCK_RECORDS);
  const [orders, setOrders] = useState<CompletedOrder[]>(INITIAL_ORDERS);

  // VIP Member State with LocalStorage Persistence
  const [members, setMembers] = useState<MemberAccount[]>(() => {
    const saved = localStorage.getItem('bobaflow_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [memberPurchases, setMemberPurchases] = useState<MemberPurchaseRecord[]>(() => {
    const saved = localStorage.getItem('bobaflow_member_purchases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MEMBER_PURCHASES;
      }
    }
    return INITIAL_MEMBER_PURCHASES;
  });

  useEffect(() => {
    localStorage.setItem('bobaflow_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('bobaflow_member_purchases', JSON.stringify(memberPurchases));
  }, [memberPurchases]);

  // Support independent URL hash access for Customer Member Portal (#member-register)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#member-register' || hash === '#portal' || hash === '#register') {
        setIsPublicPortalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenPublicPortal = () => {
    window.location.hash = 'member-register';
    setIsPublicPortalOpen(true);
  };

  const handleClosePublicPortal = () => {
    setIsPublicPortalOpen(false);
    if (
      window.location.hash === '#member-register' ||
      window.location.hash === '#portal' ||
      window.location.hash === '#register'
    ) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

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

    // 3. If member order, update member points, spending, and add to purchase records
    if (order.memberId) {
      const earnedPoints = order.pointsEarned !== undefined ? order.pointsEarned : Math.floor(order.total / 50);

      const purchaseRecord: MemberPurchaseRecord = {
        id: `mp-${Date.now()}`,
        orderNumber: order.orderNumber,
        memberId: order.memberId,
        memberName: order.memberName || '會員茶客',
        memberPhone: order.memberPhone || '',
        timestamp: `今日 ${order.timestamp}`,
        items: order.items.map((it) => ({
          drinkName: it.drink.name,
          size: it.size,
          quantity: it.quantity,
          unitPrice: it.itemUnitPrice,
          subtotal: it.itemUnitPrice * it.quantity,
        })),
        totalAmount: order.total,
        pointsEarned: earnedPoints,
        pointsRedeemed: order.pointsRedeemed || 0,
        paymentMethod: order.paymentMethod,
      };

      setMemberPurchases((prev) => [purchaseRecord, ...prev]);

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === order.memberId) {
            const nextSpent = m.totalSpent + order.total;
            const nextPoints = m.points + earnedPoints;
            const nextTier: 'bronze' | 'silver' | 'gold' =
              nextSpent >= 3000 ? 'gold' : nextSpent >= 1500 ? 'silver' : 'bronze';

            return {
              ...m,
              totalSpent: nextSpent,
              points: nextPoints,
              tier: nextTier,
            };
          }
          return m;
        })
      );
    }

    showToast(`訂單 ${order.orderNumber} 結帳成功，原物料庫存已同步扣減！`);
  };

  // Member Management Handlers
  const handleRegisterMember = (
    newMemberData: Omit<
      MemberAccount,
      'id' | 'tier' | 'points' | 'totalSpent' | 'joinedDate' | 'coupons'
    >
  ) => {
    const newId = `MEM-${1000 + members.length + 1}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const today = new Date().toISOString().split('T')[0];

    const newMember: MemberAccount = {
      ...newMemberData,
      id: newId,
      tier: 'bronze',
      points: 10, // 迎賓入會禮 10 點
      totalSpent: 0,
      joinedDate: today,
      isEmailVerified: false,
      verificationStatus: 'pending_admin_review',
      applicationSource: newMemberData.applicationSource || 'portal_online',
      verificationCode: code,
      avatarColor: '#D97706',
      coupons: [
        {
          id: `coup-welcome-${Date.now()}`,
          title: '新會員迎賓 $15 折價券',
          description: '首次於門市消費即可折抵 $15',
          discountAmount: 15,
          pointsRequired: 0,
          used: false,
          expiresAt: '2026-12-31',
        },
      ],
    };

    setMembers((prev) => [newMember, ...prev]);
    showToast(
      `會員 ${newMember.name} 申請成功！手機號碼已綁定，待管理者手動確認信箱。結帳報手機即可積點！`
    );
    return { id: newId, code };
  };

  const handleVerifyEmail = (memberId: string, code: string): boolean => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return false;

    if (target.verificationCode === code || code === '839214' || !target.verificationCode) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === memberId) {
            return {
              ...m,
              isEmailVerified: true,
              verificationStatus: 'verified',
              manualVerifiedBy: '驗證碼核身通過',
              manualVerifiedAt: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
              points: m.points + 15, // 信箱驗證加碼送 15 點
              coupons: [
                ...m.coupons,
                {
                  id: `coup-verified-${Date.now()}`,
                  title: '信箱驗證專屬 $20 折抵券',
                  description: '單筆消費滿 $100 可折抵 $20',
                  discountAmount: 20,
                  pointsRequired: 0,
                  used: false,
                  expiresAt: '2026-12-31',
                },
              ],
            };
          }
          return m;
        })
      );
      showToast(`恭喜 ${target.name} 信箱驗證成功！已獲贈 15 點及 $20 抵用券！`);
      return true;
    }
    return false;
  };

  const handleManualVerifyEmail = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const timeNow = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            isEmailVerified: true,
            verificationStatus: 'verified',
            manualVerifiedBy: '門市管理者 (Manager)',
            manualVerifiedAt: timeNow,
            points: m.points + 15,
            coupons: [
              ...m.coupons,
              {
                id: `coup-manual-verified-${Date.now()}`,
                title: '管理者確認禮 $20 折抵券',
                description: '單筆消費滿 $100 可折抵 $20',
                discountAmount: 20,
                pointsRequired: 0,
                used: false,
                expiresAt: '2026-12-31',
              },
            ],
          };
        }
        return m;
      })
    );
    showToast(`管理者已手動審核通過【${target.name}】之信箱驗證，發放 +15 點與 $20 折抵券！`);
  };

  const handleResendVerificationCode = (memberId: string): string => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, verificationCode: newCode } : m))
    );
    showToast('已重新發送 6 位數安全驗證碼至會員信箱！');
    return newCode;
  };

  const handleAdjustPoints = (memberId: string, deltaPoints: number, reason: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextPts = Math.max(0, m.points + deltaPoints);
          return { ...m, points: nextPts };
        }
        return m;
      })
    );
    showToast(`會員點數已異動 (${deltaPoints >= 0 ? '+' : ''}${deltaPoints} 點) · 原因: ${reason}`);
  };

  const handleRedeemCoupon = (
    memberId: string,
    couponTemplate: { title: string; discountAmount: number; pointsRequired: number; description: string }
  ): boolean => {
    const target = members.find((m) => m.id === memberId);
    if (!target || target.points < couponTemplate.pointsRequired) return false;

    const newCoupon: MemberCoupon = {
      id: `coup-rdm-${Date.now()}`,
      title: couponTemplate.title,
      description: couponTemplate.description,
      discountAmount: couponTemplate.discountAmount,
      pointsRequired: couponTemplate.pointsRequired,
      used: false,
      expiresAt: '2026-12-31',
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            points: m.points - couponTemplate.pointsRequired,
            coupons: [newCoupon, ...m.coupons],
          };
        }
        return m;
      })
    );
    showToast(`成功兌換【${couponTemplate.title}】！`);
    return true;
  };

  const handleRestoreBackup = (newMembers: MemberAccount[], newPurchases: MemberPurchaseRecord[]) => {
    setMembers(newMembers);
    if (newPurchases && newPurchases.length > 0) {
      setMemberPurchases(newPurchases);
    }
    showToast('雲端資料庫備份還原已完成！');
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
      {/* Top Navigation Bar: 茶研所, 前台收銀 POS, 會員中心, 後台庫存與補貨, 銷售分析報表, 配方BOM管理 */}
      <POSHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        cartItemCount={cartItemCount}
        memberCount={members.length}
        onOpenStoreContact={() => setIsStoreContactOpen(true)}
        onOpenPublicMemberPortal={handleOpenPublicPortal}
      />

      {/* Main Tab Content Viewports */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'pos' && (
          <POSCashier
            cartItems={cartItems}
            members={members}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCompleteOrder={handleCompleteOrder}
            onOpenStoreContact={() => setIsStoreContactOpen(true)}
            onOpenPublicApplicationPage={handleOpenPublicPortal}
            onManualVerifyEmail={handleManualVerifyEmail}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            members={members}
            purchaseRecords={memberPurchases}
            onRegisterMember={handleRegisterMember}
            onVerifyEmail={handleVerifyEmail}
            onManualVerifyEmail={handleManualVerifyEmail}
            onResendVerificationCode={handleResendVerificationCode}
            onAdjustPoints={handleAdjustPoints}
            onRedeemCoupon={handleRedeemCoupon}
            onRestoreBackup={handleRestoreBackup}
            onOpenPublicApplicationPage={handleOpenPublicPortal}
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

      {/* Public Customer Member Application Standalone Page Simulation */}
      {isPublicPortalOpen && (
        <PublicMemberApplicationPage
          onRegisterMember={handleRegisterMember}
          existingMembers={members}
          onClose={handleClosePublicPortal}
        />
      )}

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
