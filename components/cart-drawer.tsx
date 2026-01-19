'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createOrder } from '@/lib/actions/orders';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ImageIcon,
  Loader2,
  Check,
  MessageSquare,
} from 'lucide-react';
import type { CartItem } from '@/lib/types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: number;
  totalAmount: number;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onUpdateNotes: (menuItemId: string, notes: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  onClose,
  items,
  tableNumber,
  totalAmount,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
}: CartDrawerProps) {
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editingNotesFor, setEditingNotesFor] = useState<string | null>(null);

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      await createOrder({
        tableNumber,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes: orderNotes || undefined,
      });

      setSubmitted(true);
      onClearCart();
      setOrderNotes('');

      // Show success briefly then close
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      toast.error('Failed to submit order');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[450px] p-0 border-0 shadow-ive-xl bg-[var(--card-solid)]">
          <SheetTitle className="sr-only">Order Confirmation</SheetTitle>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-[var(--status-success-muted)] flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 text-[var(--status-success)]" />
            </div>
            <h2 className="text-headline mb-2">Order Placed!</h2>
            <p className="text-body text-muted-foreground text-center">
              Your order has been sent to the kitchen.<br />
              We'll bring it to your table soon.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[450px] p-0 border-0 shadow-ive-xl bg-[var(--card-solid)] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-headline">Your Order</SheetTitle>
              <p className="text-caption mt-1">Table {tableNumber}</p>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                Clear cart
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-subhead text-muted-foreground mb-1">Your cart is empty</p>
              <p className="text-caption">Add items from the menu to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.menuItemId}
                  className={cn(
                    'p-4 rounded-2xl bg-secondary/50 animate-in fade-in slide-in-from-right-2'
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0 overflow-hidden">
                      {item.menuItem.imageUrl ? (
                        <img
                          src={item.menuItem.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-medium truncate">
                          {item.menuItem.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.menuItemId)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              onUpdateQuantity(item.menuItemId, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-[14px] font-medium w-5 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              onUpdateQuantity(item.menuItemId, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <span className="text-[15px] font-semibold font-mono">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Notes */}
                      {editingNotesFor === item.menuItemId ? (
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Special instructions..."
                            value={item.notes || ''}
                            onChange={(e) => onUpdateNotes(item.menuItemId, e.target.value)}
                            className="h-8 text-[13px] rounded-lg"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNotesFor(null)}
                            className="h-8 px-2 rounded-lg"
                          >
                            Done
                          </Button>
                        </div>
                      ) : item.notes ? (
                        <button
                          onClick={() => setEditingNotesFor(item.menuItemId)}
                          className="mt-2 text-[12px] text-muted-foreground hover:text-foreground transition-ive"
                        >
                          Note: {item.notes}
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingNotesFor(item.menuItemId)}
                          className="mt-2 flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-ive"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Add note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-secondary/30 flex-shrink-0 space-y-4">
            {/* Order notes */}
            <Input
              placeholder="Add a note to your order (optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="h-11 rounded-xl"
            />

            {/* Total and submit */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption">Total</p>
                <p className="text-[24px] font-semibold font-mono">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="h-12 px-8 rounded-xl text-[15px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
