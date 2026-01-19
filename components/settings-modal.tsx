'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings } from '@/lib/types';
import { X, Plus, QrCode, Volume2 } from 'lucide-react';
import { QRCodeGrid } from './qr-code-generator';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function SettingsModal({ open, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [newTable, setNewTable] = useState('');
  const [newRequestType, setNewRequestType] = useState('');
  const [activeSection, setActiveSection] = useState<'tables' | 'types' | 'notifications' | 'qr'>('tables');

  const addTable = () => {
    const tableNum = parseInt(newTable);
    if (!isNaN(tableNum) && !localSettings.tables.includes(tableNum)) {
      setLocalSettings({
        ...localSettings,
        tables: [...localSettings.tables, tableNum].sort((a, b) => a - b),
      });
      setNewTable('');
    }
  };

  const removeTable = (table: number) => {
    setLocalSettings({
      ...localSettings,
      tables: localSettings.tables.filter(t => t !== table),
    });
  };

  const addRequestType = () => {
    if (newRequestType && !localSettings.requestTypes.includes(newRequestType)) {
      setLocalSettings({
        ...localSettings,
        requestTypes: [...localSettings.requestTypes, newRequestType],
      });
      setNewRequestType('');
    }
  };

  const removeRequestType = (type: string) => {
    if (localSettings.requestTypes.length > 1) {
      setLocalSettings({
        ...localSettings,
        requestTypes: localSettings.requestTypes.filter(t => t !== type),
      });
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const sections = [
    { id: 'tables', label: 'Tables' },
    { id: 'types', label: 'Request Types' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'qr', label: 'QR Codes' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 rounded-3xl border-0 shadow-ive-xl overflow-hidden bg-[var(--card-solid)] max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-headline">Settings</DialogTitle>
        </div>

        <div className="flex min-h-[400px]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r border-border bg-secondary/30 p-3 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-left text-[14px] transition-ive',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Tables Section */}
            {activeSection === 'tables' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-subhead mb-1">Table Configuration</h3>
                  <p className="text-caption">Manage your restaurant tables</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {localSettings.tables.map((table) => (
                    <div
                      key={table}
                      className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl group"
                    >
                      <span className="text-[14px] font-medium">Table {table}</span>
                      <button
                        onClick={() => removeTable(table)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Table number"
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTable()}
                    className="h-11 rounded-xl border-border bg-secondary/50"
                  />
                  <Button
                    onClick={addTable}
                    className="h-11 px-4 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Request Types Section */}
            {activeSection === 'types' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-subhead mb-1">Request Types</h3>
                  <p className="text-caption">Define the types of service requests</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {localSettings.requestTypes.map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-xl group"
                    >
                      <span className="text-[14px] font-medium">{type}</span>
                      {localSettings.requestTypes.length > 1 && (
                        <button
                          onClick={() => removeRequestType(type)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-ive"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Request type name"
                    value={newRequestType}
                    onChange={(e) => setNewRequestType(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRequestType()}
                    className="h-11 rounded-xl border-border bg-secondary/50"
                  />
                  <Button
                    onClick={addRequestType}
                    className="h-11 px-4 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-subhead mb-1">Notifications</h3>
                  <p className="text-caption">Configure sound alerts</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div>
                      <p className="text-[15px] font-medium">Sound notifications</p>
                      <p className="text-caption">Play sound when new requests arrive</p>
                    </div>
                    <Switch
                      checked={localSettings.soundEnabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, soundEnabled: checked })
                      }
                    />
                  </div>

                  {localSettings.soundEnabled && (
                    <div className="p-4 rounded-xl bg-secondary/50 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[15px] font-medium">Volume</span>
                        <span className="ml-auto text-caption">
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
                        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-ive-sm [&::-webkit-slider-thumb]:transition-ive"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Codes Section */}
            {activeSection === 'qr' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-subhead mb-1 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Table QR Codes
                  </h3>
                  <p className="text-caption">Print QR codes for customer self-service</p>
                </div>

                <QRCodeGrid tables={localSettings.tables} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 px-5 rounded-xl"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
