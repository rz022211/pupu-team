export type POSCategory =
  | 'all'
  | 'pure-tea'
  | 'milk-tea'
  | 'specialty'
  | 'cheese-foam'
  | 'chewy-dessert'
  | 'seasonal';

export type IceOption = '正常冰' | '少冰' | '微冰' | '去冰' | '溫熱';
export type SweetnessOption = '正常糖(100%)' | '少糖(70%)' | '半糖(50%)' | '微糖(30%)' | '一分糖(10%)' | '無糖(0%)';

export interface POSTopping {
  id: string;
  name: string;
  price: number; // in TWD
  defaultGrams: number;
}

export interface POSDrinkItem {
  id: string;
  name: string;
  nameEn: string;
  category: POSCategory;
  basePrice: number; // in TWD (500ml)
  largePriceOffset: number; // usually +10 TWD
  image?: string;
  color: string;
  description: string;
  teaBase: string;
  tags: string[];
}

export interface POSCartItem {
  cartItemId: string;
  drink: POSDrinkItem;
  size: 'M' | 'L'; // M: 500ml, L: 700ml
  ice: IceOption;
  sweetness: SweetnessOption;
  toppings: POSTopping[];
  quantity: number;
  itemUnitPrice: number;
  note?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: '茶葉' | '乳製品' | '配料' | '糖漿' | '包材耗材';
  currentStock: number;
  unit: string;
  safetyStock: number;
  fixedStock: number; // 固定基準數量 (Số lượng cố định / Par Level target)
  defaultRestockAmount: number; // 標準進貨數量 (Số lượng nhập hàng chuẩn / Standard batch restock lot)
  totalRestocked: number; // 本期累計進貨入庫數量 (Số lượng nhập hàng tích lũy)
  lastRestockAmount?: number; // 最近一次進貨數量
  costPerUnit: number; // in TWD
  lastRestocked: string;
}

export interface RestockRecord {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  amount: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  timestamp: string;
  stockBefore: number;
  stockAfter: number;
  operator?: string;
}

export interface BOMIngredient {
  inventoryItemId: string;
  ingredientName: string;
  amount: number;
  unit: string;
  unitCost: number; // TWD
}

export interface BOMRecipe {
  drinkId: string;
  drinkName: string;
  category: string;
  basePrice: number;
  ingredients: BOMIngredient[];
  totalCost: number;
  marginPercent: number;
}

export interface MemberCoupon {
  id: string;
  title: string;
  description: string;
  discountAmount: number;
  pointsRequired: number;
  used: boolean;
  expiresAt: string;
}

export interface MemberAccount {
  id: string;
  phone: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationStatus?: 'verified' | 'pending_admin_review'; // 已驗證 或 待管理者手動審核
  manualVerifiedBy?: string; // 管理者手動審核人員
  manualVerifiedAt?: string; // 手動審核時間
  applicationSource?: 'pos' | 'portal_online'; // 申請來源：POS前台或獨立申請網頁
  tier: 'bronze' | 'silver' | 'gold'; // 銅級茶友, 銀級茶客, 金級茶師
  points: number;
  totalSpent: number;
  joinedDate: string;
  birthday?: string;
  avatarColor?: string;
  coupons: MemberCoupon[];
}

export interface MemberPurchaseRecord {
  id: string;
  orderNumber: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  timestamp: string;
  items: {
    drinkName: string;
    size: 'M' | 'L';
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  pointsEarned: number;
  pointsRedeemed?: number;
  paymentMethod: string;
}

export interface CompletedOrder {
  orderNumber: string;
  timestamp: string;
  items: POSCartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: '現金' | 'LINE Pay' | '街口支付' | '信用卡';
  amountReceived?: number;
  change?: number;
  orderType: '外帶' | '內用' | '外送';
  carrierNumber?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
}
