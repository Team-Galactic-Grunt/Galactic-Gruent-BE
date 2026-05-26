import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const client = await getClientPromise();

  const pokemonColl = client.db('pokemon').collection('pokemon');

  // 모든 포켓몬 조회
  const pokemons = await pokemonColl
    .find({}, { projection: { id: 1, name: 1 } })
    .toArray();
  console.log(`총 ${pokemons.length}마리 처리 시작`);

  for (const pokemon of pokemons) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
    const data = await res.json();
    const enName = data.name; // 영어 소문자 이름

    const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${enName}.mp3`;

    await client
      .db('pokemon')
      .collection('pokemon')
      .updateOne({ id: pokemon.id }, { $set: { cryUrl } });

    console.log(`✓ ${pokemon.name} (${enName}) → ${cryUrl}`);
    await sleep(200);
  }

  return NextResponse.json({
    ok: true,
    message: `${pokemons.length}마리 cryUrl 추가 완료!`,
  });
}
