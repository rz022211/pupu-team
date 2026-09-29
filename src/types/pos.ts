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
  costPerUnit: number; // in TWD
  lastRestocked: string;
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
}
