import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/getPokemonBox:
 *   get:
 *     tags: [박스]
 *     summary: 포켓몬 박스
 *     description: isMyPokemon(현재 소지 포켓몬)과 pokemonBox(박스 포켓몬) 반환
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isMyPokemon:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           catchId:
 *                             type: number
 *                           name:
 *                             type: string
 *                           frontSprite:
 *                             type: string
 *                     pokemonBox:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           catchId:
 *                             type: number
 *                           name:
 *                             type: string
 *                           frontSprite:
 *                             type: string
 */
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
