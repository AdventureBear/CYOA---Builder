import DeveloperNav from '@/components/Dev/DeveloperNav';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 shadow z-20">
      {/* <div className="w-full bg-white pb-3 shadow z-20"> */}
        <DeveloperNav />
      {/* </div> */}
      {children}
    </div>
  );
} 