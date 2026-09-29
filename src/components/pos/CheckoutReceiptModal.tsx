import React, { useState } from 'react';
import { POSCartItem, CompletedOrder } from '../../types/pos';
import { X, CheckCircle2, Printer, CreditCard, Banknote, Smartphone, QrCode } from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface CheckoutReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: POSCartItem[];
  orderType: '外帶' | '內用' | '外送';
  orderNote: string;
  subtotal: number;
  discount: number;
  total: number;
  onOrderComplete: (order: CompletedOrder) => void;
}

export const CheckoutReceiptModal: React.FC<CheckoutReceiptModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  orderType,
  orderNote,
  subtotal,
  discount,
  total,
  onOrderComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'現金' | 'LINE Pay' | '街口支付' | '信用卡'>('現金');
  const [cashTendered, setCashTendered] = useState<number>(total);
  const [carrierCode, setCarrierCode] = useState<string>('');
  const [isReceiptPrinting, setIsReceiptPrinting] = useState<boolean>(false);
  const [printedOrder, setPrintedOrder] = useState<CompletedOrder | null>(null);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - total);

  const handleConfirmPay = () => {
    bobaAudio.playSeal();
    setIsReceiptPrinting(true);

    const newOrder: CompletedOrder = {
      orderNumber: `#01${Math.floor(41 + Math.random() * 50)}`,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      items: [...cartItems],
      subtotal,
      discount,
      total,
      paymentMethod,
      amountReceived: paymentMethod === '現金' ? cashTendered : total,
      change: paymentMethod === '現金' ? changeDue : 0,
      orderType,
      carrierNumber: carrierCode.trim() || undefined,
    };

    setPrintedOrder(newOrder);

    // Play print sound after brief delay
    setTimeout(() => {
      bobaAudio.playIceClink();
    }, 400);
  };

  const handleFinish = () => {
    if (printedOrder) {
      onOrderComplete(printedOrder);
    }
    setIsReceiptPrinting(false);
    setPrintedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-[#181A20] border border-[#2D323E] rounded-2xl shadow-2xl text-stone-100 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2F3B] bg-[#14161C] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {printedOrder ? '結帳完成 · 電子發票與出單' : '前台結帳收款 (Checkout)'}
            </h3>
            <p className="text-xs text-stone-400">
              {orderType} · 共 {cartItems.reduce((acc, it) => acc + it.quantity, 0)} 杯飲品
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-[#252A36] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!printedOrder ? (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Amount Summary Banner */}
            <div className="p-4 bg-[#1F222B] border border-[#2D3240] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">應收總額 (Total Due)</span>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  NT$ {total}
                </span>
              </div>
              <div className="text-right text-xs text-stone-400 space-y-0.5">
                <div>小計 NT$ {subtotal}</div>
                {discount > 0 && <div className="text-emerald-400">促銷折抵 -NT$ {discount}</div>}
              </div>
            </div>

            {/* Quick Ordered Drinks Preview with Thumbnails */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                結帳明細確認 ({cartItems.length} 項飲品)
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {cartItems.map((it) => (
                  <div
                    key={it.cartItemId}
                    className="flex items-center gap-2 bg-[#14161C] border border-[#262A37] rounded-xl p-2 shrink-0"
                  >
                    {it.drink.image && (
                      <img
                        src={it.drink.image}
                        alt={it.drink.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#2B2F3D]"
                      />
                    )}
                    <div className="text-left pr-1">
                      <div className="text-xs font-semibold text-white max-w-[130px] truncate">
                        {it.drink.name}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {it.size} · {it.ice} · x{it.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                支付方式 (Payment Method)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: '現金', icon: Banknote },
                  { id: 'LINE Pay', icon: Smartphone },
                  { id: '街口支付', icon: QrCode },
                  { id: '信用卡', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-[#1F222B] border-[#2D3240] text-stone-300 hover:bg-[#262A35]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{m.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender & Change Calculator (if Cash) */}
            {paymentMethod === '現金' && (
              <div className="p-4 bg-[#14161C] border border-[#2D3240] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">實收現金額度 (Tendered)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">NT$</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(parseInt(e.target.value) || 0)}
                      className="w-24 bg-[#1F222B] border border-[#2D3240] rounded-lg px-2.5 py-1 text-right font-mono font-bold text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Quick denomination buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[total, 100, 500, 1000].map((amt, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCashTendered(amt)}
                      className="py-1.5 text-xs font-mono font-medium bg-[#1F222B] hover:bg-[#262A35] border border-[#2D3240] rounded-lg text-stone-300 transition-colors"
                    >
                      {idx === 0 ? '剛好' : `$${amt}`}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                <div className="pt-2 border-t border-[#262A35] flex items-center justify-between">
                  <span className="text-xs text-stone-400">找零金額 (Change Due)</span>
                  <span
                    className={`font-mono text-base font-bold ${
                      cashTendered >= total ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {cashTendered >= total ? `NT$ ${changeDue}` : '實收金額不足'}
                  </span>
                </div>
              </div>
            )}

            {/* Invoice Carrier Input */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
                手機條碼載具 / 統一編號 (可選)
              </label>
              <input
                type="text"
                placeholder="例：/AB12345 或 8位統一編號"
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="w-full bg-[#14161C] border border-[#2D3240] rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        ) : (
          /* Thermal Receipt Printer Simulation View */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>交易成功 · 熱感應出單機出紙完成</span>
            </div>

            {/* Thermal Receipt Paper Card */}
            <div className="max-w-sm mx-auto bg-stone-50 text-stone-900 rounded-lg p-5 shadow-2xl font-mono text-xs border border-stone-200 relative overflow-hidden animate-slide-down">
              {/* Receipt Top Zigzag effect */}
              <div className="text-center pb-3 border-b border-dashed border-stone-400 space-y-1">
                <div className="font-bold text-sm tracking-widest uppercase">BobaFlow 茶研所</div>
                <div className="text-[11px] text-stone-600">台北信義旗艦直營門市</div>
                <div className="text-[10px] text-stone-500">TEL: 02-2720-8888 · 機號: 01</div>
                <div className="text-xs font-bold pt-1">
                  電子發票證明聯：TW-{Math.floor(10000000 + Math.random() * 90000000)}
                </div>
                <div className="text-[11px] text-stone-600">
                  {new Date().toLocaleDateString('zh-TW')} {printedOrder.timestamp} · 隨機碼 9821
                </div>
              </div>

              {/* Order Number & Type */}
              <div className="py-2.5 border-b border-dashed border-stone-400 flex items-center justify-between font-bold">
                <span className="text-base text-stone-950">單號 {printedOrder.orderNumber}</span>
                <span className="bg-stone-900 text-stone-50 px-2 py-0.5 rounded text-xs">
                  {printedOrder.orderType}
                </span>
              </div>

              {/* Itemized list */}
              <div className="py-3 border-b border-dashed border-stone-400 space-y-2">
                {printedOrder.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span>
                        {it.drink.name} ({it.size}) x{it.quantity}
                      </span>
                      <span>NT$ {it.itemUnitPrice * it.quantity}</span>
                    </div>
                    <div className="text-[10px] text-stone-600 pl-2">
                      {it.ice} · {it.sweetness.split('(')[0]}
                      {it.toppings.length > 0 && ` · 加料: ${it.toppings.map((t) => t.name).join('+')}`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1">
                <div className="flex justify-between">
                  <span>小計 (Subtotal)</span>
                  <span>NT$ {printedOrder.subtotal}</span>
                </div>
                {printedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>優惠折抵 (Discount)</span>
                    <span>-NT$ {printedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>應收總計 (TOTAL)</span>
                  <span>NT$ {printedOrder.total}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-stone-600">
                  <span>支付方式 / 實收</span>
                  <span>
                    {printedOrder.paymentMethod} / NT$ {printedOrder.amountReceived}
                  </span>
                </div>
                {printedOrder.change !== undefined && printedOrder.change > 0 && (
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>找零 (Change)</span>
                    <span>NT$ {printedOrder.change}</span>
                  </div>
                )}
              </div>

              {/* Barcode / Carrier */}
              <div className="pt-3 text-center space-y-2">
                {printedOrder.carrierNumber ? (
                  <div className="text-[11px] bg-stone-200 py-1 rounded">
                    電子發票載具：{printedOrder.carrierNumber}
                  </div>
                ) : (
                  <div className="h-9 bg-repeating-linear-stripes bg-stone-300 w-3/4 mx-auto rounded flex items-center justify-center text-[10px] text-stone-600 tracking-widest font-mono">
                    ||| | |||| || | ||| |||| |
                  </div>
                )}
                <div className="text-[10px] text-stone-500">
                  謝謝惠顧 · 請憑取餐單號至叫號區候餐
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#2A2F3B] bg-[#14161C] flex items-center justify-end gap-3">
          {!printedOrder ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white hover:bg-[#252A36] rounded-xl transition-colors"
              >
                取消返回
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                disabled={paymentMethod === '現金' && cashTendered < total}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>確認收款並出單 (Print Receipt)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>出單完成 · 進行下一筆點單 (New Order)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
