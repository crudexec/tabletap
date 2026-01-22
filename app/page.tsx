'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { RequestCard } from '@/components/request-card';
import { NewRequestModal } from '@/components/new-request-modal';
import { InsightsDrawer } from '@/components/insights-drawer';
import { HistoryDrawer } from '@/components/history-drawer';
import { useRequests } from '@/hooks/use-requests';
import { useSettings } from '@/hooks/use-settings';
import { useSound } from '@/hooks/use-sound';
import { Plus, BarChart3, Settings as SettingsIcon, History, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { TableLayoutView } from '@/components/table-layout-view';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const { activeRequests, completedRequests, create, complete, remove, loading: requestsLoading } = useRequests();
  const { settings, loading: settingsLoading } = useSettings();

  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [selectedTableForRequest, setSelectedTableForRequest] = useState<number | null>(null);
  const [insightsDrawerOpen, setInsightsDrawerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  const { playNotification } = useSound();

  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, number> = {};
      activeRequests.forEach(request => {
        if (!request.createdAt) return;
        const createdAt = request.createdAt instanceof Date
          ? request.createdAt
          : new Date(request.createdAt);
        times[request.id] = Math.floor((Date.now() - createdAt.getTime()) / 1000);
      });
      setElapsedTimes(times);
    }, 100);

    return () => clearInterval(interval);
  }, [activeRequests]);

  const handleCreateRequest = async (tableNumber: number, requestType: string) => {
    try {
      await create(tableNumber, requestType);
      if (settings.soundEnabled) {
        playNotification(settings.notificationVolume);
      }
      toast.success(`Table ${tableNumber} · ${requestType}`);
    } catch (error) {
      toast.error('Failed to create request');
      console.error(error);
    }
  };

  const handleCompleteRequest = async (id: string) => {
    const request = activeRequests.find(r => r.id === id);
    if (!request || !request.createdAt) return;

    const createdAt = request.createdAt instanceof Date
      ? request.createdAt
      : new Date(request.createdAt);
    const elapsedTime = Math.floor((Date.now() - createdAt.getTime()) / 1000);

    try {
      await complete(id, elapsedTime);
      const mins = Math.floor(elapsedTime / 60);
      const secs = elapsedTime % 60;
      toast.success(`Completed in ${mins}:${secs.toString().padStart(2, '0')}`);
    } catch (error) {
      toast.error('Failed to complete request');
      console.error(error);
    }
  };

  const handleClearRequest = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      toast.error('Failed to clear request');
      console.error(error);
    }
  };

  const handleClearAllRequests = async () => {
    try {
      await Promise.all(activeRequests.map(r => remove(r.id)));
      toast.success('All requests cleared');
    } catch (error) {
      toast.error('Failed to clear all requests');
      console.error(error);
    }
  };

  const handleDeleteHistoryRequest = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      toast.error('Failed to delete request');
      console.error(error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await Promise.all(completedRequests.map(r => remove(r.id)));
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
      console.error(error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const formattedActiveRequests = activeRequests.map(r => ({
    id: r.id,
    tableNumber: r.tableNumber,
    requestType: r.requestType,
    status: r.status as 'active' | 'completed',
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    completedAt: r.completedAt instanceof Date ? r.completedAt.toISOString() : r.completedAt ? String(r.completedAt) : undefined,
    elapsedTime: r.elapsedTime ?? undefined,
  }));

  const formattedCompletedRequests = completedRequests.map(r => ({
    id: r.id,
    tableNumber: r.tableNumber,
    requestType: r.requestType,
    status: r.status as 'active' | 'completed',
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    completedAt: r.completedAt instanceof Date ? r.completedAt.toISOString() : r.completedAt ? String(r.completedAt) : undefined,
    elapsedTime: r.elapsedTime ?? undefined,
  }));

  const existingRequests = activeRequests.map(r => ({
    tableNumber: r.tableNumber,
    requestType: r.requestType,
  }));

  const handleTableClick = (tableNumber: number) => {
    setSelectedTableForRequest(tableNumber);
    setNewRequestModalOpen(true);
  };

  const handleNewRequestFromButton = () => {
    setSelectedTableForRequest(null);
    setNewRequestModalOpen(true);
  };

  const handleCloseNewRequestModal = () => {
    setNewRequestModalOpen(false);
    setSelectedTableForRequest(null);
  };

  if (requestsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-caption">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'glass shadow-ive-lg !rounded-2xl !border-0',
          duration: 2000,
        }}
      />

      {/* Navigation - Minimal, floating glass bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl shadow-ive-lg px-6 py-3 flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-ive-sm">
                <span className="text-primary-foreground font-semibold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-subhead">TableSignal</h1>
                {session?.user?.email && (
                  <p className="text-caption text-[11px]">{session.user.email}</p>
                )}
              </div>
            </div>

            {/* Actions - Icon-only for minimal aesthetic */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handleNewRequestFromButton}
                size="icon"
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 shadow-ive-sm transition-ive"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setHistoryDrawerOpen(true)}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-ive"
              >
                <History className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button
                onClick={() => setInsightsDrawerOpen(true)}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-ive"
              >
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button
                onClick={() => router.push('/settings')}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-ive"
              >
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              </Button>

              <div className="w-px h-6 bg-border mx-2" />

              <ThemeToggle />

              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-ive"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Floor Layout */}
          <section>
            <TableLayoutView
              activeRequests={formattedActiveRequests}
              onTableClick={handleTableClick}
              tables={settings.tables}
              tableSeats={settings.tableSeats}
              warningThreshold={settings.warningThreshold}
              criticalThreshold={settings.criticalThreshold}
            />
          </section>

          {/* Active Requests */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-headline">Active</h2>
                {activeRequests.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] font-medium">
                    {activeRequests.length}
                  </span>
                )}
              </div>

              {activeRequests.length > 0 && (
                <Button
                  onClick={handleClearAllRequests}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive transition-ive text-[13px]"
                >
                  Clear all
                </Button>
              )}
            </div>

            {activeRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-subhead text-muted-foreground mb-1">No active requests</p>
                <p className="text-caption">Tap a table or press + to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {formattedActiveRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <RequestCard
                      request={request}
                      onComplete={handleCompleteRequest}
                      onClear={handleClearRequest}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals & Drawers */}
      <NewRequestModal
        open={newRequestModalOpen}
        onClose={handleCloseNewRequestModal}
        onSubmit={handleCreateRequest}
        settings={settings}
        existingRequests={existingRequests}
        initialTable={selectedTableForRequest}
      />

      <InsightsDrawer
        open={insightsDrawerOpen}
        onClose={() => setInsightsDrawerOpen(false)}
        completedRequests={formattedCompletedRequests}
      />

      <HistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        completedRequests={formattedCompletedRequests}
        onDeleteRequest={handleDeleteHistoryRequest}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
