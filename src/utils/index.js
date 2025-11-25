const mapAlbumDBToModel = ({
  id, name, year, cover
}) => ({
  id, name, year, coverUrl: cover || null,
});

const mapSongDBToModel = ({
  id, title, year, performer, genre, duration, album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id || null,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel };