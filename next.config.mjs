import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
    cacheOnFrontEndNav: true,
    swSrc: 'src/utils/sw.ts', // add the path where you create sw.ts
    swDest: 'public/sw.js',
    reloadOnOnline: true,
    // disable: process.env.NODE_ENV === "development", // to disable pwa in development
    disable: false
})


/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**'
            }
        ],
    },
}

export default withSerwist(nextConfig)
