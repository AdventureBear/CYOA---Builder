import DeveloperSidebar from './DeveloperSidebar';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DeveloperSidebar />
      <main className="flex-1 p-8 overflow-x-auto">
        {children}
      </main>
    </div>
  );
} 