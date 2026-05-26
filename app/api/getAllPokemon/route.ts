import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');

  const result = await pokemonColl.updateMany({}, [
    {
      $set: {
        'baseStats.attack': {
          $add: [
            '$baseStats.attack',
            { $getField: { field: 'special-attack', input: '$baseStats' } },
          ],
        },
        'baseStats.defense': {
          $add: [
            '$baseStats.defense',
            { $getField: { field: 'special-defense', input: '$baseStats' } },
          ],
        },
      },
    },
  ]);

  return NextResponse.json({ ok: true, result });
  // const pokemon = await pokemonColl.find({}).toArray();

  // return NextResponse.json({ ok: true, result: pokemon });
}
