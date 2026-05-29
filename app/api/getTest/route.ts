import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const iconUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${id}.png`;

export async function GET() {
  const client = await getClientPromise();

  const db = client.db('pokemon');

  const pokemonColl = db.collection('pokemon');
  const pokedexColl = db.collection('pokedex');

  // pokemon collection의 모든 포켓몬 가져오기
  const pokemonList = await pokemonColl
    .find(
      {},
      {
        projection: {
          id: 1,
          weight: 1,
        },
      },
    )
    .toArray();

  // pokedex 업데이트
  for (const pokemon of pokemonList) {
    await pokedexColl.updateOne(
      { id: pokemon.id },
      {
        $set: {
          weight: pokemon.weight,
        },
      },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'pokedex에 weight 추가 완료',
  });
}
