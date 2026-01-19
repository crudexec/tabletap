'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublicMenu } from '@/lib/actions/public-menu';
import { Plus, Minus, Leaf, Flame, Wheat, ImageIcon, Loader2 } from 'lucide-react';
import type { MenuCategoryWithItems, MenuItem } from '@/lib/types';

const DIETARY_ICONS: Record<string, { icon: typeof Leaf | null; color: string; label: string }> = {
  'vegan': { icon: Leaf, color: 'text-green-600', label: 'Vegan' },
  'vegetarian': { icon: Leaf, color: 'text-green-500', label: 'Vegetarian' },
  'gluten-free': { icon: Wheat, color: 'text-amber-600', label: 'Gluten Free' },
  'spicy': { icon: Flame, color: 'text-red-500', label: 'Spicy' },
  'dairy-free': { icon: null, color: 'text-blue-500', label: 'Dairy Free' },
  'nut-free': { icon: null, color: 'text-orange-500', label: 'Nut Free' },
};

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-[var(--card-solid)] border border-border shadow-ive-sm hover:shadow-ive-md transition-ive">
      {/* Image */}
      <div className="w-24 h-24 rounded-xl bg-secondary flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold leading-tight">{item.name}</h3>
            {item.description && (
              <p className="text-caption mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <span className="text-[17px] font-semibold font-mono flex-shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Dietary tags */}
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="flex gap-2 mt-2">
            {item.dietaryTags.map(tag => {
              const info = DIETARY_ICONS[tag];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <span
                  key={tag}
                  className={cn('flex items-center gap-1 text-[11px]', info.color)}
                  title={info.label}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {info.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Add/Remove controls */}
        <div className="flex items-center justify-end gap-2 mt-auto pt-2">
          {quantity > 0 ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={onRemove}
                className="w-9 h-9 rounded-xl"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-[17px] font-semibold w-6 text-center">{quantity}</span>
              <Button
                size="icon"
                onClick={onAdd}
                className="w-9 h-9 rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={onAdd} className="h-9 px-4 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MenuBrowserProps {
  cartItems: { menuItemId: string; quantity: number }[];
  onAddItem: (item: MenuItem) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export function MenuBrowser({ cartItems, onAddItem, onRemoveItem }: MenuBrowserProps) {
  const [categories, setCategories] = useState<MenuCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getPublicMenu();
        setCategories(data as MenuCategoryWithItems[]);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(ci => ci.menuItemId === itemId);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-caption">Loading menu</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary mb-4 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-subhead text-muted-foreground mb-1">Menu not available</p>
        <p className="text-caption">Please check back later</p>
      </div>
    );
  }

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'px-5 py-2.5 rounded-xl text-[14px] font-medium whitespace-nowrap transition-ive',
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-ive-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Category description */}
      {activeCategoryData?.description && (
        <p className="text-body text-muted-foreground">{activeCategoryData.description}</p>
      )}

      {/* Items grid */}
      <div className="space-y-3">
        {activeCategoryData?.items.map((item, index) => (
          <div
            key={item.id}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <MenuItemCard
              item={item}
              quantity={getItemQuantity(item.id)}
              onAdd={() => onAddItem(item)}
              onRemove={() => onRemoveItem(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
