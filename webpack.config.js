module.exports = {
  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/System Volume Information/**',
      '**/$RECYCLE.BIN/**',
      '**/Thumbs.db',
      '**/.DS_Store'
    ],
    aggregateTimeout: 300,
    poll: 1000
  }
};