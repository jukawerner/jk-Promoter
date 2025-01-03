import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('marcas')
    .select('id, nome')
    .order('nome', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
