'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';
import { X, Plus, QrCode, Volume2, ChevronLeft, Check, UtensilsCrossed, Clock, Users } from 'lucide-react';
import { QRCodeGrid } from '@/components/qr-code-generator';
import { MenuManagement } from '@/components/menu-management';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import type { Settings } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, update: updateSettings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [newTable, setNewTable] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('4');
  const [newRequestType, setNewRequestType] = useState('');
  const [activeSection, setActiveSection] = useState<'general' | 'tables' | 'types' | 'menu' | 'notifications' | 'qr'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings, loading]);

  useEffect(() => {
    if (settings && localSettings) {
      const changed = JSON.stringify(settings) !== JSON.stringify(localSettings);
      setHasChanges(changed);
    }
  }, [settings, localSettings]);

  const addTable = () => {
    if (!localSettings) return;
    const tableNum = parseInt(newTable);
    const seats = parseInt(newTableSeats) || 4;
    if (!isNaN(tableNum) && !localSettings.tables.includes(tableNum)) {
      setLocalSettings({
        ...localSettings,
        tables: [...localSettings.tables, tableNum].sort((a, b) => a - b),
        tableSeats: { ...localSettings.tableSeats, [tableNum]: seats },
      });
      setNewTable('');
      setNewTableSeats('4');
    }
  };

  const removeTable = (table: number) => {
    if (!localSettings) return;
    const { [table]: _, ...remainingSeats } = localSettings.tableSeats;
    setLocalSettings({
      ...localSettings,
      tables: localSettings.tables.filter(t => t !== table),
      tableSeats: remainingSeats,
    });
  };

  const updateTableSeats = (table: number, seats: number) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      tableSeats: { ...localSettings.tableSeats, [table]: seats },
    });
  };

  const addRequestType = () => {
    if (!localSettings) return;
    if (newRequestType && !localSettings.requestTypes.includes(newRequestType)) {
      setLocalSettings({
        ...localSettings,
        requestTypes: [...localSettings.requestTypes, newRequestType],
      });
      setNewRequestType('');
    }
  };

  const removeRequestType = (type: string) => {
    if (!localSettings) return;
    if (localSettings.requestTypes.length > 1) {
      setLocalSettings({
        ...localSettings,
        requestTypes: localSettings.requestTypes.filter(t => t !== type),
      });
    }
  };

  const handleSave = async () => {
    if (!localSettings) return;
    try {
      await updateSettings(localSettings);
      toast.success('Settings saved');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    }
  };

  const sections = [
    { id: 'general', label: 'General', description: 'Company name and URL' },
    { id: 'tables', label: 'Tables', description: 'Manage restaurant tables' },
    { id: 'types', label: 'Request Types', description: 'Define service request types' },
    { id: 'menu', label: 'Menu', description: 'Create and manage your menu' },
    { id: 'notifications', label: 'Notifications', description: 'Sound and alerts' },
    { id: 'qr', label: 'QR Codes', description: 'Table QR codes for customers' },
  ] as const;

  if (loading || !localSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-caption">Loading settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" toastOptions={{ className: 'glass shadow-ive-lg !rounded-2xl !border-0', duration: 2000 }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-ive"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-headline">Settings</h1>
                <p className="text-caption">Configure your TableSignal settings</p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className={cn(
                'h-10 px-5 rounded-xl transition-ive',
                hasChanges ? 'bg-primary' : 'bg-secondary text-muted-foreground'
              )}
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-56 flex-shrink-0">
            <div className="sticky top-28 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-left transition-ive',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  <div className={cn(
                    'text-[14px] font-medium',
                    activeSection !== section.id && 'text-foreground'
                  )}>
                    {section.label}
                  </div>
                  <div className={cn(
                    'text-[12px] mt-0.5',
                    activeSection === section.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {section.description}
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* General Section */}
            {activeSection === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2">Company Settings</h2>
                  <p className="text-body text-muted-foreground">
                    Configure your company URL slug for table QR codes.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-secondary/30 border border-border space-y-4">
                  <div>
                    <label className="text-footnote block mb-2">Company URL Slug</label>
                    <Input
                      type="text"
                      placeholder="your-company-name"
                      value={localSettings.companySlug}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companySlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })}
                      className="h-12 rounded-xl border-border bg-background max-w-md"
                    />
                    <p className="text-caption mt-2">
                      Your table URLs will be: tablesignal.co/<span className="text-primary font-medium">{localSettings.companySlug || 'your-slug'}</span>/table/1
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tables Section */}
            {activeSection === 'tables' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2">Table Configuration</h2>
                  <p className="text-body text-muted-foreground">
                    Add or remove tables and configure seating capacity.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                  {/* Existing Tables */}
                  <div className="space-y-3 mb-6">
                    {localSettings.tables.map((table) => (
                      <div
                        key={table}
                        className="flex items-center gap-4 bg-background px-4 py-3 rounded-xl border border-border group hover:border-border transition-ive"
                      >
                        <span className="text-[15px] font-medium min-w-[80px]">Table {table}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={localSettings.tableSeats[table] || 4}
                            onChange={(e) => updateTableSeats(table, parseInt(e.target.value) || 4)}
                            className="h-9 w-20 rounded-lg border-border bg-secondary/50 text-center"
                          />
                          <span className="text-[13px] text-muted-foreground">seats</span>
                        </div>
                        <button
                          onClick={() => removeTable(table)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {localSettings.tables.length === 0 && (
                      <p className="text-caption text-center py-4">No tables configured</p>
                    )}
                  </div>

                  {/* Add New Table */}
                  <div className="pt-4 border-t border-border">
                    <label className="text-footnote block mb-3">Add New Table</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Table number"
                        value={newTable}
                        onChange={(e) => setNewTable(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTable()}
                        className="h-12 rounded-xl border-border bg-background flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          placeholder="Seats"
                          value={newTableSeats}
                          onChange={(e) => setNewTableSeats(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addTable()}
                          className="h-12 w-20 rounded-xl border-border bg-background text-center"
                        />
                      </div>
                      <Button onClick={addTable} className="h-12 px-6 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Request Types Section */}
            {activeSection === 'types' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2">Request Types</h2>
                  <p className="text-body text-muted-foreground">
                    Define the types of service requests customers can make.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {localSettings.requestTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 bg-background px-4 py-2.5 rounded-xl border border-border group hover:border-destructive/30 transition-ive"
                      >
                        <span className="text-[15px] font-medium">{type}</span>
                        {localSettings.requestTypes.length > 1 && (
                          <button
                            onClick={() => removeRequestType(type)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="Request type name"
                      value={newRequestType}
                      onChange={(e) => setNewRequestType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRequestType()}
                      className="h-12 rounded-xl border-border bg-background"
                    />
                    <Button onClick={addRequestType} className="h-12 px-6 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Type
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Section */}
            {activeSection === 'menu' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2 flex items-center gap-3">
                    <UtensilsCrossed className="w-6 h-6" />
                    Menu Management
                  </h2>
                  <p className="text-body text-muted-foreground">
                    Create and organize your restaurant menu. Add categories and items with prices, images, and dietary information.
                  </p>
                </div>

                <MenuManagement />
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2">Notifications & Alerts</h2>
                  <p className="text-body text-muted-foreground">
                    Configure sound alerts and status thresholds for service requests.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[17px] font-medium">Sound notifications</p>
                        <p className="text-caption mt-1">Play a sound when new requests arrive</p>
                      </div>
                      <Switch
                        checked={localSettings.soundEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings({ ...localSettings, soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  {localSettings.soundEnabled && (
                    <div className="p-6 rounded-2xl bg-secondary/30 border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[17px] font-medium">Volume</span>
                        <span className="ml-auto text-[15px] text-muted-foreground font-mono">
                          {Math.round(localSettings.notificationVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={localSettings.notificationVolume}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            notificationVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-ive-md [&::-webkit-slider-thumb]:transition-ive [&::-webkit-slider-thumb]:hover:scale-110"
                      />
                    </div>
                  )}

                  {/* Alert Thresholds */}
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[17px] font-medium">Alert Thresholds</span>
                    </div>
                    <p className="text-caption mb-6">
                      Set when tables change status based on how long a request has been waiting.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--status-warning)]" />
                            <span className="text-[15px] font-medium">Warning</span>
                          </div>
                          <span className="text-[15px] text-muted-foreground font-mono">
                            {localSettings.warningThreshold} min
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={localSettings.warningThreshold}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              warningThreshold: parseInt(e.target.value),
                              criticalThreshold: Math.max(parseInt(e.target.value) + 1, localSettings.criticalThreshold),
                            })
                          }
                          className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--status-warning)] [&::-webkit-slider-thumb]:shadow-ive-md [&::-webkit-slider-thumb]:transition-ive [&::-webkit-slider-thumb]:hover:scale-110"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--status-critical)]" />
                            <span className="text-[15px] font-medium">Critical</span>
                          </div>
                          <span className="text-[15px] text-muted-foreground font-mono">
                            {localSettings.criticalThreshold} min
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="15"
                          step="1"
                          value={localSettings.criticalThreshold}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              criticalThreshold: parseInt(e.target.value),
                              warningThreshold: Math.min(parseInt(e.target.value) - 1, localSettings.warningThreshold),
                            })
                          }
                          className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--status-critical)] [&::-webkit-slider-thumb]:shadow-ive-md [&::-webkit-slider-thumb]:transition-ive [&::-webkit-slider-thumb]:hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Codes Section */}
            {activeSection === 'qr' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-title mb-2 flex items-center gap-3">
                    <QrCode className="w-6 h-6" />
                    Table QR Codes
                  </h2>
                  <p className="text-body text-muted-foreground">
                    Print these QR codes and place them on tables for customer self-service.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                  <QRCodeGrid tables={localSettings.tables} companySlug={localSettings.companySlug} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
