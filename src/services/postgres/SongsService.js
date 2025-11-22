const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs
             (id, title, year, performer, genre, duration, album_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
      values: [id, title, year, performer, genre, duration ?? null, albumId ?? null],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0]?.id) throw new InvariantError('Lagu gagal ditambahkan');
    return result.rows[0].id;
  }

  async getSongs({ title, performer } = {}) {
    const values = [];
    const conditions = [];
    if (title) {
      values.push(`%${title.toLowerCase()}%`);
      conditions.push(`LOWER(title) LIKE $${values.length}`);
    }
    if (performer) {
      values.push(`%${performer.toLowerCase()}%`);
      conditions.push(`LOWER(performer) LIKE $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = {
      text: `SELECT id, title, performer FROM songs ${where} ORDER BY title ASC`,
      values,
    };

    const result = await this._pool.query(query);
    return result.rows; 
  }

  async getSongById(id) {
    const result = await this._pool.query({
      text: `SELECT id, title, year, performer, genre, duration, album_id
             FROM songs WHERE id = $1`,
      values: [id],
    });

    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');
    return mapSongDBToModel(result.rows[0]);
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const result = await this._pool.query({
      text: `UPDATE songs
             SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6
             WHERE id = $7
             RETURNING id`,
      values: [title, year, performer, genre, duration ?? null, albumId ?? null, id],
    });

    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }

  async deleteSongById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rows.length) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }

  async getSongsByAlbumId(albumId) {
    const res = await this._pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1 ORDER BY title ASC',
      values: [albumId],
    });
    return res.rows;
  }

  async verifySongId(id) {
    const result = await this._pool.query({
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    });

    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');
  }
}

module.exports = SongsService;