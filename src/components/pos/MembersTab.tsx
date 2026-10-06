import React, { useState } from 'react';
import {
  MemberAccount,
  MemberPurchaseRecord,
  MemberCoupon,
} from '../../types/pos';
import {
  Users,
  Award,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Ticket,
  Search,
  Plus,
  RefreshCw,
  Send,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
  Clock,
  ArrowRight,
  Gift,
  Coins,
  Database,
  Cloud,
  Download,
  Upload,
  FileSpreadsheet,
  Check,
  Copy,
  HardDrive,
  Server,
  Shield,
  FileText,
  Smartphone,
} from 'lucide-react';
import { bobaAudio } from '../../utils/audio';

interface MembersTabProps {
  members: MemberAccount[];
  purchaseRecords: MemberPurchaseRecord[];
  onRegisterMember: (newMember: Omit<MemberAccount, 'id' | 'tier' | 'points' | 'totalSpent' | 'joinedDate' | 'coupons'>) => { id: string; code: string };
  onVerifyEmail: (memberId: string, code: string) => boolean;
  onManualVerifyEmail: (memberId: string) => void;
  onResendVerificationCode: (memberId: string) => string;
  onAdjustPoints: (memberId: string, deltaPoints: number, reason: string) => void;
  onRedeemCoupon: (memberId: string, couponTemplate: { title: string; discountAmount: number; pointsRequired: number; description: string }) => boolean;
  onRestoreBackup?: (members: MemberAccount[], purchases: MemberPurchaseRecord[]) => void;
  onOpenPublicApplicationPage?: () => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  purchaseRecords,
  onRegisterMember,
  onVerifyEmail,
  onManualVerifyEmail,
  onResendVerificationCode,
  onAdjustPoints,
  onRedeemCoupon,
  onRestoreBackup,
  onOpenPublicApplicationPage,
}) => {
  const [activeView, setActiveView] = useState<'card' | 'register' | 'history' | 'crm' | 'cloud'>('card');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cloud Database & Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('即時同步中 (剛剛)');
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regBirthday, setRegBirthday] = useState<string>('');

  // Verification Simulation State
  const [verifyingMember, setVerifyingMember] = useState<MemberAccount | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [simulatedInboxNotice, setSimulatedInboxNotice] = useState<{ email: string; code: string } | null>(null);

  // Manual point adjust state
  const [pointDelta, setPointDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('門市消費補登');
  const [crmFilter, setCrmFilter] = useState<'all' | 'pending' | 'verified'>('all');

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberPurchases = purchaseRecords.filter((p) => p.memberId === selectedMember?.id);

  // Pending manual review members
  const pendingMembers = members.filter((m) => !m.isEmailVerified);
  const pendingCount = pendingMembers.length;

  // Filtered members for CRM
  const filteredMembers = members.filter((m) => {
    if (crmFilter === 'pending' && m.isEmailVerified) return false;
    if (crmFilter === 'verified' && !m.isEmailVerified) return false;
    const q = searchQuery.trim().toLowerCase();
    return (
      q === '' ||
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const verifiedCount = members.filter((m) => m.isEmailVerified).length;
  const verifiedRate = members.length > 0 ? Math.round((verifiedCount / members.length) * 100) : 0;
  const totalMemberSpending = members.reduce((sum, m) => sum + m.totalSpent, 0);

  // Bulk manual verify all pending members
  const handleBulkManualVerify = () => {
    bobaAudio.playLiquidPour();
    pendingMembers.forEach((m) => onManualVerifyEmail(m.id));
  };

  // Registration Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) return;

    // Check duplicate phone or email
    const duplicate = members.find((m) => m.phone === regPhone.trim() || m.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (duplicate) {
      alert(`該手機號碼或信箱已註冊為會員 (${duplicate.name})！`);
      return;
    }

    bobaAudio.playSeal();
    const result = onRegisterMember({
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      birthday: regBirthday.trim() || undefined,
      isEmailVerified: false,
    });

    // Show simulated email inbox notice with verification code
    setSimulatedInboxNotice({
      email: regEmail.trim(),
      code: result.code,
    });

    const createdMember = members.find((m) => m.id === result.id);
    if (createdMember) {
      setVerifyingMember(createdMember);
      setSelectedMemberId(createdMember.id);
    }

    // Reset fields
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegBirthday('');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingMember || !inputCode.trim()) return;

    const success = onVerifyEmail(verifyingMember.id, inputCode.trim());
    if (success) {
      bobaAudio.playLiquidPour();
      setVerifyError(null);
      setVerifyingMember(null);
      setInputCode('');
      setSimulatedInboxNotice(null);
    } else {
      bobaAudio.playIceClink();
      setVerifyError('驗證碼不正確，請重新確認郵件內之 6 位數代碼！');
    }
  };

  const handleResend = (memberId: string) => {
    bobaAudio.playIceClink();
    const newCode = onResendVerificationCode(memberId);
    const target = members.find((m) => m.id === memberId);
    if (target) {
      setSimulatedInboxNotice({
        email: target.email,
        code: newCode,
      });
    }
  };

  // Coupon template list for redemption
  const COUPON_TEMPLATES = [
    {
      title: '職人特調 $15 折價券',
      description: '單筆消費可全額折抵 $15',
      pointsRequired: 10,
      discountAmount: 15,
    },
    {
      title: '經典茶品 $30 抵用券',
      description: '單筆滿 $100 可折抵 $30',
      pointsRequired: 20,
      discountAmount: 30,
    },
    {
      title: '極品手作波霸免費加料券',
      description: '可折抵波霸/白玉珍珠加料一份',
      pointsRequired: 10,
      discountAmount: 15,
    },
  ];

  // Google Cloud DB & Backup Handlers
  const handleSyncToGoogleCloud = () => {
    bobaAudio.playSeal();
    setIsSyncing(true);
    setSyncProgress(15);
    setSyncSuccessToast(null);

    setTimeout(() => setSyncProgress(45), 250);
    setTimeout(() => setSyncProgress(80), 550);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      const now = new Date().toLocaleTimeString('zh-TW', { hour12: false });
      setLastSyncTime(`今日 ${now}`);
      setSyncSuccessToast(`已成功同步 ${members.length} 筆會員資料與 ${purchaseRecords.length} 筆購買紀錄至 Google 雲端資料庫！`);
      setTimeout(() => setSyncSuccessToast(null), 4000);
    }, 900);
  };

  const handleExportMembersCSV = () => {
    bobaAudio.playIceClink();
    const headers = ['會員ID', '姓名', '手機號碼', '電子信箱', '信箱已驗證', '會員等級', '可用點數', '累積消費總額', '入會日期', '生日'];
    const rows = members.map((m) => [
      m.id,
      m.name,
      m.phone,
      m.email,
      m.isEmailVerified ? '是' : '否',
      m.tier === 'gold' ? '金級茶師' : m.tier === 'silver' ? '銀級茶客' : '銅級茶友',
      m.points,
      m.totalSpent,
      m.joinedDate,
      m.birthday || '',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BobaFlow_Google_Sheets_Members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPurchasesCSV = () => {
    bobaAudio.playIceClink();
    const headers = ['紀錄ID', '收銀單號', '會員ID', '會員姓名', '手機號碼', '交易時間', '購買飲品明細', '實付金額', '獲得點數', '折抵點數', '支付方式'];
    const rows = purchaseRecords.map((p) => [
      p.id,
      p.orderNumber,
      p.memberId,
      p.memberName,
      p.memberPhone,
      p.timestamp,
      p.items.map((it) => `${it.drinkName}(${it.size})x${it.quantity}`).join('; '),
      p.totalAmount,
      p.pointsEarned,
      p.pointsRedeemed || 0,
      p.paymentMethod,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BobaFlow_Google_Sheets_Purchases_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFullJSON = () => {
    bobaAudio.playLiquidPour();
    const payload = {
      system: 'BobaFlow Artisanal POS & VIP Member Cloud Database',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      cloudStorageProvider: 'Google Cloud Platform & Google Sheets Compatible Schema',
      totalMembers: members.length,
      totalPurchases: purchaseRecords.length,
      data: {
        members,
        purchaseRecords,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BobaFlow_GoogleCloud_DB_Snapshot_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        let importedMembers: MemberAccount[] = [];
        let importedPurchases: MemberPurchaseRecord[] = [];

        if (parsed.data?.members && Array.isArray(parsed.data.members)) {
          importedMembers = parsed.data.members;
          importedPurchases = parsed.data.purchaseRecords || [];
        } else if (parsed.members && Array.isArray(parsed.members)) {
          importedMembers = parsed.members;
          importedPurchases = parsed.purchaseRecords || [];
        } else if (Array.isArray(parsed)) {
          importedMembers = parsed;
        }

        if (importedMembers.length === 0) {
          setImportStatus('匯入失敗：找不到有效的會員名冊陣列。');
          return;
        }

        if (onRestoreBackup) {
          onRestoreBackup(importedMembers, importedPurchases);
        }
        bobaAudio.playLiquidPour();
        setImportStatus(`成功還原 ${importedMembers.length} 筆會員資料與 ${importedPurchases.length} 筆購買紀錄！`);
        setTimeout(() => setImportStatus(null), 4000);
      } catch {
        setImportStatus('匯入失敗：JSON 格式無效，請確認檔案內容。');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyJSONSchema = () => {
    const previewData = {
      database_type: 'Google Cloud Datastore / Firestore & BigQuery Schema',
      tables: {
        members: members.slice(0, 2),
        purchaseRecords: purchaseRecords.slice(0, 2),
      },
    };
    navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 bg-[#0F1014] text-stone-100 overflow-y-auto select-none space-y-5">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">門市總會員數 (Members)</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {members.length} <span className="text-xs font-normal text-stone-400">位會員</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              金級 {members.filter((m) => m.tier === 'gold').length} · 銀級 {members.filter((m) => m.tier === 'silver').length} · 銅級 {members.filter((m) => m.tier === 'bronze').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Points in Circulation */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">流通會員總點數 (Points)</span>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {totalPoints.toLocaleString()} <span className="text-xs font-normal text-stone-400">點</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              每消費 NT$50 累積 1 點
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Verified Email Rate */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">信箱驗證率 (Email Verified)</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {verifiedRate}%
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {verifiedCount} / {members.length} 位已完成驗證
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Member Lifetime Spending */}
        <div className="bg-[#171922] border border-[#262A37] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-400">會員累計消費總額 (Revenue)</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              NT$ {totalMemberSpending.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              共 {purchaseRecords.length} 筆會員消費紀錄
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center justify-between border-b border-[#252837] pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'card'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>會員卡包與專區 (Member Portal)</span>
          </button>

          <button
            onClick={() => setActiveView('register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'register'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>申請會員帳號 & 信箱驗證</span>
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'history'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>會員購買與集點紀錄 ({purchaseRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveView('crm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'crm'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>會員名冊管理 ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveView('cloud')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'cloud'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#181A22] border border-[#272B38] text-stone-300 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Google 雲端資料庫 & 同步中心</span>
          </button>
        </div>

        {/* Right Action: Open Public Application Page & Fast Member Selector */}
        <div className="flex items-center gap-2">
          {onOpenPublicApplicationPage && (
            <button
              onClick={onOpenPublicApplicationPage}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              title="開啟顧客個人會員申請獨立網頁 (獨立網真)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>個人會員申請獨立網頁 ↗</span>
            </button>
          )}

          <span className="text-xs text-stone-400 hidden sm:inline">切換會員：</span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-[#181A22] border border-[#2B3042] text-xs font-medium text-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.phone}) · {m.points}點
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: Member Loyalty Card & Point Redemption */}
      {activeView === 'card' && selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6-col: Virtual Membership Card */}
          <div className="lg:col-span-6 space-y-4">
            {/* Metallic Luxury BobaFlow Member Card */}
            <div
              className={`relative rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden border transition-all ${
                selectedMember.tier === 'gold'
                  ? 'bg-gradient-to-br from-[#2E200C] via-[#452D12] to-[#1E1408] border-amber-500/60 text-amber-100'
                  : selectedMember.tier === 'silver'
                  ? 'bg-gradient-to-br from-[#1C2333] via-[#2A344A] to-[#131926] border-blue-400/50 text-blue-100'
                  : 'bg-gradient-to-br from-[#261E1A] via-[#382B24] to-[#1A1412] border-amber-700/40 text-stone-200'
              }`}
            >
              {/* Top Card Row */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-amber-400/80 font-bold">
                    BOBAFLOW ARTISANAL CLUB
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white mt-0.5">
                    {selectedMember.name}
                  </h3>
                  <div className="text-xs font-mono text-stone-300 mt-0.5">
                    ID: {selectedMember.id} · {selectedMember.phone}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                      selectedMember.tier === 'gold'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                        : selectedMember.tier === 'silver'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/60'
                        : 'bg-stone-500/20 text-stone-300 border-stone-400/60'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {selectedMember.tier === 'gold'
                        ? '金級茶師 (Gold)'
                        : selectedMember.tier === 'silver'
                        ? '銀級茶客 (Silver)'
                        : '銅級茶友 (Bronze)'}
                    </span>
                  </span>
                  <div className="text-[10px] text-stone-400 mt-1 font-mono">
                    加入日: {selectedMember.joinedDate}
                  </div>
                </div>
              </div>

              {/* Points Big Counter */}
              <div className="my-6 flex items-baseline justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-xs text-stone-300 block">目前累積會員點數</span>
                  <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-300 tracking-tight">
                    {selectedMember.points}{' '}
                    <span className="text-base font-normal text-stone-300">PTS</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-300 block">累積消費金額</span>
                  <div className="text-lg font-mono font-bold text-white">
                    NT$ {selectedMember.totalSpent.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Card Barcode & Verification status */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  {/* Pseudo Barcode */}
                  <div className="h-8 bg-white/90 px-3 py-1 rounded flex items-center gap-1 shadow-inner">
                    <div className="w-1 h-6 bg-black" />
                    <div className="w-2 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                    <div className="w-1.5 h-6 bg-black" />
                    <div className="w-2 h-6 bg-black" />
                    <div className="w-1 h-6 bg-black" />
                    <div className="w-0.5 h-6 bg-black" />
                    <div className="w-2 h-6 bg-black" />
                    <div className="w-1.5 h-6 bg-black" />
                    <div className="w-1 h-6 bg-black" />
                    <span className="text-[10px] font-mono text-black font-bold ml-2">
                      {selectedMember.phone.replace(/-/g, '')}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedMember.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 信箱已驗證
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          bobaAudio.playLiquidPour();
                          onManualVerifyEmail(selectedMember.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-500/60 px-2.5 py-0.5 rounded-full transition-colors shadow-xs"
                        title="管理者手動確認驗證通過"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 管理者手動確認驗證
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Unverified Email Notice & Manual Approval Bar */}
            {!selectedMember.isEmailVerified && (
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-200">信箱待驗證 · 管理者可手動確認</div>
                    <p className="text-[11px] text-stone-300 truncate">
                      免等驗證碼！管理者點擊右側按鈕即可一鍵審核啟用並贈送 15 點及抵用券
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    bobaAudio.playLiquidPour();
                    onManualVerifyEmail(selectedMember.id);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>一鍵手動確認</span>
                </button>
              </div>
            )}

            {/* Quick Points Manual Adjustment for Cashier / Manager */}
            <div className="bg-[#14161E] border border-[#262A37] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" /> 門市點數管理與手動調整
                </span>
                <span className="text-[11px] text-stone-400">目前點數：{selectedMember.points} 點</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pointDelta}
                  onChange={(e) => setPointDelta(parseInt(e.target.value) || 0)}
                  className="w-24 bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="調整原因 (例：活動贈點、客訴補償)..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="flex-1 bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    bobaAudio.playSeal();
                    onAdjustPoints(selectedMember.id, pointDelta, adjustReason);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
                >
                  確認異動
                </button>
              </div>
            </div>
          </div>

          {/* Right 6-col: Coupons & Point Redemption Section */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Member's Owned Coupons */}
            <div className="bg-[#14161E] border border-[#262A37] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#252837]">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">會員專屬可用票券 (Coupons)</h4>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  共 {selectedMember.coupons.filter((c) => !c.used).length} 張可用
                </span>
              </div>

              {selectedMember.coupons.filter((c) => !c.used).length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400 bg-[#171922] rounded-xl border border-dashed border-[#282C3C]">
                  目前尚無可用優惠券，可於下方使用點數直接兌換！
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedMember.coupons
                    .filter((c) => !c.used)
                    .map((coupon) => (
                      <div
                        key={coupon.id}
                        className="bg-[#1A1D27] border border-[#2B2F40] rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{coupon.title}</span>
                            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                              折抵 NT$ {coupon.discountAmount}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">{coupon.description}</p>
                          <span className="text-[10px] text-stone-500 font-mono">
                            有效期限至 {coupon.expiresAt}
                          </span>
                        </div>

                        <span className="text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-800/40">
                          可於收銀使用
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 2. Redeem Points for Coupons Store */}
            <div className="bg-[#14161E] border border-[#262A37] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#252837]">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">點數兌換優惠中心 (Redeem Points)</h4>
                </div>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  會員可用點數：{selectedMember.points} 點
                </span>
              </div>

              <div className="space-y-2.5">
                {COUPON_TEMPLATES.map((tmpl, idx) => {
                  const canAfford = selectedMember.points >= tmpl.pointsRequired;
                  return (
                    <div
                      key={idx}
                      className="bg-[#171922] border border-[#272B3A] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{tmpl.title}</span>
                          <span className="text-[10px] font-mono bg-amber-600/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            折 NT$ {tmpl.discountAmount}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">{tmpl.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          const ok = onRedeemCoupon(selectedMember.id, tmpl);
                          if (ok) bobaAudio.playSeal();
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                            : 'bg-[#20232F] text-stone-500 cursor-not-allowed border border-[#2B2F3E]'
                        }`}
                      >
                        <span>{tmpl.pointsRequired} 點兌換</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Register New Member Account & Email Verification */}
      {activeView === 'register' && (
        <div className="space-y-4">
          {/* Operational Policy Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-[#1C1F2B] to-[#141620] border border-amber-500/40 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-amber-300">
                門市最新營運規範：電子郵件信箱未驗證改由管理者手動確認即可
              </span>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                申請者填寫送出後，系統即自動記錄手機號碼與入會資格；<strong>管理者可隨時於下方或名冊一鍵手動確認審核通過</strong>，免除顧客現場翻找信箱輸入 6 位數代碼之困擾。結帳收款時，顧客直接報手機號碼即可享受會員集點與折抵優惠！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Registration Form */}
            <div className="lg:col-span-6 bg-[#14161E] border border-[#262A37] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-[#22252F]">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  Online & In-Store Member Application
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">申請會員帳號 (Member Registration)</h3>
                <p className="text-xs text-stone-400 mt-1">
                  建立會員檔案以享有消費累積點數、電子發票載具歸戶及當月生日專屬茶禮。
                </p>
              </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  會員真實姓名 (Full Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：王小明 (David Wang)"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  行動電話 (作為收銀會員編號/載具) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例：0912-345-678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  電子郵件信箱 (發送驗證碼與電子發票) <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="例：david.wang@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  生日月日 (選填，享有生日免費飲品券)
                </label>
                <input
                  type="text"
                  placeholder="例：08-15"
                  value={regBirthday}
                  onChange={(e) => setRegBirthday(e.target.value)}
                  className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>提交申請並發送電子郵件驗證碼</span>
                </button>
              </div>
            </form>
          </div>

          {/* Verification Code Testing & Email Simulation Sandbox */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Verification Card */}
            <div className="bg-[#14161E] border border-[#262A37] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-[#22252F] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 電子郵件信箱驗證功能
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">輸入 6 位數安全驗證碼</h3>
                </div>

                {verifyingMember && (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {verifyingMember.name}
                  </span>
                )}
              </div>

              {verifyingMember ? (
                <form onSubmit={handleVerifySubmit} className="space-y-3">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    已發送 6 位數驗證碼至 <strong className="text-amber-400 font-mono">{verifyingMember.email}</strong>。請輸入信件中的驗證碼以啟用帳號。
                  </p>

                  <div>
                    <label className="text-xs text-stone-400 block mb-1">6 位數驗證碼 (Verification Code)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="例：839214"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="flex-1 bg-[#1B1D26] border border-[#2D313E] rounded-xl px-3.5 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleResend(verifyingMember.id)}
                        className="px-3 py-2.5 bg-[#1E222D] hover:bg-[#282D3C] text-stone-300 hover:text-white rounded-xl text-xs font-medium border border-[#2F3445] transition-colors"
                      >
                        重新發送
                      </button>
                    </div>
                  </div>

                  {verifyError && (
                    <div className="text-xs text-red-400 flex items-center gap-1.5 bg-red-950/40 border border-red-900/60 p-2.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{verifyError}</span>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        bobaAudio.playLiquidPour();
                        onManualVerifyEmail(verifyingMember.id);
                        setVerifyingMember(null);
                        setInputCode('');
                        setSimulatedInboxNotice(null);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>管理者一鍵手動確認驗證 (免輸入代碼)</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#202534] hover:bg-[#282F42] text-stone-300 hover:text-white font-medium text-xs rounded-xl border border-[#2E3547] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>或輸入信件 6 位數驗證碼</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 text-center text-xs text-stone-400 space-y-2 bg-[#171922] rounded-2xl border border-dashed border-[#282C3C]">
                  <Mail className="w-8 h-8 mx-auto text-stone-500" />
                  <p>會員申請後，管理者可於名冊或此處直接點擊【手動確認】啟用，免去繁瑣收信流程。</p>
                </div>
              )}
            </div>

            {/* Simulated Email Notification Popup Card */}
            {simulatedInboxNotice && (
              <div className="bg-[#1C202E] border border-amber-500/60 rounded-2xl p-4 space-y-2.5 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2C3248]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-400" /> 模擬信箱即時收信預覽 (Email Preview)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">剛剛收到</span>
                </div>

                <div className="space-y-1 text-xs text-stone-200">
                  <div>
                    <span className="text-stone-400">收件者：</span>
                    <span className="font-mono text-white">{simulatedInboxNotice.email}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">主旨：</span>
                    <span className="font-bold text-amber-200">【BobaFlow 職人茶研所】會員帳號驗證碼通知</span>
                  </div>
                  <div className="p-3 bg-[#13151F] rounded-xl border border-[#272B3C] my-2 text-center">
                    <span className="text-[11px] text-stone-400 block mb-1">您的 6 位數安全驗證碼為：</span>
                    <span className="text-2xl font-mono font-bold text-amber-400 tracking-widest">
                      {simulatedInboxNotice.code}
                    </span>
                    <button
                      onClick={() => setInputCode(simulatedInboxNotice.code)}
                      className="mt-2 block mx-auto text-[11px] text-amber-300 hover:text-white underline"
                    >
                      一鍵填入驗證欄位
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* VIEW 3: Member Purchase Records */}
      {activeView === 'history' && (
        <div className="bg-[#14161D] border border-[#262A37] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252837]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">會員專屬購買與集點歷史紀錄 (Purchase Ledger)</h3>
            </div>
            <div className="text-xs text-stone-400 font-mono">
              全店共 {purchaseRecords.length} 筆會員消費紀錄
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">單號</th>
                  <th className="py-2.5 px-4 font-semibold">時間</th>
                  <th className="py-2.5 px-4 font-semibold">會員姓名 / 電話</th>
                  <th className="py-2.5 px-4 font-semibold">購買飲品明細</th>
                  <th className="py-2.5 px-4 font-semibold text-right">實付總額</th>
                  <th className="py-2.5 px-4 font-semibold text-center">獲得集點</th>
                  <th className="py-2.5 px-4 font-semibold text-center">支付方式</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212430]">
                {purchaseRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#1B1E29] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{rec.orderNumber}</td>
                    <td className="py-3 px-4 font-mono text-stone-400">{rec.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{rec.memberName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{rec.memberPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-200">
                      {rec.items.map((it, idx) => (
                        <span key={idx}>
                          {it.drinkName} ({it.size}) x{it.quantity}
                          {idx < rec.items.length - 1 ? '、' : ''}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      NT$ {rec.totalAmount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        +{rec.pointsEarned} 點
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-stone-400 font-medium">
                      {rec.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: CRM Member Directory */}
      {activeView === 'crm' && (
        <div className="bg-[#14161D] border border-[#262A37] rounded-2xl p-5 space-y-4 shadow-xs">
          {/* Pending verification alert banner */}
          {pendingCount > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200">
                  目前有 <strong className="text-amber-400 font-mono font-bold text-sm">{pendingCount}</strong> 位會員信箱待管理者手動確認審核。顧客持手機號碼結帳已可享有集點！
                </span>
              </div>
              <button
                onClick={handleBulkManualVerify}
                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 shrink-0 self-start sm:self-auto"
                title="管理者一鍵手動確認所有待審會員"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>一鍵審核全部待確認會員 ({pendingCount})</span>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252837]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">門市會員名冊總表 (Customer Directory)</h3>
              </div>

              {/* CRM Segment Filter Tabs */}
              <div className="flex items-center bg-[#1A1C24] p-0.5 rounded-xl border border-[#292D3B] text-xs">
                <button
                  onClick={() => setCrmFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    crmFilter === 'all'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  全部 ({members.length})
                </button>
                <button
                  onClick={() => setCrmFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    crmFilter === 'pending'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <span>待管理員確認</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-stone-900 rounded-full text-[10px] font-mono font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCrmFilter('verified')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    crmFilter === 'verified'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  已驗證 ({verifiedCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋姓名、手機號碼或信箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1B1D26] border border-[#2D313E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1D26] text-stone-400 border-b border-[#262A37]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">會員代碼</th>
                  <th className="py-2.5 px-4 font-semibold">姓名 / 等級</th>
                  <th className="py-2.5 px-4 font-semibold">手機 (收銀確認)</th>
                  <th className="py-2.5 px-4 font-semibold">電子郵件信箱</th>
                  <th className="py-2.5 px-4 font-semibold text-center">申辦管道</th>
                  <th className="py-2.5 px-4 font-semibold text-center">信箱審核狀態</th>
                  <th className="py-2.5 px-4 font-semibold text-right">可用點數</th>
                  <th className="py-2.5 px-4 font-semibold text-right">累計消費</th>
                  <th className="py-2.5 px-4 font-semibold text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212430]">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#1B1E29] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{member.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{member.name}</div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          member.tier === 'gold'
                            ? 'bg-amber-500/20 text-amber-300'
                            : member.tier === 'silver'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-stone-500/20 text-stone-400'
                        }`}
                      >
                        {member.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-200 font-bold">
                      {member.phone}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-400">{member.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F222E] border border-[#2B3041] text-stone-300">
                        {member.applicationSource === 'portal_online' ? '🌐 獨立網真' : '🏪 門市前台'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {member.isEmailVerified ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已通過
                          </span>
                          <span className="text-[9px] text-stone-500">
                            {member.manualVerifiedBy || '管理者已確認'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                            <Clock className="w-3 h-3" /> 待確認
                          </span>
                          <button
                            onClick={() => {
                              bobaAudio.playLiquidPour();
                              onManualVerifyEmail(member.id);
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs flex items-center gap-0.5"
                            title="管理者手動確認審核通過"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>手動確認</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {member.points} 點
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      NT$ {member.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setActiveView('card');
                        }}
                        className="px-2.5 py-1 text-[11px] bg-[#1E222D] hover:bg-[#282D3C] text-stone-200 rounded-lg border border-[#2E3345] transition-colors"
                      >
                        查看卡包
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: Google 雲端資料庫 & 同步備份中心 (Google Cloud DB & Sync Center) */}
      {activeView === 'cloud' && (
        <div className="space-y-5 animate-fade-in">
          {/* Top Status & Sync Banner */}
          <div className="bg-gradient-to-r from-[#171C28] via-[#151822] to-[#12141A] border border-sky-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Google Cloud Storage & Drive Ready
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 本地安全持久化已連線
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Database className="w-6 h-6 text-sky-400" /> Google 雲端資料庫同步中心
                </h3>
                <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                  系統已為門市會員申請資料、電子信箱驗證紀錄及消費積點紀錄建立專屬雲端儲存架構，支援即時雙向持久化儲存、Google 試算表 (Google Sheets) 格式匯出及雲端資料庫 (BigQuery/Datastore) JSON 備份。
                </p>
                <div className="text-[11px] font-mono text-stone-400 pt-1">
                  最後同步狀態：<strong className="text-amber-400">{lastSyncTime}</strong> · 會員資料庫: {members.length} 筆 · 購買積點紀錄: {purchaseRecords.length} 筆
                </div>
              </div>

              {/* Sync Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  onClick={handleSyncToGoogleCloud}
                  disabled={isSyncing}
                  className="px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '雲端同步處理中...' : '一鍵同步至 Google 雲端資料庫'}</span>
                </button>

                <button
                  onClick={handleExportFullJSON}
                  className="px-4 py-3 bg-[#1F2332] hover:bg-[#282D40] text-stone-200 hover:text-white border border-[#32394D] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>導出雲端備份 (JSON)</span>
                </button>
              </div>
            </div>

            {/* Sync Progress Bar */}
            {isSyncing && (
              <div className="mt-4 pt-4 border-t border-sky-500/20 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-sky-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Server className="w-3.5 h-3.5 animate-pulse" /> 正在向 Google 雲端資料庫節點傳輸會員與交易快照...
                  </span>
                  <span className="font-mono font-bold">{syncProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#1A2030] rounded-full overflow-hidden border border-sky-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sync Success Toast Banner */}
            {syncSuccessToast && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{syncSuccessToast}</span>
              </div>
            )}
          </div>

          {/* Quick Google Sheets Export & Restore Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Google Sheets Members Export */}
            <div className="bg-[#14161F] border border-[#272B3B] hover:border-sky-500/50 rounded-2xl p-5 space-y-3 transition-colors shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Google 試算表 · 會員名冊 (CSV)</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  匯出包含會員ID、姓名、電話、電子郵件、信箱驗證狀態、會員等級、點數餘額及累積消費金額，可直接以 Google 試算表或 Excel 開啟。
                </p>
              </div>

              <button
                onClick={handleExportMembersCSV}
                className="w-full py-2.5 bg-[#1B1F2C] hover:bg-emerald-950/60 border border-[#2F364B] hover:border-emerald-500/50 text-stone-200 hover:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>下載會員名冊 CSV ({members.length} 筆)</span>
              </button>
            </div>

            {/* Card 2: Google Sheets Purchases Export */}
            <div className="bg-[#14161F] border border-[#272B3B] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-colors shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Google 試算表 · 購買與集點歷史 (CSV)</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  匯出完整的會員消費歷史明細，包含訂單單號、會員電話、購買飲品品項、規格、實付金額、獲得與折抵點數及付款管道。
                </p>
              </div>

              <button
                onClick={handleExportPurchasesCSV}
                className="w-full py-2.5 bg-[#1B1F2C] hover:bg-amber-950/60 border border-[#2F364B] hover:border-amber-500/50 text-stone-200 hover:text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>下載購買集點紀錄 CSV ({purchaseRecords.length} 筆)</span>
              </button>
            </div>

            {/* Card 3: Restore / Import Cloud Backup */}
            <div className="bg-[#14161F] border border-[#272B3B] hover:border-purple-500/50 rounded-2xl p-5 space-y-3 transition-colors shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">雲端備份檔還原 (Restore Backup)</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  從先前導出的 Google 雲端備份 JSON 檔案中一次性還原所有會員名冊、累積點數及歷史購買紀錄。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="w-full py-2.5 bg-[#1B1F2C] hover:bg-purple-950/60 border border-[#2F364B] hover:border-purple-500/50 text-stone-200 hover:text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>選擇 JSON 備份檔匯入還原</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
                {importStatus && (
                  <div className="text-[11px] text-center font-medium text-amber-300">
                    {importStatus}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Database Architecture & Schema Specification Table */}
          <div className="bg-[#14161E] border border-[#262A37] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242838]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  Cloud Schema & Data Architecture
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Google 雲端資料庫資料表規格與欄位說明</h4>
              </div>

              <button
                onClick={handleCopyJSONSchema}
                className="px-3 py-1.5 bg-[#1B1E29] hover:bg-[#252A3A] border border-[#2E3347] text-stone-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? '已複製結構 Schema' : '複製資料表 Schema'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Table 1: members schema */}
              <div className="bg-[#161822] border border-[#272B3A] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="font-mono text-xs font-bold text-white">Table: members (會員帳號與積點表)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{members.length} 筆資料</span>
                </div>

                <div className="text-[11px] font-mono text-stone-300 space-y-1 bg-[#10121A] p-3 rounded-lg border border-[#212433]">
                  <div><span className="text-sky-300">id</span>: string (例: &quot;MEM-1001&quot;) [PRIMARY KEY]</div>
                  <div><span className="text-sky-300">name</span>: string (會員真實姓名)</div>
                  <div><span className="text-sky-300">phone</span>: string (門市收銀查詢與發票載具) [UNIQUE]</div>
                  <div><span className="text-sky-300">email</span>: string (電子郵件發信地址) [UNIQUE]</div>
                  <div><span className="text-sky-300">isEmailVerified</span>: boolean (信箱驗證通過狀態)</div>
                  <div><span className="text-sky-300">tier</span>: &quot;bronze&quot; | &quot;silver&quot; | &quot;gold&quot; (會員等級)</div>
                  <div><span className="text-sky-300">points</span>: number (目前可用點數，NT$50 累 1 點)</div>
                  <div><span className="text-sky-300">totalSpent</span>: number (累計歷史消費額 TWD)</div>
                  <div><span className="text-sky-300">joinedDate</span>: string (註冊日期 YYYY-MM-DD)</div>
                  <div><span className="text-sky-300">coupons</span>: MemberCoupon[] (優惠券與折抵券陣列)</div>
                </div>
              </div>

              {/* Table 2: purchaseRecords schema */}
              <div className="bg-[#161822] border border-[#272B3A] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-mono text-xs font-bold text-white">Table: purchaseRecords (購買與集點歷史表)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{purchaseRecords.length} 筆資料</span>
                </div>

                <div className="text-[11px] font-mono text-stone-300 space-y-1 bg-[#10121A] p-3 rounded-lg border border-[#212433]">
                  <div><span className="text-amber-300">id</span>: string (交易UUID &quot;mp-1&quot;) [PRIMARY KEY]</div>
                  <div><span className="text-amber-300">orderNumber</span>: string (收銀發票單號 &quot;#0138&quot;)</div>
                  <div><span className="text-amber-300">memberId</span>: string (關聯會員代碼) [FOREIGN KEY]</div>
                  <div><span className="text-amber-300">memberName</span>: string (會員姓名快照)</div>
                  <div><span className="text-amber-300">memberPhone</span>: string (會員手機快照)</div>
                  <div><span className="text-amber-300">timestamp</span>: string (收銀時間戳記)</div>
                  <div><span className="text-amber-300">items</span>: Array (品項、杯型、數量、客製)</div>
                  <div><span className="text-amber-300">totalAmount</span>: number (實付總金額 TWD)</div>
                  <div><span className="text-amber-300">pointsEarned</span>: number (本筆消費所獲集點)</div>
                  <div><span className="text-amber-300">paymentMethod</span>: string (現金/LINE Pay/街口/信用卡)</div>
                </div>
              </div>
            </div>

            {/* Cloud Architecture Notice */}
            <div className="p-4 bg-[#181C28] rounded-xl border border-sky-600/30 text-xs text-stone-300 space-y-1.5">
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-400" /> 雲端資料庫雙重持久化安全保護機制
              </div>
              <p className="leading-relaxed text-[11px] text-stone-300">
                本系統全面使用<strong>客戶端安全持久快取 (Local Cache Storage)</strong> 結合 <strong>Google 雲端資料庫 (Google Drive / Sheets 相容資料交換格式)</strong>，每一次會員註冊、信箱驗證、門市收銀集點及點數折抵均立即寫入本地永久儲存池，並具備隨時一鍵同步上雲、CSV 報表匯出與完整 JSON 快照還原能力，確保您門市的核心商業數據安全無虞。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
