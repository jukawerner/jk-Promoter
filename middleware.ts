import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function middleware(request: NextRequest) {
  // Se tentar acessar /login, redireciona para /
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const userPhone = request.cookies.get('userPhone')?.value;
  
  if (!userPhone) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { data: userData, error } = await supabase
    .from('usuario')
    .select('tipo, id')
    .eq('telefone', userPhone)
    .single();

  if (error || !userData) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se estiver na área do promotor
  if (request.nextUrl.pathname.startsWith('/promotor')) {
    if (userData.tipo !== 'Promotor') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Se estiver na área administrativa
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (userData.tipo !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Se não for /admin/relatorios, verifica se é admin completo
    if (!request.nextUrl.pathname.startsWith('/admin/relatorios')) {
      const { data: marcas } = await supabase
        .from('promoter_marca')
        .select('marca_id')
        .eq('promoter_id', userData.id);

      // Se não tem marcas vinculadas, é admin completo
      if (!marcas || marcas.length === 0) {
        return NextResponse.next();
      }

      // Se tem marcas, verifica se tem todas
      const { data: totalMarcas } = await supabase
        .from('marca')
        .select('id', { count: 'exact' });

      const isFullAdmin = totalMarcas && marcas.length === totalMarcas.length;

      if (!isFullAdmin) {
        return NextResponse.redirect(new URL('/admin/relatorios', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configuração para quais rotas o middleware deve ser executado
export const config = {
  matcher: ['/login', '/admin/:path*', '/promotor/:path*'],
};
