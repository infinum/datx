module.exports = {
  async rewrites() {
    return [
      {
        source: '/jsonapi/:path*',
        destination: 'https://jsonapiplayground.reyesoft.com/v2/:path*',
        basePath: false,
      },
    ]
  },
}
