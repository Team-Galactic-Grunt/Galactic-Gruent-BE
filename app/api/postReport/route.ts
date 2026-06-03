import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { position, bag, isMyPokemon, pokemonBox, pokedex } = body;

  console.log(pokedex);

  if (!position || !bag || !isMyPokemon || !pokemonBox || !pokedex) {
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
  const pokedexColl = db.collection('pokedex');

  const historyResult = await historyColl.updateOne(
    {},
    { $set: body },
    { upsert: true },
  );

  const pokedexResult = await pokedexColl.bulkWrite(
    pokedex.map((entry: { id: number }) => ({
      updateOne: {
        filter: { id: entry.id },
        update: { $set: entry },
        upsert: true,
      },
    })),
  );

  if (historyResult.acknowledged && pokedexResult.isOk()) {
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
