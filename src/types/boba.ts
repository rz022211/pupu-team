export type CupSize = 'regular' | 'large';

export interface TeaBase {
  id: string;
  name: string;
  origin: string;
  roast: 'Unroasted' | 'Light' | 'Medium' | 'Dark' | 'Herbal';
  color: string; // hex
  secondaryColor?: string;
  flavorNotes: string[];
  caffeineMg: number;
  bodyScore: number; // 1-5
  aromaScore: number; // 1-5
  description: string;
  basePrice: number;
}

export interface MilkOption {
  id: string;
  name: string;
  badge?: string;
  color: string;
  opacity: number;
  creamyScore: number; // 1-5
  calorieOffset: number;
  price: number;
}

export interface Topping {
  id: string;
  name: string;
  type: 'pearl' | 'jelly' | 'pudding' | 'foam' | 'popping';
  color: string;
  borderColor?: string;
  size: number;
  chewiness: number; // 1-5
  price: number;
  calories: number;
  description: string;
}

export type SweetnessLevel = 0 | 30 | 50 | 70 | 100 | 120;
export type IceLevel = 'warm' | 'no-ice' | 'light' | 'regular' | 'extra';

export interface CustomBobaDrink {
  id: string;
  name: string;
  size: CupSize;
  teaBase: TeaBase;
  milk: MilkOption;
  sweetness: SweetnessLevel;
  ice: IceLevel;
  toppings: Topping[];
  syrupDrizzle: 'none' | 'brown-sugar' | 'honey' | 'strawberry';
  specialInstructions?: string;
  price: number;
  calories: number;
  isSealed: boolean;
  sipCount: number;
}

export interface SignatureDrink {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  teaBaseId: string;
  milkId: string;
  sweetness: SweetnessLevel;
  ice: IceLevel;
  toppingIds: string[];
  syrupDrizzle: 'none' | 'brown-sugar' | 'honey' | 'strawberry';
  price: number;
  calories: number;
  caffeineLevel: 'None' | 'Gentle' | 'Balanced' | 'High';
  tastingNotes: string[];
}

export interface CartItem {
  cartId: string;
  drink: CustomBobaDrink;
  quantity: number;
}

export interface OrderRecord {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  estimatedPickupMinutes: number;
  customerName: string;
  status: 'brewing' | 'shaking' | 'sealing' | 'ready' | 'picked_up';
}
