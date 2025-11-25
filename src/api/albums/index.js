const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    service, songsService, storageService, uploadsValidator, likesService, validator,
  }) => {
    const handler = new AlbumsHandler(service, songsService, storageService, uploadsValidator, likesService, validator);
    server.route(routes(handler));
  },
};