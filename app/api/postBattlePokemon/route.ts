import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 레벨 받아오기
  // const avgLevel = Number(searchParams.get('avgLevel') ?? 50);
  // getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.
  const client = await getClientPromise();

  const db = client.db('pokemon');

  const pokemonColl = db.collection('pokemon');

  const skillsColl = db.collection('skills');

  // 포켓몬 조회
  const pokemon = await pokemonColl.findOne(
    { id: 396 },
    {
      projection: {
        name: 1,
        catchRate: 1,
        lv1Stats: 1,
        frontSprite: 1,
        cryUrl: 1,
        statGrowth: 1,
        moves: 1,
        id: 1,
        types: 1,
      },
    },
  );

  if (!pokemon) {
    return NextResponse.json(
      {
        ok: false,
        message: '포켓몬 없음',
      },
      {
        status: 404,
      },
    );
  }

  // 기술 랜덤 4개
  const selectedMoves = pokemon.moves
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  // skills collection에서 기술 상세 조회
  const moveData = await skillsColl
    .find(
      {
        koName: {
          $in: selectedMoves,
        },
      },
      {
        projection: {
          _id: 0,
          koName: 1,
          type: 1,
          accuracy: 1,
          power: 1,
          priority: 1,
          statChanges: 1,
        },
      },
    )
    .toArray();

  console.log('pokemon : ', pokemon);
  console.log('moveData : ', moveData);

  // 레벨링
  const avgLevel = 50;
  const minLevel = Math.max(1, avgLevel - 5);
  const maxLevel = avgLevel + 5;

  const enemyLevel =
    Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  const result = {
    name: pokemon.name,
    types: pokemon.types,
    catchRate: pokemon.catchRate,
    id: pokemon.id,
    level: enemyLevel,
    moves: moveData,
    frontSprite: pokemon.frontSprite,
    cryUrl: pokemon.cryUrl,
    baseStats: {
      hp: pokemon.lv1Stats.hp + pokemon.statGrowth.hp * enemyLevel,
      atk: pokemon.lv1Stats.attack + pokemon.statGrowth.attack * enemyLevel,
      def: pokemon.lv1Stats.defense + pokemon.statGrowth.defense * enemyLevel,
      spd: pokemon.lv1Stats.speed + pokemon.statGrowth.speed * enemyLevel,
      catchRate: pokemon.catchRate,
    },
  };

  return NextResponse.json({
    ok: true,
    result,
  });
}
