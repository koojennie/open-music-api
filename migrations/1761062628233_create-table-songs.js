exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    performer: { type: 'TEXT', notNull: true },
    genre: { type: 'TEXT', notNull: true },
    duration: { type: 'INTEGER' },
    album_id: {
      type: 'VARCHAR(50)',
      references: 'albums',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  });

  pgm.createIndex('songs', 'title');
  pgm.createIndex('songs', 'performer');
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};