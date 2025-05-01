import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types_db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient();

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Row ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deport')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting row:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Row deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}