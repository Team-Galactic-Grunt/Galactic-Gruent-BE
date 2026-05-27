// lib/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '포켓몬 API',
      version: '1.0.0',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://galactic-gruent-be.vercel.app'
            : 'http://localhost:3000',
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // API Route 경로
};

export const swaggerSpec = swaggerJsdoc(options);
