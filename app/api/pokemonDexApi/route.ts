/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const result = await dexColl
    .find({}, { projection: { _id: 0 } })
    .sort({ sinnohNo: 1 })
    .toArray();

  return NextResponse.json({
    ok: true,
    message: '포켓몬 도감 조회',
    data: result,
  });
}

export async function POST(req: Request) {
  const data = await req.json();
  console.log(`data: ${JSON.stringify(data)}`);
  console.log(data);

  const client = await getClientPromise();
  const db = client.db('pokemon');
  const pokeDexColl = db.collection('pokedex');

  const ops = data.map((pokemon: any) => ({
    updateOne: {
      filter: { id: pokemon.id },
      update: { $set: pokemon },
      upsert: true,
    },
  }));

  const result = await pokeDexColl.bulkWrite(ops);

  if (result.isOk()) {
    return NextResponse.json({
      ok: true,
      message: `포켓덱스 ${result.upsertedCount + result.modifiedCount}개 반영 성공`,
    });
  }

  return NextResponse.json({ ok: false, message: '반영 실패' });
}
