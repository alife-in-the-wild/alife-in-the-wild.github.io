/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',                 // emit a fully static site to ./out
  images: { unoptimized: true },    // GitHub Pages can't run the image optimiser
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
