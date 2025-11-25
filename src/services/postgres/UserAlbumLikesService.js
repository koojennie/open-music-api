const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    const queryCheck = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const resultCheck = await this._pool.query(queryCheck);

    if (resultCheck.rows.length) {
      throw new InvariantError('Album sudah disukai');
    }

    const id = `album-like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };

    await this._pool.query(query);

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Album belum disukai');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      const likes = Number(result);
      return { likes, source: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = Number(result.rows[0].likes);

      // cache 30 menit
      await this._cacheService.set(`album-likes:${albumId}`, likes, 30 * 60);

      return { likes, source: 'db' };
    }
  }
}

module.exports = UserAlbumLikesService;