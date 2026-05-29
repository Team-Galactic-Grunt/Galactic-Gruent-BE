/* eslint-disable @typescript-eslint/no-explicit-any */
import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 필요 경험치 계산 공식
function calcNeedExp(level: number) {
  return Math.floor(0.8 * level ** 2 + level * 15);
}

export async function GET() {
  const client = await getClientPromise();

  const db = client.db('pokemon');

  const historyColl = db.collection('game_history');

  // game_history 가져오기
  const history = await historyColl.findOne({});

  // 포켓몬 경험치 데이터 추가
  const addExpData = (pokemonList: any[]) => {
    return pokemonList.map((pokemon) => ({
      ...pokemon,

      // 현재 경험치
      currentExp: 0,

      // 다음 레벨 필요 경험치
      needExp: calcNeedExp(pokemon.level),
    }));
  };

  // 내 포켓몬
  const updatedIsMyPokemon = addExpData(history?.isMyPokemon);

  // 박스 포켓몬
  const updatedPokemonBox = addExpData(history?.pokemonBox);

  // 업데이트
  await historyColl.updateOne(
    { _id: history?._id },
    {
      $set: {
        isMyPokemon: updatedIsMyPokemon,

        pokemonBox: updatedPokemonBox,
      },
    },
  );

  return NextResponse.json({
    ok: true,
    message: '경험치 데이터 추가 완료',

    result: {
      isMyPokemon: updatedIsMyPokemon,

      pokemonBox: updatedPokemonBox,
    },
  });
}
