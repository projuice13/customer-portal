import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
