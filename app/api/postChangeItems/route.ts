import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const body = await req.json();
  const { bag } = body;

  console.log(`bag: ${JSON.stringify(bag)}`);

  const client = await getClientPromise();
  const db = client.db('pokemon');
  const historyColl = db.collection('game_history');

  const result = await historyColl.updateOne(
    {},
    {
      $set: bag,
    },
    { upsert: true },
  );

  if (result.acknowledged) {
    return NextResponse.json({
      ok: true,
      message: '갯수 반영 성공',
    });
  }

  return NextResponse.json({
    ok: false,
    message: '갯수 반영 실패',
  });
}
