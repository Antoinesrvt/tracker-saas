'use client';

import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(94,168,223,0.2),rgba(255,255,255,0))]" />
      <div className="relative z-10">
        <SideNav />
        <div className="pl-64">
          <TopBar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </div>
  );
}