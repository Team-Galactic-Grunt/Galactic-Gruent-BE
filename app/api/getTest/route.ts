import { getClientPromise } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const iconUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${id}.png`;

export async function GET() {
  const client = await getClientPromise();

  const db = client.db('pokemon');

  const pokemonBoxColl = db.collection('pokemon_box');

  const skillsColl = db.collection('skills');

  // pokemon_box 전체 조회
  const pokemonBox = await pokemonBoxColl.find({}).toArray();

  const result = await pokemonBoxColl.updateMany({}, [
    {
      $set: {
        iconUrl: {
          $concat: [
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/',
            { $toString: '$id' },
            '.png',
          ],
        },
      },
    },
  ]);

  return NextResponse.json({
    ok: true,
    message: `${result.modifiedCount}개 iconUrl 추가 완료!`,
  });
}
