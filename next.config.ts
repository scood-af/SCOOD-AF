import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**', // Allow all paths from this host
            },
            // If you are storing other images in Supabase Storage, add this too:
            // {
            //   protocol: 'https',
            //   hostname: 'your-project-ref.supabase.co',
            //   port: '',
            //   pathname: '/storage/v1/object/public/**',
            // },
            {
                protocol: 'https',
                hostname: 'ui.shadcn.com',
                pathname: '/**', // Allows all paths from this domain
            },
            {
                protocol: 'https',
                hostname: 'msvnbggkjxdrzrkwfamw.supabase.co', // Your exact Supabase domain
                port: '',
                pathname: '/storage/v1/object/public/**', // Allows everything in your public buckets
            },
        ],
    },
};

export default nextConfig;
