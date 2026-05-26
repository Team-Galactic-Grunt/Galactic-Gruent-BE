import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  try {
    const client = await getClientPromise();

    const pokemonColl = client.db('pokemon').collection('pokemon');

    // 모든 포켓몬 조회
    const pokemons = await pokemonColl.find({}).toArray();

    await Promise.all(
      pokemons.map(async (pokemon) => {
        const lv1Stats = pokemon.lv1Stats;

        const statGrowth = pokemon.statGrowth;

        // lv1Stats 합치기
        const newLv1Stats = {
          ...lv1Stats,

          attack: (lv1Stats.attack ?? 0) + (lv1Stats['special-attack'] ?? 0),

          defense: (lv1Stats.defense ?? 0) + (lv1Stats['special-defense'] ?? 0),
        };

        // special 제거
        delete newLv1Stats['special-attack'];
        delete newLv1Stats['special-defense'];

        // statGrowth 합치기
        const newStatGrowth = {
          ...statGrowth,

          attack:
            (statGrowth.attack ?? 0) + (statGrowth['special-attack'] ?? 0),

          defense:
            (statGrowth.defense ?? 0) + (statGrowth['special-defense'] ?? 0),
        };

        // special 제거
        delete newStatGrowth['special-attack'];
        delete newStatGrowth['special-defense'];

        await pokemonColl.updateOne(
          {
            _id: pokemon._id,
          },
          {
            $set: {
              lv1Stats: newLv1Stats,

              statGrowth: newStatGrowth,
            },
          },
        );

        console.log(`${pokemon.name} 업데이트 완료`);
      }),
    );

    return NextResponse.json({
      ok: true,
      message: 'special stat 병합 완료',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: '업데이트 실패',
      },
      {
        status: 500,
      },
    );
  }
}
