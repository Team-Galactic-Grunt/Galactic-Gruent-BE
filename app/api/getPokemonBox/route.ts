import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const client = await getClientPromise();

  const boxColl = client.db('pokemon').collection('pokemon_box');
  const historyColl = client.db('pokemon').collection('game_history');
  // 현재 파티 포켓몬 ID 목록
  const history = await historyColl.findOne(
    {},
    {
      projection: {
        _id: 0,
        pokemon: 1,
      },
    },
  );

  const myPokemonSet = new Set(history?.pokemon ?? []);

  // 전체 포켓몬
  const allPokemon = await boxColl.find({}).toArray();

  // 현재 소지 포켓몬
  const isMyPokemon = allPokemon.filter((pokemon) =>
    myPokemonSet.has(pokemon.catchId),
  );

  // 박스 포켓몬
  const pokemonBox = allPokemon.filter(
    (pokemon) => !myPokemonSet.has(pokemon.catchId),
  );

  return NextResponse.json({
    ok: true,

    message: '포켓몬 박스 조회',

    data: {
      isMyPokemon,

      pokemonBox,
    },
  });
}
