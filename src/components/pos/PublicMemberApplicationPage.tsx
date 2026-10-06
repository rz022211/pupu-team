import React, { useState } from 'react';
import { MemberAccount } from '../../types/pos';
import {
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Calendar,
  Gift,
  Coins,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Store,
  Award,
  ChevronLeft,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface PublicMemberApplicationPageProps {
  onRegisterMember: (newMember: Omit<MemberAccount, 'id' | 'tier' | 'points' | 'totalSpent' | 'joinedDate' | 'coupons'>) => { id: string; code: string };
  onClose?: () => void;
  existingMembers?: MemberAccount[];
}

export const PublicMemberApplicationPage: React.FC<PublicMemberApplicationPageProps> = ({
  onRegisterMember,
  onClose,
  existingMembers = [],
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success state
  const [createdMember, setCreatedMember] = useState<MemberAccount | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanPhone || !cleanEmail) {
      setErrorMsg('請填寫完整姓名、手機號碼與電子郵件！');
      return;
    }

    // Validate phone length
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 9) {
      setErrorMsg('請輸入有效的手機號碼 (例如: 0912-345-678)！');
      return;
    }

    // Check duplicate
    const duplicate = existingMembers.find(
      (m) =>
        m.phone.replace(/[^0-9]/g, '') === digitsOnly ||
        m.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (duplicate) {
      setErrorMsg(`此手機號碼或信箱已註冊過會員 (${duplicate.name})！`);
      return;
    }

    bobaAudio.playSeal();

    const result = onRegisterMember({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      birthday: birthday.trim() || undefined,
      isEmailVerified: false,
      verificationStatus: 'pending_admin_review',
      applicationSource: 'portal_online',
    });

    const newMemberObj: MemberAccount = {
      id: result.id,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      birthday: birthday.trim() || undefined,
      isEmailVerified: false,
      verificationStatus: 'pending_admin_review',
      applicationSource: 'portal_online',
      tier: 'bronze',
      points: 10,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0],
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

    setCreatedMember(newMemberObj);
  };

  const handleCopyPortalLink = () => {
    const url = window.location.origin + window.location.pathname + '#member-register';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0E] text-stone-100 overflow-y-auto flex flex-col font-sans select-none">
      {/* Top Standalone Header Bar */}
      <header className="bg-[#12141A] border-b border-[#242733] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-white bg-[#1A1C24] hover:bg-[#252834] px-2.5 py-1.5 rounded-xl border border-[#2B2E3C] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回門市系統</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                BobaFlow <span className="text-[10px] text-amber-400 font-normal">個人會員在線申辦網真</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Mobile Mockup vs Full Desktop */}
          <div className="hidden sm:flex items-center bg-[#181A22] border border-[#292D3B] p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                viewMode === 'mobile'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>手機視角</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                viewMode === 'desktop'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>寬螢幕視角</span>
            </button>
          </div>

          <button
            onClick={handleCopyPortalLink}
            className="flex items-center gap-1 text-xs text-amber-300 bg-[#1D202C] hover:bg-[#282D3D] border border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-colors font-medium shadow-xs"
            title="複製獨立申請網址"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? '已複製網址' : '複製獨立網址'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div
          className={`w-full transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'max-w-md bg-[#13151D] border border-[#252838] rounded-3xl shadow-2xl overflow-hidden'
              : 'max-w-4xl bg-[#13151D] border border-[#252838] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12'
          }`}
        >
          {/* Left / Hero Benefits Section */}
          <div
            className={`p-6 bg-gradient-to-br from-[#1C1A17] via-[#161720] to-[#12131A] border-b md:border-b-0 md:border-r border-[#262938] flex flex-col justify-between ${
              viewMode === 'desktop' ? 'md:col-span-5' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BobaFlow VIP 尊榮茶客計劃</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                  加入會員 · 結帳報手機即享集點
                </h2>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  免下載額外 App，申辦只需 30 秒！日後於任何門市消費結帳，只需向店員報出您的<strong>手機號碼</strong>，即可自動累積消費金額與茶香點數。
                </p>
              </div>

              {/* Privilege list */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 bg-[#171924] p-3 rounded-2xl border border-[#282C3D]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">迎賓入會 NT$15 折價券</h4>
                    <p className="text-[11px] text-stone-400">完成申請立即發放，首筆消費直接折抵。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#171924] p-3 rounded-2xl border border-[#282C3D]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">消費每滿 NT$50 累積 1 點</h4>
                    <p className="text-[11px] text-stone-400">點數可兌換職人特調飲品券、免費加料券。</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#171924] p-3 rounded-2xl border border-[#282C3D]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">門市免帶卡 · 手機號碼即會員</h4>
                    <p className="text-[11px] text-stone-400">結帳報電話即可自動扣折價券與累點，無卡最輕鬆。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#252837] text-[10px] text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>電子郵件由門市管理者手動審核確認，申辦即可即刻使用</span>
            </div>
          </div>

          {/* Right Section: Form or Success Card */}
          <div className={`p-6 ${viewMode === 'desktop' ? 'md:col-span-7' : ''}`}>
            {!createdMember ? (
              /* REGISTRATION FORM */
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">填寫個人會員基本資料</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    請務必確認手機號碼填寫正確，將作為門市結帳確認會員之唯一識別。
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      姓名 (Full Name) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="例：陳美麗 (Mary Chen)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1A1D27] border border-[#2B2F40] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      行動電話 (門市結帳確認用) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="例：0912-345-678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1A1D27] border border-[#2B2F40] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-amber-400 block mt-1">
                      💡 結帳時直接向門市店員報此電話號碼即可積點！
                    </span>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      電子郵件信箱 <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="例：mary.chen@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1A1D27] border border-[#2B2F40] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      管理者將手動審核確認您的信箱，免除複雜驗證碼輸入手續。
                    </span>
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      生日月日 (選填，享有生日壽星茶禮)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="例：08-15"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full bg-[#1A1D27] border border-[#2B2F40] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="rounded border-[#2E3345] bg-[#1A1D27] text-amber-500 focus:ring-0"
                      />
                      <span>我同意 BobaFlow 門市會員權益條款與個人資料保護規範</span>
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-950/50 border border-red-900/60 text-red-300 text-xs rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!agreedTerms}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>送出申請 · 立即成為 BobaFlow 尊榮會員</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* SUCCESS CONFIRMATION VIEW */
              <div className="space-y-4 animate-fade-in text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">恭喜！您已成功加入會員</h3>
                  <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
                    您已獲得<strong>迎賓入會禮 10 點</strong>與<strong>NT$15 折價券</strong>！
                  </p>
                </div>

                {/* Digital Virtual Card */}
                <div className="bg-gradient-to-br from-[#291F13] via-[#3D2C19] to-[#1C1409] border border-amber-500/60 rounded-3xl p-5 text-left text-amber-100 shadow-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block">
                        BOBAFLOW ARTISANAL VIP PASS
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{createdMember.name}</h4>
                      <span className="text-xs font-mono text-stone-300">
                        {createdMember.phone}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      銅級茶友 (Bronze)
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">目前點數</span>
                      <strong className="text-lg font-mono text-amber-300">{createdMember.points} PTS</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">信箱審核狀態</span>
                      <span className="text-[11px] text-amber-300 font-medium">門市管理者審核中</span>
                    </div>
                  </div>

                  {/* Pseudo Barcode */}
                  <div className="h-7 bg-white/95 px-2 py-1 rounded flex items-center justify-center gap-1">
                    <div className="w-1 h-5 bg-black" />
                    <div className="w-2 h-5 bg-black" />
                    <div className="w-0.5 h-5 bg-black" />
                    <div className="w-1.5 h-5 bg-black" />
                    <div className="w-2 h-5 bg-black" />
                    <span className="text-[10px] font-mono text-black font-bold ml-2">
                      {createdMember.phone.replace(/-/g, '')}
                    </span>
                  </div>
                </div>

                {/* Big Instruction Notice for Customer */}
                <div className="p-3.5 bg-[#171924] border border-amber-500/40 rounded-2xl text-left space-y-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> 門市購買結帳說明：
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    您前往門市購買飲品結帳時，<strong>只要直接向店員報出您的手機號碼【{createdMember.phone}】</strong>，門市 POS 系統即可立刻確認您的會員身份並自動累積點數！
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCreatedMember(null);
                      setName('');
                      setPhone('');
                      setEmail('');
                      setBirthday('');
                    }}
                    className="flex-1 py-2.5 bg-[#1B1E29] hover:bg-[#252A3A] border border-[#2E3347] text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    再申請一筆會員
                  </button>

                  {onClose && (
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                    >
                      返回門市點餐系統
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
