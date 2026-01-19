export interface ServiceRequest {
  id: string;
  tableNumber: number;
  requestType: string;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt?: string;
  elapsedTime?: number;
}

export interface Settings {
  tables: number[];
  requestTypes: string[];
  soundEnabled: boolean;
  notificationVolume: number;
}

export interface Analytics {
  averageServiceTime: number;
  averageBillTime: number;
  totalRequests: number;
  requestsByType: Record<string, number>;
}

// Menu Types
export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  dietaryTags?: string[] | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

// Order Types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  notes?: string | null;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemWithDetails[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface OrderItemWithDetails extends OrderItem {
  menuItem?: MenuItem;
}

// Cart Types (client-side)
export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  tableNumber: number;
}