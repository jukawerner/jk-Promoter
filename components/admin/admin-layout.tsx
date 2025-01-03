"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isFullAdmin, isLoading } = useUserPermissions();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Se não é admin completo e está tentando acessar outras páginas além de /admin/relatorios
      if (!isFullAdmin && pathname !== '/admin/relatorios') {
        router.push('/admin/relatorios');
      }
    }
  }, [isFullAdmin, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return <>{children}</>;
}
