import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 레벨 받아오기
  // const avgLevel = Number(searchParams.get('avgLevel') ?? 50);
  // getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.
  const client = await getClientPromise();
  const pokemonColl = client.db('pokemon').collection('pokemon');
  const pokemon = await pokemonColl
    .find(
      { id: 396 },
      {
        projection: {
          lv1Stats: 1,
          backSprite: 1,
          frontSprite: 1,
          catchRate: 1,
          backShinySprite: 1,
          statGrowth: 1,
          move: 1,
        },
      },
    )
    .toArray();
  console.log(pokemon);

  const avgLevel = 50;
  // 레벨링 로직
  const minLevel = Math.max(1, avgLevel - 5);
  const maxLevel = avgLevel + 5;
  const enemyLevel =
    Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

  const emeny = {
    id: 396,
    lv: enemyLevel,
    move: pokemon[0].moves.sort(() => Math.random() - 0.5).slice(0, 4),
    state: {
      hp: pokemon[0].lv1Stats.hp + pokemon[0].statGrowth.hp * enemyLevel,
      atk: pokemon[0].lv1Stats.atk + pokemon[0].statGrowth.atk * enemyLevel,
      def: pokemon[0].lv1Stats.def + pokemon[0].statGrowth.def * enemyLevel,
      spd: pokemon[0].lv1Stats.spd + pokemon[0].statGrowth.spd * enemyLevel,
      catchRate: pokemon[0].catchRate,
    },
  };

  return NextResponse.json({ ok: true, result: emeny });
}
