import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

function calcStatsAtLevel(
  lv1Stats: Record<string, number>,
  statGrowth: Record<string, number>,
  level: number,
): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const stat in lv1Stats) {
    stats[stat] = lv1Stats[stat] + statGrowth[stat] * (level - 1);
  }
  return stats;
}

export async function PUT(req: Request) {
  // const client = await getClientPromise();
  // const pokemonColl = client.db('pokemon').collection('pokemon');
  // const boxColl = client.db('pokemon').collection('pokemon_box');
  // // 모든 포켓몬 조회
  // const pokemons = await pokemonColl
  //   .find({ sinnohNo: { $gte: 1, $lte: 15 } })
  //   .sort({ sinnohNo: 1 })
  //   .toArray();
  // const LEVEL = 50;
  // const boxPokemons = pokemons.map((pokemon, index) => {
  //   const currentStats = calcStatsAtLevel(
  //     pokemon.lv1Stats,
  //     pokemon.statGrowth,
  //     LEVEL,
  //   );
  //   return {
  //     catchId: uuidv4(),
  //     id: pokemon.id,
  //     name: pokemon.name,
  //     sinnohNo: pokemon.sinnohNo,
  //     types: pokemon.types,
  //     level: LEVEL,
  //     currentHp: currentStats.hp,
  //     maxHp: currentStats.hp,
  //     baseStats: currentStats,
  //     moves: pokemon.moves.slice(0, 4),
  //     frontSprite: pokemon.frontSprite,
  //     backSprite: pokemon.backSprite,
  //     cryUrl: pokemon.cryUrl,
  //     // gender: Math.random() > 0.5 ? 'male' : 'female',
  //     caughtAt: new Date(),
  //   };
  // });
  // await boxColl.insertMany(boxPokemons);
  // return NextResponse.json({
  //   ok: true,
  //   message: `${boxPokemons.length}마리 pokemon_box에 추가 완료!`,
  // });
}
