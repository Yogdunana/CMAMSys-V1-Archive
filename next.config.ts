import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // 明确指定输出文件追踪根目录
  // outputFileTracingRoot: path.resolve(__dirname),
  /* config options here */
  // 修复：仅在开发环境设置 allowedDevOrigins
  ...(process.env.NODE_ENV === 'development' ? {
    allowedDevOrigins: ['*.dev.coze.site'],
  } : {}),
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
