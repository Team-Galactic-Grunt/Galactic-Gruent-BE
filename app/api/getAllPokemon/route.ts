import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

export async function GET() {
  // getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');
  const pokemon = await pokemonColl.find({}).toArray();

  return NextResponse.json({ ok: true, result: pokemon });
}
