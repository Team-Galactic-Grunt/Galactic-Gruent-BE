import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const client = await getClientPromise();

  const db = client.db('pokemon');

  const pokemonColl = db.collection('pokemon');
  const result = await pokemonColl.updateMany(
    {},
    {
      $set: {
        habitat: null,
      },
    },
  );

  // const historyResult = await historyColl.updateMany({}, [
  //   {
  //     $set: {
  //       bag: '$bag.bag',
  //     },
  //   },
  // ]);

  return NextResponse.json({
    ok: true,
    message: 'habitat 필드 넣기 성공',
    data: result,
  });
}
