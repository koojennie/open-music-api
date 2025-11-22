const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(songsService, playlistActivitiesService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    // pastikan songId valid
    await this._songsService.verifySongId(songId);

    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'add',
    });
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
             FROM playlist_songs
             JOIN songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1
             ORDER BY songs.title ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
    });
  }
}

module.exports = PlaylistSongsService;