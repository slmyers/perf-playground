import { IUser } from '@models/user-model';
import { getRandomInt } from '@shared/functions';
import * as db from '../../db'
import { pipeline } from 'node:stream/promises';
import { Stream } from 'node:stream';
const { Transform } = require('node:stream');

/**
 * Get all users.
 * 
 * @returns 
 */
async function getAll(): Promise<IUser[]> {
    const result = await db.knex<IUser>('users').limit(500);
    return result;
}

async function save(user: IUser): Promise<[{ [id: string]: number}]> {
    const result = await db.knex('users').returning('id').insert(user);
    return result;
}

async function findBy(filter: Partial<IUser>): Promise<IUser[]> {
    const result = await db.knex('users').where(filter);
    return result;
}


function streamGeneratedUsers() {
    const query = `
        SELECT 
            md5(random()::text) AS "first_name",
            md5(random()::text) AS "last_name",
            md5(random()::text) || '@' || md5(random()::text) || '.com' AS "email"
        FROM generate_series(0, ${500_000});
    `
    return db.knex.raw<IUser>(query).stream();
}

// Export default
export default {
    getAll,
    save,
    findBy,
    streamGeneratedUsers,
} as const;
