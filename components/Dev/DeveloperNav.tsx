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
    <nav className="w-full bg-slate-100 border-b border-slate-200 mb-4">
      <div className="max-w-5xl mx-auto flex gap-2 px-4 py-2">
        {navLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-100'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 