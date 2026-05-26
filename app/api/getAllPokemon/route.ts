import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');
  const pokemon = await pokemonColl.find({}).toArray();

  return NextResponse.json({ ok: true, result: pokemon });
}
