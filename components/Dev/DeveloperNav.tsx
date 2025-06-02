'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/developer', label: 'Dashboard' },
  { href: '/developer/scenes', label: 'Scene Manager' },
  { href: '/developer/actions', label: 'Action Manager' },
  { href: '/developer/visualizer', label: 'Storyline Visualizer' },
  { href: '/developer/cute-animals/story-threader', label: 'Story Threader' },
];


export default function DeveloperNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full bg-slate-100 border-b border-slate-200 shadow-sm">
      <div className="flex justify-center gap-4 px-4 py-3">
        {navLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-5 py-2 rounded font-bold text-base transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-100'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 