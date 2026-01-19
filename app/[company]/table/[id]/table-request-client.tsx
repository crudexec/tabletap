'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPublicRequest } from '@/lib/actions/public-requests';
import { MenuBrowser } from '@/components/menu-browser';
import { CartDrawer } from '@/components/cart-drawer';
import { useCart } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Loader2,
  Bell,
  Receipt,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
} from 'lucide-react';
import type { MenuItem } from '@/lib/types';

interface Props {
  tableNumber: number;
  requestTypes: string[];
  companySlug: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'Service': <Bell className="w-5 h-5" />,
  'Bill': <Receipt className="w-5 h-5" />,
  'Water': <Coffee className="w-5 h-5" />,
  'Menu': <UtensilsCrossed className="w-5 h-5" />,
};

export function TableRequestClient({ tableNumber, requestTypes, companySlug }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const {
    items: cartItems,
    totalItems,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
  } = useCart(tableNumber);

  const handleRequest = async (requestType: string) => {
    setLoading(requestType);

    const result = await createPublicRequest(companySlug, tableNumber, requestType);

    setLoading(null);

    if (result.success) {
      setSuccess(requestType);
      toast.success(`${requestType} request sent!`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      toast.error(result.error || 'Something went wrong');
    }
  };

  const handleAddItem = (item: MenuItem) => {
    addItem(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveItem = (menuItemId: string) => {
    const item = cartItems.find(ci => ci.menuItemId === menuItemId);
    if (item && item.quantity > 1) {
      updateQuantity(menuItemId, item.quantity - 1);
    } else {
      removeItem(menuItemId);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'glass shadow-ive-lg !rounded-2xl !border-0',
          duration: 2000,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-ive-sm">
                <span className="text-primary-foreground font-bold text-xl">{tableNumber}</span>
              </div>
              <div>
                <h1 className="text-subhead">Table {tableNumber}</h1>
                <p className="text-caption">Welcome! Browse our menu below</p>
              </div>
            </div>

            {/* Cart button */}
            <Button
              onClick={() => setCartOpen(true)}
              variant="outline"
              className="relative h-11 px-4 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Actions Bar - Call Staff */}
      <div className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {requestTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleRequest(type)}
                disabled={loading !== null}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-ive',
                  success === type
                    ? 'bg-[var(--status-success)] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80 active:scale-95',
                  loading === type && 'opacity-70'
                )}
              >
                {loading === type ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : success === type ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-primary">
                    {iconMap[type] || <Bell className="w-4 h-4" />}
                  </span>
                )}
                {success === type ? 'Sent!' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <MenuBrowser
          cartItems={cartItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full h-14 rounded-2xl shadow-ive-xl text-[15px]"
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            View Cart ({totalItems}) · ${totalAmount.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        tableNumber={tableNumber}
        totalAmount={totalAmount}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onUpdateNotes={updateNotes}
        onClearCart={clearCart}
      />
    </div>
  );
}
