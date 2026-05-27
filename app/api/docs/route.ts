import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // API Route 폴더
    definition: {
      openapi: '3.0.0',
      info: {
        title: '포켓몬 API',
        version: '1.0.0',
      },
    },
  });

  return NextResponse.json(spec);
}
