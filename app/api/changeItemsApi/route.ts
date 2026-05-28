import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  // const body = await req.json();
  // const { bag } = body;

  // console.log(`bag: ${JSON.stringify(bag)}`);

  const client = await getClientPromise();
  const db = client.db('pokemon');
  const historyColl = db.collection('game_history');

  const result = await historyColl.findOne(
    {},
    {
      projection: {
        _id: 0,
        bag: 1,
      },
    },
  );

  if (result) {
    return NextResponse.json({
      ok: true,
      message: '가방 조회 성공',
      data: result,
    });
  }

  return NextResponse.json({
    ok: false,
    message: '가방 조회 실패',
  });
}

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
