const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    service,
    playlistSongsService,
    playlistActivitiesService,
    validator,
    playlistSongsValidator,
  }) => {
    const handler = new PlaylistsHandler(
      service,
      playlistSongsService,
      playlistActivitiesService,
      validator,
      playlistSongsValidator,
    );
    server.route(routes(handler));
  },
};