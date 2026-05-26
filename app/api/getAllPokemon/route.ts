import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');

  const result = await pokemonColl.updateMany(
    {},
    {
      $unset: {
        'baseStats.special-attack': '',
        'baseStats.special-defense': '',
      },
    },
  );

  return NextResponse.json({ ok: true, result });
  // const pokemon = await pokemonColl.find({}).toArray();

  // return NextResponse.json({ ok: true, result: pokemon });
}
