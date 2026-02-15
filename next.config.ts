import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // 明确指定输出文件追踪根目录
  // outputFileTracingRoot: path.resolve(__dirname),
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
