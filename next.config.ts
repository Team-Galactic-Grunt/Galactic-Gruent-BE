import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ['swagger-ui-react'], // ← 추가
  async headers() {
    return [
      {
        source: '/api/:path*', // 모든 API Route에 적용
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
