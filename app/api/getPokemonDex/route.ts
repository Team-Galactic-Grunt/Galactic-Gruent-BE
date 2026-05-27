import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/getPokemonDex:
 *   get:
 *     tags: [도감]
 *     summary: 포켓몬 도감
 *     description: pokedex 컬렉션의 모든 포켓몬 반환
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
 *                 result:
 *                   type: array
 */
export async function GET() {
  const client = await getClientPromise();

  const dexColl = client.db('pokemon').collection('pokedex');

  const result = await dexColl.find({}).toArray();

  return NextResponse.json({
    ok: true,
    message: '포켓몬 도감 조회',
    data: result,
  });
}
