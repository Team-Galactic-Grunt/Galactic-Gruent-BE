import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';



export async function POST(req: Request) {
  const body = await req.json();
  const { position, bag, isMyPokemon, pokemonBox } = body;

  if (!position || !bag || !isMyPokemon || !pokemonBox) {
    return NextResponse.json(
      {
        ok: false,
        message: '신고 내용이 없습니다.',
      },
      {
        status: 400,
      },
    );
  }

  const client = await getClientPromise();
  const db = client.db('pokemon');
  const historyColl = db.collection('game_history');

  const result = await historyColl.updateOne(
    {},
    {
      $set: body,
    },
    { upsert: true },
  );

  if (result.acknowledged) {
    return NextResponse.json({
      ok: true,
      message: '레포트 성공',
    });
  }

  return NextResponse.json({
    ok: false,
    message: '레포트 실패',
  });
}
