import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();

  const pokemonColl = client.db('pokemon').collection('pokemon');

  // 모든 포켓몬 조회
  const pokemons = await pokemonColl.find({}).toArray();
  return NextResponse.json({ ok: true, result: pokemons });
}
