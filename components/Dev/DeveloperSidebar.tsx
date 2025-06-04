'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  Rabbit,
  Workflow,
  ListTree,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const links = [
  { href: '/developer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/developer/scenes', label: 'Scene\nManager', icon: Image },
  { href: '/developer/actions', label: 'Action Manager', icon: Rabbit },
  { href: '/developer/visualizer', label: 'Storyline Visualizer', icon: Workflow },
  { href: '/developer/threader', label: 'Story Threader', icon: ListTree },
  { href: '/developer/import', label: 'Bulk Import/Export', icon: UploadCloud },
];

export default function DeveloperSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`sticky top-0 h-screen p-4 border-r border-slate-200 bg-slate-100 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-56'
      }`}
    >
      <button
        className="mb-6 flex items-center justify-center w-8 h-8 rounded hover:bg-slate-200 transition self-end"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-200 font-medium transition-colors group ${
                    active ? 'bg-blue-200 text-blue-900' : 'text-slate-800'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon size={22} className={active ? 'text-blue-700' : 'text-slate-500'} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 