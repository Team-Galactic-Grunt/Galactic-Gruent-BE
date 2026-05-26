import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 레벨 받아오기
  // getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');
  const pokemon = await pokemonColl
    .find(
      { id: 396 },
      {
        projection: {
          lv1: 1,
          backSprite: 1,
          frontSprite: 1,
          catchRate: 1,
          backShinySprite: 1,
          statGrowth: 1,
        },
      },
    )
    .toArray();
  console.log(pokemon);

  return NextResponse.json({ ok: true, result: pokemon });
}
