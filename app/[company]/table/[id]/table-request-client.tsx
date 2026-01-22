'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPublicRequest, cancelPublicRequest } from '@/lib/actions/public-requests';
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
  X,
} from 'lucide-react';
import type { MenuItem } from '@/lib/types';

interface SentRequest {
  id: string;
  type: string;
  timestamp: number;
}

interface Props {
  tableNumber: number;
  requestTypes: string[];
  companySlug: string;
  hasMenu: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'Service': <Bell className="w-5 h-5" />,
  'Bill': <Receipt className="w-5 h-5" />,
  'Water': <Coffee className="w-5 h-5" />,
  'Menu': <UtensilsCrossed className="w-5 h-5" />,
};

export function TableRequestClient({ tableNumber, requestTypes, companySlug, hasMenu }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
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

    if (result.success && result.requestId) {
      setSentRequests(prev => [...prev, {
        id: result.requestId!,
        type: requestType,
        timestamp: Date.now(),
      }]);
      toast.success(`${requestType} request sent!`);
    } else {
      toast.error(result.error || 'Something went wrong');
    }
  };

  const handleCancel = async (requestId: string, requestType: string) => {
    setCanceling(requestId);

    const result = await cancelPublicRequest(requestId);

    setCanceling(null);

    if (result.success) {
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success(`${requestType} request canceled`);
    } else {
      toast.error(result.error || 'Failed to cancel');
    }
  };

  const getSentRequestsForType = (type: string) => {
    return sentRequests.filter(r => r.type === type);
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

  // No menu view - centered, larger request buttons
  if (!hasMenu) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'glass shadow-ive-lg !rounded-2xl !border-0',
            duration: 2000,
          }}
        />

        {/* Centered Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Table Badge */}
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-ive-lg mb-6">
            <span className="text-primary-foreground font-bold text-4xl">{tableNumber}</span>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Table {tableNumber}</h1>
          <p className="text-muted-foreground text-center mb-10">
            How can we help you today?
          </p>

          {/* Large Request Buttons */}
          <div className="w-full max-w-sm space-y-4">
            {requestTypes.map((type, index) => {
              const sentForType = getSentRequestsForType(type);
              return (
                <div
                  key={type}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {/* Send Request Button */}
                  <button
                    onClick={() => handleRequest(type)}
                    disabled={loading !== null || canceling !== null}
                    className={cn(
                      'w-full flex items-center justify-center gap-4 px-8 py-6 rounded-2xl text-lg font-semibold transition-ive',
                      'bg-secondary hover:bg-secondary/80 active:scale-[0.98] shadow-ive-sm hover:shadow-ive-md',
                      (loading === type || canceling !== null) && 'opacity-70'
                    )}
                  >
                    {loading === type ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <span className="text-primary">
                        {iconMap[type] ? (
                          <span className="[&>svg]:w-7 [&>svg]:h-7">{iconMap[type]}</span>
                        ) : (
                          <Bell className="w-7 h-7" />
                        )}
                      </span>
                    )}
                    {type}
                  </button>

                  {/* Sent Requests with Cancel */}
                  {sentForType.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {sentForType.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--status-success-muted)] border border-[var(--status-success)]/20 animate-in fade-in slide-in-from-top-2"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" />
                            <span className="text-[15px] font-medium text-[var(--status-success)]">
                              {type} request sent
                            </span>
                          </div>
                          <button
                            onClick={() => handleCancel(req.id, req.type)}
                            disabled={canceling === req.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                          >
                            {canceling === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer text */}
          <p className="text-caption text-center mt-12">
            A staff member will be with you shortly
          </p>
        </div>
      </div>
    );
  }

  // With menu view - existing layout
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
            {requestTypes.map((type) => {
              const sentForType = getSentRequestsForType(type);
              const hasSent = sentForType.length > 0;
              return (
                <button
                  key={type}
                  onClick={() => handleRequest(type)}
                  disabled={loading !== null || canceling !== null}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-ive',
                    'bg-secondary text-foreground hover:bg-secondary/80 active:scale-95',
                    (loading === type || canceling !== null) && 'opacity-70'
                  )}
                >
                  {loading === type ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-primary">
                      {iconMap[type] || <Bell className="w-4 h-4" />}
                    </span>
                  )}
                  {type}
                  {hasSent && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-[var(--status-success)] text-white text-[11px] font-bold flex items-center justify-center">
                      {sentForType.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sent Requests with Cancel */}
          {sentRequests.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--status-success-muted)] border border-[var(--status-success)]/20 whitespace-nowrap animate-in fade-in slide-in-from-top-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
                  <span className="text-[13px] font-medium text-[var(--status-success)]">
                    {req.type}
                  </span>
                  <button
                    onClick={() => handleCancel(req.id, req.type)}
                    disabled={canceling === req.id}
                    className="ml-1 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                  >
                    {canceling === req.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
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
