'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useMenu } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Loader2,
  GripVertical,
  Leaf,
  Flame,
  Wheat,
} from 'lucide-react';
import type { MenuCategory, MenuItem, MenuCategoryWithItems } from '@/lib/types';

const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'text-green-600' },
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'text-green-500' },
  { id: 'gluten-free', label: 'Gluten Free', icon: Wheat, color: 'text-amber-600' },
  { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-red-500' },
  { id: 'dairy-free', label: 'Dairy Free', icon: null, color: 'text-blue-500' },
  { id: 'nut-free', label: 'Nut Free', icon: null, color: 'text-orange-500' },
];

interface CategoryFormProps {
  category?: MenuCategory;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  onCancel: () => void;
}

function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      toast.success(category ? 'Category updated' : 'Category created');
    } catch {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-background border border-border space-y-4">
      <Input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-11 rounded-xl"
        autoFocus
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-11 rounded-xl"
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="h-10 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || loading} className="h-10 rounded-xl">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {category ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

interface MenuItemFormProps {
  categoryId: string;
  item?: MenuItem;
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    dietaryTags?: string[];
    isAvailable?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

function MenuItemForm({ categoryId, item, onSubmit, onCancel }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [dietaryTags, setDietaryTags] = useState<string[]>(item?.dietaryTags || []);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleDietaryTag = (tag: string) => {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        imageUrl: imageUrl || undefined,
        dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
        isAvailable,
      });
      toast.success(item ? 'Item updated' : 'Item created');
    } catch {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-background border border-border space-y-4">
      <div className="flex gap-4">
        {/* Image upload */}
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 transition-ive',
              'hover:border-primary hover:bg-primary/5',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add image</span>
              </>
            )}
          </button>
        </div>

        {/* Basic info */}
        <div className="flex-1 space-y-3">
          <Input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-xl"
            autoFocus
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-10 rounded-xl"
          />
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 rounded-xl pl-7"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Available</span>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </div>
        </div>
      </div>

      {/* Dietary tags */}
      <div>
        <p className="text-[13px] text-muted-foreground mb-2">Dietary info</p>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(option => {
            const isSelected = dietaryTags.includes(option.id);
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleDietaryTag(option.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-ive',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="h-10 rounded-xl">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || !price || loading}
          className="h-10 rounded-xl"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {item ? 'Update' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}

interface CategorySectionProps {
  category: MenuCategoryWithItems;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
}

function CategorySection({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl bg-secondary/30 border border-border overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-3 p-4 bg-secondary/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-background transition-ive"
        >
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold truncate">{category.name}</h3>
          {category.description && (
            <p className="text-caption truncate">{category.description}</p>
          )}
        </div>

        <span className="text-[13px] text-muted-foreground">
          {category.items.length} items
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditCategory}
            className="w-8 h-8 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteCategory}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Items list */}
      {expanded && (
        <div className="p-4 space-y-2">
          {category.items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border group hover:border-primary/30 transition-ive"
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium truncate">{item.name}</span>
                  {!item.isAvailable && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">
                      Unavailable
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-caption truncate">{item.description}</p>
                )}
                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.dietaryTags.map(tag => {
                      const option = DIETARY_OPTIONS.find(o => o.id === tag);
                      const Icon = option?.icon;
                      return (
                        <span
                          key={tag}
                          className={cn('text-[10px]', option?.color || 'text-muted-foreground')}
                          title={option?.label || tag}
                        >
                          {Icon ? <Icon className="w-3 h-3" /> : tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price */}
              <span className="text-[15px] font-semibold font-mono">
                ${item.price.toFixed(2)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-ive">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditItem(item)}
                  className="w-8 h-8 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteItem(item.id)}
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add item button */}
          <button
            onClick={onAddItem}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-ive"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[14px]">Add item</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function MenuManagement() {
  const { categories, loading, addCategory, editCategory, removeCategory, addMenuItem, editMenuItem, removeMenuItem } = useMenu();

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [addingItemToCategoryId, setAddingItemToCategoryId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryId: string; item: MenuItem } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category form */}
      {(showCategoryForm || editingCategory) && (
        <CategoryForm
          category={editingCategory ?? undefined}
          onSubmit={async (data) => {
            if (editingCategory) {
              await editCategory(editingCategory.id, data);
            } else {
              await addCategory(data);
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Add item form */}
      {addingItemToCategoryId && (
        <MenuItemForm
          categoryId={addingItemToCategoryId}
          onSubmit={async (data) => {
            await addMenuItem({ ...data, categoryId: addingItemToCategoryId });
            setAddingItemToCategoryId(null);
          }}
          onCancel={() => setAddingItemToCategoryId(null)}
        />
      )}

      {/* Edit item form */}
      {editingItem && (
        <MenuItemForm
          categoryId={editingItem.categoryId}
          item={editingItem.item}
          onSubmit={async (data) => {
            await editMenuItem(editingItem.item.id, data);
            setEditingItem(null);
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Categories list */}
      {categories.length === 0 && !showCategoryForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary mb-4 flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-subhead text-muted-foreground mb-1">No menu categories</p>
          <p className="text-caption mb-4">Create your first category to get started</p>
          <Button onClick={() => setShowCategoryForm(true)} className="h-10 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        <>
          {categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              onEditCategory={() => setEditingCategory(category)}
              onDeleteCategory={async () => {
                if (confirm(`Delete "${category.name}" and all its items?`)) {
                  await removeCategory(category.id);
                  toast.success('Category deleted');
                }
              }}
              onAddItem={() => setAddingItemToCategoryId(category.id)}
              onEditItem={(item) => setEditingItem({ categoryId: category.id, item })}
              onDeleteItem={async (id) => {
                if (confirm('Delete this item?')) {
                  await removeMenuItem(id);
                  toast.success('Item deleted');
                }
              }}
            />
          ))}

          {/* Add category button */}
          {!showCategoryForm && !editingCategory && (
            <button
              onClick={() => setShowCategoryForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-ive"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[15px] font-medium">Add Category</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
