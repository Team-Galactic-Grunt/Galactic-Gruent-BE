import { getClientPromise } from '@/app/lib/mongodb'; // ◀ 중괄호 { } 추가
import { NextResponse } from 'next/server';

function calcNeedExp(level: number) {
  return Math.floor(0.8 * level ** 2 + level * 15);
}

function calcGiveExp(level: number) {
  return Math.floor(calcNeedExp(level) * 0.3);
}

export async function POST(req: Request) {
  // 레벨 받아오기
  // const avgLevel = Number(searchParams.get('avgLevel') ?? 50);
  // getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.
  const client = await getClientPromise();

  const db = client.db('pokemon');
  const pokemonColl = db.collection('pokemon');
  const skillsColl = db.collection('skills');

  const data = await req.json();
  console.log('data : ', data.eventZone, data.avgLevel);

  if (!data.eventZone || !data.avgLevel) {
    return NextResponse.json(
      {
        ok: false,
        message: '이벤트 존 또는 평균 레벨이 제공되지 않았습니다.',
      },
      {
        status: 400,
      },
    );
  }

  // 포켓몬 조회
  const [pokemon] = await pokemonColl
    .aggregate([
      {
        $match: {
          habitat: data.eventZone, // pokemon.habitat 필드가 eventZone과 일치하는 것 필터링
        },
      },
      {
        $sample: { size: 1 }, // 매칭된 포켓몬 중 무작위 1마리 선택
      },
      {
        $project: {
          // 기존 projection과 동일한 역할
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
    ])
    .toArray();

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
  const avgLevel = data.avgLevel ?? 50;
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
    exp: calcGiveExp(enemyLevel),
    baseStats: {
      hp: pokemon.lv1Stats.hp + pokemon.statGrowth.hp * enemyLevel,
      attack: pokemon.lv1Stats.attack + pokemon.statGrowth.attack * enemyLevel,
      defense:
        pokemon.lv1Stats.defense + pokemon.statGrowth.defense * enemyLevel,
      speed: pokemon.lv1Stats.speed + pokemon.statGrowth.speed * enemyLevel,
      catchRate: pokemon.catchRate,
    },
  };

  return NextResponse.json({
    ok: true,
    result,
  });
}
