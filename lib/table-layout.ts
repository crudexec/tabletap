export interface TablePosition {
  tableNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'square' | 'rectangle' | 'round';
  seats: number;
}

export interface TableLayout {
  id: string;
  name: string;
  positions: TablePosition[];
}

const DEFAULT_LAYOUT: TableLayout = {
  id: 'default',
  name: 'Main Dining Room',
  positions: [
    { tableNumber: 1, x: 50, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 2, x: 180, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 3, x: 310, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 4, x: 440, y: 50, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 5, x: 50, y: 180, width: 120, height: 80, shape: 'rectangle', seats: 6 },
    { tableNumber: 6, x: 220, y: 180, width: 120, height: 80, shape: 'rectangle', seats: 6 },
    { tableNumber: 7, x: 390, y: 180, width: 100, height: 100, shape: 'round', seats: 5 },
    { tableNumber: 8, x: 50, y: 310, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 9, x: 180, y: 310, width: 80, height: 80, shape: 'square', seats: 4 },
    { tableNumber: 10, x: 310, y: 310, width: 150, height: 80, shape: 'rectangle', seats: 8 },
  ],
};

export const getTableLayout = (): TableLayout => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  const saved = localStorage.getItem('restaurant_table_layout');
  return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
};

export const saveTableLayout = (layout: TableLayout) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('restaurant_table_layout', JSON.stringify(layout));
};