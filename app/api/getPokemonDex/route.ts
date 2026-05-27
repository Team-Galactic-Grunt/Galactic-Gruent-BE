import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();

  const dexColl = client.db('pokemon').collection('pokedex');

  const result = await dexColl.find({}).toArray();

  return NextResponse.json({
    ok: true,
    message: '포켓몬 박스 조회',
    data: result,
  });
}
