"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { cn } from '@/lib/utils';

export function AdminNavbar() {
  const { isFullAdmin, isLoading } = useUserPermissions();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin/relatorios',
      label: 'Relatórios',
      showAlways: true
    },
    {
      href: '/admin/cadastros/promotores',
      label: 'Promotores',
      showAlways: false
    },
    {
      href: '/admin/cadastros/clientes',
      label: 'Clientes',
      showAlways: false
    },
    {
      href: '/admin/cadastros/produtos',
      label: 'Produtos',
      showAlways: false
    },
    {
      href: '/admin/cadastros/marcas',
      label: 'Marcas',
      showAlways: false
    }
  ];

  if (isLoading) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            // Só mostra o item se for showAlways ou se o usuário for admin completo
            if (!item.showAlways && !isFullAdmin) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-4 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "border-b-2 border-rose-500 text-rose-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
