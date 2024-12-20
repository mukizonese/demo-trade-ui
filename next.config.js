module.exports = {
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/mukizone',
        //destination: 'http://localhost:3002/',
        destination: process.env.NEXT_PUBLIC_MUKIZONE_URL,
        permanent: true,
      },
      // Wildcard path matching
      {
        source: '/blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
    ]
  },
  output: "standalone"
}