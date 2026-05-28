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

    const historyColl = db.collection('game_history');

    // pokemon_box 전체 조회
    const allPokemon = await pokemonBoxColl.find({}).toArray();

    // 현재 파티 포켓몬
    const isMyPokemon = allPokemon.filter(
      (pokemon) => pokemon.myPokemon === true,
    );

    // 박스 포켓몬
    const pokemonBox = allPokemon.filter(
      (pokemon) => pokemon.myPokemon === false,
    );

    // game_history 업데이트
    await historyColl.updateOne(
      {},
      {
        $set: {
          isMyPokemon,

          pokemonBox,
        },
      },
      {
        upsert: true,
      },
    );

    return NextResponse.json({
      ok: true,

      message: 'game_history 업데이트 완료',

      data: {
        isMyPokemonCount: isMyPokemon.length,

        pokemonBoxCount: pokemonBox.length,
      },
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
