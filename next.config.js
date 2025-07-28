module.exports = {
  async redirects() {
    const redirects = [
      // Wildcard path matching
      {
        source: '/blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
    ]

    // Only add mukizone redirect if the environment variable is set
    if (process.env.NEXT_PUBLIC_MUKIZONE_URL) {
      redirects.unshift({
        source: '/mukizone',
        destination: process.env.NEXT_PUBLIC_MUKIZONE_URL,
        permanent: true,
      })
    }

    return redirects
  },
  output: "standalone"
}