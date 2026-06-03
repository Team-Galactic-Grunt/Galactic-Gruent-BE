// 레벨 받아오기
// const avgLevel = Number(searchParams.get('avgLevel') ?? 50);
// getClientPromise가 async 함수이므로 await를 붙여서 client 인스턴스를 가져옵니다.

import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

function calcNeedExp(level: number) {
  return Math.floor(0.8 * level ** 2 + level * 15);
}

function calcGiveExp(level: number) {
  return Math.floor(calcNeedExp(level) * 0.3);
}

export async function POST(req: Request) {
  const client = await getClientPromise();

  const db = client.db('pokemon');
  const pokemonColl = db.collection('pokemon');
  const skillsColl = db.collection('skills');

  const data = await req.json();
  console.log('data : ', data.eventZone, data.avgLevel, data.pokemonId);

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

  const projection = {
    name: 1,
    catchRate: 1,
    lv1Stats: 1,
    frontSprite: 1,
    backSprite: 1,
    cryUrl: 1,
    statGrowth: 1,
    moves: 1,
    id: 1,
    types: 1,
    iconSprite: 1,
  };

  // pokemonId 유무에 따라 DB 조회 분기
  const pokemon = data.pokemonId
    ? await pokemonColl.findOne({ id: data.pokemonId }, { projection })
    : (
        await pokemonColl
          .aggregate([
            { $match: { habitat: data.eventZone } },
            { $sample: { size: 1 } },
            { $project: projection },
          ])
          .toArray()
      )[0];

  if (!pokemon) {
    return NextResponse.json(
      { ok: false, message: '포켓몬 없음' },
      { status: 404 },
    );
  }

  // 기술 랜덤 4개
  const selectedMoves = pokemon.moves
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const moveData = (
    await skillsColl
      .find(
        { koName: { $in: selectedMoves } },
        {
          projection: {
            _id: 0,
            koName: 1,
            type: 1,
            accuracy: 1,
            power: 1,
            priority: 1,
            statChanges: 1,
            description: 1,
            pp: 1,
          },
        },
      )
      .toArray()
  ).map(({ pp, ...rest }) => ({
    ...rest,
    maxpp: pp,
    currentpp: pp,
  }));

  // 레벨링
  const avgLevel = data.avgLevel ?? 50;
  const minLevel = Math.max(1, avgLevel - 5);
  const maxLevel = avgLevel + 5;
  const enemyLevel =
    Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

  const hp = pokemon.lv1Stats.hp + pokemon.statGrowth.hp * enemyLevel;

  console.log('iconSprite: ', pokemon.iconSprite);

  const result = {
    name: pokemon.name,
    types: pokemon.types,
    catchRate: pokemon.catchRate,
    id: pokemon.id,
    level: enemyLevel,
    moves: moveData,
    frontSprite: pokemon.frontSprite,
    backSprite: pokemon.backSprite,
    iconUrl: pokemon.iconSprite,
    maxHp: hp,
    currentHp: hp,
    currentExp: 0,
    needExp: calcNeedExp(enemyLevel),
    cryUrl: pokemon.cryUrl,
    exp: calcGiveExp(enemyLevel),
    baseStats: {
      hp,
      attack: pokemon.lv1Stats.attack + pokemon.statGrowth.attack * enemyLevel,
      defense:
        pokemon.lv1Stats.defense + pokemon.statGrowth.defense * enemyLevel,
      speed: pokemon.lv1Stats.speed + pokemon.statGrowth.speed * enemyLevel,
      catchRate: pokemon.catchRate,
    },
    lv1Stats: pokemon.lv1Stats,
    statGrowth: pokemon.statGrowth,
  };

  return NextResponse.json({ ok: true, result });
}
