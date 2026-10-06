import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Store, Clock, QrCode, Phone, Smartphone } from 'lucide-react';

export type POSTabType = 'lab' | 'pos' | 'inventory' | 'analytics' | 'bom' | 'members';

interface POSHeaderProps {
  activeTab: POSTabType;
  onTabChange: (tab: POSTabType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  cartItemCount: number;
  memberCount?: number;
  onOpenStoreContact?: () => void;
  onOpenPublicMemberPortal?: () => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  cartItemCount,
  memberCount,
  onOpenStoreContact,
  onOpenPublicMemberPortal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: POSTabType; label: string; badge?: number }[] = [
    { id: 'lab', label: '茶研所' },
    { id: 'pos', label: '前台收銀 POS', badge: cartItemCount > 0 ? cartItemCount : undefined },
    { id: 'members', label: '會員中心', badge: memberCount },
    { id: 'inventory', label: '後台庫存與補貨' },
    { id: 'analytics', label: '銷售分析報表' },
    { id: 'bom', label: '配方BOM管理' },
  ];

  return (
    <header className="bg-[#121316] border-b border-[#2A2E39] text-[#F3F4F6] px-4 py-2.5 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Store Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              BobaFlow <span className="text-xs text-amber-400 font-normal">職人茶研</span>
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#262A35] text-[11px] text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>信義旗艦門市</span>
          <span>·</span>
          <span>機號 #01</span>
        </div>
      </div>

      {/* Main 5 Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#1A1C23] p-1 rounded-xl border border-[#272B36]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#252934]'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-tight ${
                    isActive ? 'bg-white text-amber-900 font-bold' : 'bg-amber-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right System Info: Public Portal, Store QR & Contact, Clock & Sound */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {onOpenPublicMemberPortal && (
          <button
            onClick={onOpenPublicMemberPortal}
            className="flex items-center gap-1.5 text-xs text-amber-200 font-semibold bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border border-amber-500/50 hover:border-amber-400 px-2.5 py-1.5 rounded-xl transition-all shadow-xs"
            title="開啟顧客個人會員線上申請獨立網頁 (獨立網真)"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">個人會員申請網真 ↗</span>
            <span className="xl:hidden">會員申請 ↗</span>
          </button>
        )}

        {onOpenStoreContact && (
          <button
            onClick={onOpenStoreContact}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white font-medium bg-[#1F222D] hover:bg-[#282D3C] border border-[#2D3242] hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-all shadow-xs"
            title="查看門市官方 QR Code 與聯絡方式"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">門市 QR</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-mono tabular-nums bg-[#1A1C23] px-2.5 py-1.5 rounded-xl border border-[#272B36]">
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          <span>{timeStr || '12:00:00'}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-1.5 text-stone-400 hover:text-white hover:bg-[#252934] rounded-xl transition-colors"
          title={isMuted ? '取消靜音' : '開啟音效'}
          aria-label="Sound toggle"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
