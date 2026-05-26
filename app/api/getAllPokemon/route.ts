import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await getClientPromise();
    const pokemonColl = client.db('pokemon').collection('pokemon');
    const skillsColl = client.db('pokemon').collection('skills');

    // skills collection에 존재하는 기술들 가져오기
    const skills = await skillsColl.find({}).toArray();

    // 영어 기술명 -> 한국어 기술명 매핑
    const moveNameMap = new Map(
      skills.map((skill) => [
        skill.name, // ex: swords-dance
        skill.koName, // ex: 칼춤
      ]),
    );

    // 허용 영어 기술명 Set
    const validMoveSet = new Set(skills.map((skill) => skill.name));

    // 모든 포켓몬 조회
    const pokemons = await pokemonColl.find({}).toArray();

    // 업데이트
    await Promise.all(
      pokemons.map(async (pokemon) => {
        // skills collection에 존재하는 기술만 남김
        const filteredMoves = pokemon.moves.filter((move: string) =>
          validMoveSet.has(move),
        );

        // 영어 -> 한국어 변환
        const koMoves = filteredMoves.map((move: string) =>
          moveNameMap.get(move),
        );

        await pokemonColl.updateOne(
          {
            _id: pokemon._id,
          },
          {
            $set: {
              moves: koMoves,
            },
          },
        );

        console.log(`${pokemon.name} 완료`);
      }),
    );

    return NextResponse.json({
      ok: true,
      message: 'moves 한국어 변환 + 필터링 완료',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: '실패',
      },
      {
        status: 500,
      },
    );
  }

  // const pokemon = await pokemonColl.find({}).toArray();

  // return NextResponse.json({ ok: true, result: pokemon });
}
