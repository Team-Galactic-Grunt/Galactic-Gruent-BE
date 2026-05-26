import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await getClientPromise();

    const pokemonColl = client.db('pokemon').collection('pokemon');

    // 모든 포켓몬 조회
    const pokemons = await pokemonColl.find({}).toArray();

    // 병렬 처리
    await Promise.all(
      pokemons.map(async (pokemon) => {
        try {
          const pokeApiId = pokemon.id;

          // pokemon 데이터
          const pokemonRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokeApiId}`,
          );

          const pokemonData = await pokemonRes.json();

          // species 데이터 (포획률)
          const speciesRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${pokeApiId}`,
          );

          const speciesData = await speciesRes.json();

          // 4세대 HGSS 도트 이미지
          const sprites =
            pokemonData.sprites.versions['generation-iv'][
              'heartgold-soulsilver'
            ];

          await pokemonColl.updateOne(
            {
              _id: pokemon._id,
            },
            {
              $set: {
                frontSprite: sprites.front_default ?? '',

                backSprite: sprites.back_default ?? '',

                frontShinySprite: sprites.front_shiny ?? '',

                backShinySprite: sprites.back_shiny ?? '',

                catchRate: speciesData.capture_rate ?? 45,
              },
            },
          );

          console.log(`${pokemon.name} 업데이트 완료`);
        } catch (error) {
          console.error(`${pokemon.name} 업데이트 실패`, error);
        }
      }),
    );

    return NextResponse.json({
      ok: true,
      message: '4세대 도트 sprite + 포획률 업데이트 완료',
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
