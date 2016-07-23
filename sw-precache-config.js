module.exports = {
  staticFileGlobs: [
    '/index.html',
    '/manifest.json',
    '/bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '/src/my-view1.html',
    '/media/*.html'
  ],
  runtimeCaching: [{
    urlPattern: /\/bower_components\//,
    handler: 'fastest'
  }, {
    urlPattern: /\/images\//,
    handler: 'fastest'
  }, {
    urlPattern: /\/media\//,
    handler: 'cacheFirst',
    options: {
      cache: {
        maxEntries: 10,
        name: 'sounds-cache'
      }
    }
  }]
  navigateFallback: '/index.html'
};
