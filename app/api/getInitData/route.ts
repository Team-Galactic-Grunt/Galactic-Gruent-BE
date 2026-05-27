import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const client = await getClientPromise();

  const pokemonColl = client.db('pokemon').collection('game_history');
  const skillsColl = client.db('pokemon').collection('skills');

  const result = await pokemonColl.find({}).toArray();

  return NextResponse.json({ ok: true, message: '초기 데이터 API', result });
}
