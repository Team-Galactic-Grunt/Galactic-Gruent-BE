import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const iconUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${id}.png`;

export async function GET() {
  try {
    const client = await getClientPromise();

    const db = client.db('pokemon');

    const pokemonBoxColl = db.collection('pokemon_box');

    const skillsColl = db.collection('skills');

    // pokemon_box 전체 조회
    const pokemonBox = await pokemonBoxColl.find({}).toArray();

    await Promise.all(
      pokemonBox.map(async (pokemon) => {
        // 기술 이름 목록
        const moveNames = pokemon.moves ?? [];

        // skills collection에서 기술 정보 조회
        const skillData = await skillsColl
          .find({
            koName: {
              $in: moveNames,
            },
          })
          .toArray();

        // moves 변환
        const newMoves = moveNames.map((moveName: string) => {
          const skill = skillData.find((s) => s.koName === moveName);

          return {
            koName: moveName,

            maxpp: skill?.pp ?? 0,

            currentpp: skill?.pp ?? 0,
          };
        });

        // pokemon_box 업데이트
        await pokemonBoxColl.updateOne(
          {
            _id: pokemon._id,
          },
          {
            $set: {
              moves: newMoves,
            },
          },
        );

        console.log(`${pokemon.name} 기술 PP 추가 완료`);
      }),
    );

    return NextResponse.json({
      ok: true,

      message: 'moves pp 업데이트 완료',
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
