import React, { useState } from 'react';
import {
  X,
  QrCode,
  Phone,
  MapPin,
  Clock,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Sparkles,
  MessageCircle,
  Instagram,
  Printer,
  Share2,
} from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface StoreContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type QRType = 'line' | 'instagram' | 'wifi' | 'menu';

export const StoreContactModal: React.FC<StoreContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeQR, setActiveQR] = useState<QRType>('line');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    bobaAudio.playSeal();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrintQR = () => {
    bobaAudio.playIceClink();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#161820] border border-[#2B2F3E] rounded-3xl shadow-2xl text-stone-100 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#262A37] bg-[#121319] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  BobaFlow 門市官方 QR Code 與聯絡資訊
                </h3>
                <span className="text-[10px] font-mono bg-amber-600/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  旗艦店專用
                </span>
              </div>
              <p className="text-xs text-stone-400">
                提供顧客掃碼加入官方社群、快速外帶點單、顧客客服及 Wi-Fi 連線
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-[#252A36] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Section: Interactive QR Code Card */}
          <div className="bg-[#1C1F2B] border border-[#2B3042] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            {/* Left: Authentic Vector QR Code Frame */}
            <div className="flex flex-col items-center shrink-0">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-500/40 relative group">
                {/* Vector QR Code SVG */}
                <svg
                  viewBox="0 0 160 160"
                  className="w-44 h-44 sm:w-48 sm:h-48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background */}
                  <rect width="160" height="160" fill="white" rx="4" />

                  {/* Top-Left Finder Pattern */}
                  <rect x="12" y="12" width="40" height="40" fill="#1C1F2A" rx="4" />
                  <rect x="18" y="18" width="28" height="28" fill="white" rx="2" />
                  <rect x="24" y="24" width="16" height="16" fill="#D97706" rx="2" />

                  {/* Top-Right Finder Pattern */}
                  <rect x="108" y="12" width="40" height="40" fill="#1C1F2A" rx="4" />
                  <rect x="114" y="18" width="28" height="28" fill="white" rx="2" />
                  <rect x="120" y="24" width="16" height="16" fill="#D97706" rx="2" />

                  {/* Bottom-Left Finder Pattern */}
                  <rect x="12" y="108" width="40" height="40" fill="#1C1F2A" rx="4" />
                  <rect x="18" y="114" width="28" height="28" fill="white" rx="2" />
                  <rect x="24" y="120" width="16" height="16" fill="#D97706" rx="2" />

                  {/* Timing Patterns */}
                  <rect x="58" y="20" width="6" height="6" fill="#1C1F2A" />
                  <rect x="70" y="20" width="6" height="6" fill="#1C1F2A" />
                  <rect x="82" y="20" width="6" height="6" fill="#1C1F2A" />
                  <rect x="94" y="20" width="6" height="6" fill="#1C1F2A" />

                  <rect x="20" y="58" width="6" height="6" fill="#1C1F2A" />
                  <rect x="20" y="70" width="6" height="6" fill="#1C1F2A" />
                  <rect x="20" y="82" width="6" height="6" fill="#1C1F2A" />
                  <rect x="20" y="94" width="6" height="6" fill="#1C1F2A" />

                  {/* Alignment pattern */}
                  <rect x="114" y="114" width="24" height="24" fill="#1C1F2A" rx="2" />
                  <rect x="120" y="120" width="12" height="12" fill="white" rx="1" />
                  <rect x="124" y="124" width="4" height="4" fill="#1C1F2A" />

                  {/* Data Modules (Boba Dot Grid) */}
                  <rect x="12" y="58" width="6" height="12" fill="#1C1F2A" />
                  <rect x="34" y="64" width="12" height="6" fill="#1C1F2A" />
                  <rect x="40" y="82" width="6" height="12" fill="#1C1F2A" />
                  <rect x="58" y="34" width="12" height="6" fill="#1C1F2A" />
                  <rect x="58" y="46" width="6" height="6" fill="#1C1F2A" />
                  <rect x="70" y="46" width="12" height="6" fill="#1C1F2A" />
                  <rect x="88" y="46" width="6" height="18" fill="#1C1F2A" />
                  <rect x="58" y="58" width="18" height="6" fill="#1C1F2A" />
                  <rect x="82" y="58" width="12" height="12" fill="#1C1F2A" />
                  <rect x="64" y="70" width="6" height="18" fill="#1C1F2A" />
                  <rect x="76" y="82" width="12" height="6" fill="#1C1F2A" />
                  <rect x="58" y="94" width="18" height="6" fill="#1C1F2A" />
                  <rect x="70" y="106" width="6" height="12" fill="#1C1F2A" />
                  <rect x="82" y="100" width="12" height="6" fill="#1C1F2A" />
                  <rect x="58" y="124" width="18" height="6" fill="#1C1F2A" />
                  <rect x="64" y="136" width="6" height="12" fill="#1C1F2A" />
                  <rect x="82" y="130" width="12" height="6" fill="#1C1F2A" />
                  <rect x="88" y="142" width="6" height="6" fill="#1C1F2A" />

                  <rect x="100" y="58" width="6" height="12" fill="#1C1F2A" />
                  <rect x="112" y="64" width="12" height="6" fill="#1C1F2A" />
                  <rect x="130" y="58" width="6" height="18" fill="#1C1F2A" />
                  <rect x="142" y="70" width="6" height="12" fill="#1C1F2A" />
                  <rect x="100" y="82" width="18" height="6" fill="#1C1F2A" />
                  <rect x="124" y="82" width="12" height="6" fill="#1C1F2A" />
                  <rect x="142" y="88" width="6" height="18" fill="#1C1F2A" />
                  <rect x="100" y="100" width="6" height="12" fill="#1C1F2A" />
                  <rect x="100" y="118" width="6" height="18" fill="#1C1F2A" />
                  <rect x="100" y="142" width="12" height="6" fill="#1C1F2A" />

                  {/* Center Badge: BobaFlow Bubble Emblem */}
                  <rect x="68" y="68" width="24" height="24" fill="#D97706" rx="6" />
                  <circle cx="80" cy="80" r="7" fill="white" />
                  <circle cx="80" cy="80" r="3.5" fill="#78350F" />
                </svg>
              </div>

              <span className="text-[11px] text-stone-400 mt-2 font-mono">
                手機相機直接掃描即可自動跳轉
              </span>
            </div>

            {/* Right: QR Code Switcher & Details */}
            <div className="flex-1 space-y-3.5 w-full">
              {/* QR Channel Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#14161F] p-1 rounded-xl border border-[#252837]">
                {[
                  { id: 'line' as QRType, label: 'LINE 官方', icon: MessageCircle },
                  { id: 'menu' as QRType, label: '線上點單', icon: QrCode },
                  { id: 'instagram' as QRType, label: 'Instagram', icon: Instagram },
                  { id: 'wifi' as QRType, label: '門市 Wi-Fi', icon: Wifi },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeQR === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        bobaAudio.playIceClink();
                        setActiveQR(tab.id);
                      }}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-400 hover:text-white hover:bg-[#1E212E]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic QR Information */}
              <div className="bg-[#14161E] border border-[#272B3A] rounded-xl p-3.5 space-y-2">
                {activeQR === 'line' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" /> BobaFlow 官方 LINE 帳號
                      </span>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        好友數 12,480+
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      掃描加入好友即贈 <strong className="text-amber-400">NT$ 50 職人迎賓抵用券</strong>。享有外帶預約免排隊、專屬會員集點與每週單品茶豆兌換。
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">LINE ID: @bobaflow_tw</span>
                      <button
                        onClick={() => handleCopy('@bobaflow_tw', 'lineId')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'lineId' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'lineId' ? '已複製' : '複製ID'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeQR === 'menu' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4" /> 門市零接觸線上快速點單
                      </span>
                      <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full">
                        即點即做
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      顧客於座位區或門市外掃描此碼，即可瀏覽完整單品茶、手炒黑糖鮮奶菜單，客製甜度冰塊並以行動支付直接下單。
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">點單網址: order.bobaflow.tw</span>
                      <button
                        onClick={() => handleCopy('https://order.bobaflow.tw', 'orderUrl')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'orderUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'orderUrl' ? '已複製' : '複製網址'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeQR === 'instagram' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                        <Instagram className="w-4 h-4" /> 官方 Instagram 職人手作
                      </span>
                      <span className="text-[10px] bg-pink-950/60 text-pink-300 border border-pink-800/60 px-2 py-0.5 rounded-full">
                        @bobaflow.artisanal
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      探索每日手炒沖繩黑糖波霸熬煮慢鏡頭、台灣阿里山高山茶園採收紀實與季節限量新品發布。
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-400">粉絲數: 38.6K Followers</span>
                      <button
                        onClick={() => handleCopy('https://instagram.com/bobaflow.artisanal', 'igUrl')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'igUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'igUrl' ? '已複製' : '複製連結'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeQR === 'wifi' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <Wifi className="w-4 h-4" /> 內用客用極速 Wi-Fi (5GHz)
                      </span>
                      <span className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
                        高速光纖
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      掃碼一鍵連線門市高速無線網路，免手動輸入密碼，提供內用顧客最佳工作與品飲體驗。
                    </p>
                    <div className="pt-1 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-stone-400">SSID: BobaFlow-Guest-5G</span>
                        <button
                          onClick={() => handleCopy('BobaFlow-Guest-5G', 'wifiSsid')}
                          className="text-amber-400 hover:text-amber-300 text-[11px]"
                        >
                          {copiedField === 'wifiSsid' ? '已複製' : '複製SSID'}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">密碼: artisanal-tea-2026</span>
                        <button
                          onClick={() => handleCopy('artisanal-tea-2026', 'wifiPass')}
                          className="text-amber-400 hover:text-amber-300 text-[11px]"
                        >
                          {copiedField === 'wifiPass' ? '已複製' : '複製密碼'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrintQR}
                  className="flex-1 py-2 px-3 bg-[#1C1F2B] hover:bg-[#252A3A] border border-[#2D3245] text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-400" />
                  <span>列印門市桌牌 / 出單</span>
                </button>

                <button
                  onClick={() => handleCopy('https://order.bobaflow.tw', 'shareAll')}
                  className="flex-1 py-2 px-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedField === 'shareAll' ? '已複製點單連結' : '分享點單連結'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Comprehensive Contact Information Cards (Phương thức liên lạc) */}
          <div>
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              門市官方聯絡方式與服務管道 (Contact Channels)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Phone Hotline */}
              <div className="bg-[#14161E] border border-[#262A37] rounded-xl p-3.5 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">門市客服與外送專線</div>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                      02-2723-8899
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      大單外送 / 企業團購 / 異業合作請按 102
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy('02-2723-8899', 'phone')}
                  className="p-1.5 hover:bg-[#202433] rounded-lg text-stone-400 hover:text-amber-300 transition-colors"
                  title="複製電話"
                >
                  {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* 2. Store Physical Address */}
              <div className="bg-[#14161E] border border-[#262A37] rounded-xl p-3.5 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">門市地址與位置</div>
                    <div className="text-xs text-stone-300 mt-0.5 leading-relaxed font-medium">
                      台北市信義區松智路 17 號 1 樓
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      微風南山正對面 · 捷運台北101站 4號出口
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy('台北市信義區松智路17號1樓', 'address')}
                  className="p-1.5 hover:bg-[#202433] rounded-lg text-stone-400 hover:text-amber-300 transition-colors"
                  title="複製地址"
                >
                  {copiedField === 'address' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* 3. Opening Hours */}
              <div className="bg-[#14161E] border border-[#262A37] rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">營業時間 (Hours)</div>
                  <div className="text-xs font-mono text-stone-200 mt-0.5">
                    週一至週日 10:30 - 21:30
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    每日波霸現煮出爐：11:00 / 15:00 / 18:00
                  </div>
                </div>
              </div>

              {/* 4. Support Email */}
              <div className="bg-[#14161E] border border-[#262A37] rounded-xl p-3.5 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">官方電子信箱</div>
                    <div className="text-xs font-mono text-amber-300 mt-0.5">
                      service@bobaflow.tw
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      一般諮詢、加盟洽談與發票統編異動
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy('service@bobaflow.tw', 'email')}
                  className="p-1.5 hover:bg-[#202433] rounded-lg text-stone-400 hover:text-amber-300 transition-colors"
                  title="複製信箱"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#262A37] bg-[#121319] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>信義旗艦店 · 營業中 (歡迎直接來電或線上預訂)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
