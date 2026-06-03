import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClientPromise();

  const historyColl = client.db('pokemon').collection('game_history');
  const pokedexColl = client.db('pokemon').collection('pokedex');

  const pokedex = await pokedexColl
    .find({}, { projection: { _id: 0 } })
    .sort({ sinnohNo: 1 })
    .toArray();

  const result = await historyColl.findOne({}, { projection: { _id: 0 } });
  console.log('history result: ', result?.bag);

  return NextResponse.json({
    ok: true,
    message: '초기 데이터 API',
    result: {
      ...result,
      pokedex,
    },
  });
}
