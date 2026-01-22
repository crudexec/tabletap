'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Clock,
  BarChart3,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Animated table component for the hero section
function AnimatedFloorPlan() {
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; table: number; type: string }[]>([]);

  const tables = [
    { id: 1, x: 15, y: 20, size: 'small' },
    { id: 2, x: 45, y: 15, size: 'large' },
    { id: 3, x: 75, y: 25, size: 'medium' },
    { id: 4, x: 20, y: 55, size: 'medium' },
    { id: 5, x: 50, y: 50, size: 'large' },
    { id: 6, x: 80, y: 60, size: 'small' },
    { id: 7, x: 35, y: 80, size: 'small' },
    { id: 8, x: 65, y: 85, size: 'medium' },
  ];

  const requestTypes = ['Water', 'Menu', 'Bill', 'Assistance'];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTable = tables[Math.floor(Math.random() * tables.length)];
      const randomType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
      const newNotification = {
        id: Date.now(),
        table: randomTable.id,
        type: randomType,
      };

      setActiveTable(randomTable.id);
      setNotifications(prev => [...prev.slice(-2), newNotification]);

      setTimeout(() => setActiveTable(null), 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 rounded-3xl" />

      {/* Floor plan grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Tables */}
      {tables.map((table) => (
        <div
          key={table.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
            activeTable === table.id ? 'scale-110' : 'scale-100'
          }`}
          style={{ left: `${table.x}%`, top: `${table.y}%` }}
        >
          <div
            className={`relative rounded-xl border-2 flex items-center justify-center font-semibold transition-all duration-500 ${
              table.size === 'small' ? 'w-12 h-12 text-sm' :
              table.size === 'medium' ? 'w-16 h-16 text-base' :
              'w-20 h-20 text-lg'
            } ${
              activeTable === table.id
                ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/50'
                : 'bg-stone-800/80 border-stone-600 text-stone-300'
            }`}
          >
            {table.id}
            {activeTable === table.id && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Floating notifications */}
      <div className="absolute top-4 right-4 space-y-2">
        {notifications.slice(-3).map((notif, index) => (
          <div
            key={notif.id}
            className="animate-in slide-in-from-right-5 fade-in duration-300 bg-stone-800/90 backdrop-blur-sm border border-stone-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="text-stone-300">
              Table {notif.table}: <span className="text-amber-400 font-medium">{notif.type}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group relative bg-gradient-to-b from-stone-800/50 to-stone-900/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold text-stone-100 mb-2 font-display">{title}</h3>
        <p className="text-stone-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Stats component
function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <div
      className="text-center animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-display">
        {value}
      </div>
      <div className="text-stone-400 mt-1 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 overflow-hidden">
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-stone-800/50 backdrop-blur-md bg-stone-950/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight font-display">TableSignal</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-stone-300 hover:text-white hover:bg-stone-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/25">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className={`space-y-8 ${mounted ? 'animate-in fade-in slide-in-from-left-8 duration-700' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm text-amber-400">
                <Sparkles className="w-4 h-4" />
                Real-time restaurant management
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight font-display">
                <span className="block text-stone-100">Orchestrate</span>
                <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Every Request
                </span>
                <span className="block text-stone-100">Seamlessly</span>
              </h1>

              <p className="text-xl text-stone-400 leading-relaxed max-w-lg">
                Transform your restaurant service with intelligent request tracking.
                From table to kitchen—every request flows smoothly, ensuring guests
                never wait too long.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-xl shadow-amber-500/30 text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-700 hover:bg-stone-800 hover:border-stone-600 text-stone-300 text-lg px-8 py-6">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Animated Floor Plan */}
            <div className={`relative ${mounted ? 'animate-in fade-in slide-in-from-right-8 duration-700 delay-200' : 'opacity-0'}`}>
              <div className="relative bg-stone-900/50 backdrop-blur-sm border border-stone-800 rounded-3xl p-6 shadow-2xl">
                <AnimatedFloorPlan />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-500/30 to-transparent rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6 border-y border-stone-800/50 bg-stone-900/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="< 30s" label="Avg Response Time" delay={100} />
            <StatItem value="98%" label="Requests Fulfilled" delay={200} />
            <StatItem value="500+" label="Restaurants" delay={300} />
            <StatItem value="4.9★" label="Customer Rating" delay={400} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">
              Purpose-built tools that help your team deliver exceptional service, every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Bell}
              title="Instant Notifications"
              description="Get alerted the moment a guest needs attention. Smart prioritization ensures critical requests are handled first."
              delay={100}
            />
            <FeatureCard
              icon={Clock}
              title="Time Tracking"
              description="Monitor response times in real-time. Identify bottlenecks and optimize your service workflow automatically."
              delay={200}
            />
            <FeatureCard
              icon={BarChart3}
              title="Actionable Insights"
              description="Comprehensive analytics reveal patterns in your service. Make data-driven decisions to improve guest satisfaction."
              delay={300}
            />
            <FeatureCard
              icon={Users}
              title="Table Management"
              description="Visual floor plan shows every table at a glance. Assign sections and balance workloads effortlessly."
              delay={400}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Sub-second updates keep everyone in sync. No refresh needed—changes appear instantly across all devices."
              delay={500}
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Complete History"
              description="Every request logged and searchable. Review past service, resolve disputes, and train staff effectively."
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-b from-stone-800/50 to-stone-900/50 backdrop-blur-sm border border-stone-700/50 rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/20 rounded-full blur-[80px]" />
            </div>

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display mb-6">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Service?
                </span>
              </h2>
              <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto">
                Join hundreds of restaurants already delivering faster, better service.
                Start your free trial today—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-xl shadow-amber-500/30 text-lg px-10 py-6">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-600 hover:bg-stone-800 hover:border-stone-500 text-stone-300 text-lg px-10 py-6">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold font-display">TableSignal</span>
            </div>
            <div className="text-stone-500 text-sm">
              © {new Date().getFullYear()} TableSignal. Built for restaurants that care.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
