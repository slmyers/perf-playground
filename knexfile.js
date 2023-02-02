// Update with your config settings.
require('dotenv').config()
const {
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
} = process.env;
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: PGDATABASE,
      user:     PGUSER,
      password: PGPASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
};
