import userRepo from '@repos/user-repo';
import { IUser } from '@models/user-model';
import { UserNotFoundError } from '@shared/errors';
import * as crypto from 'crypto'
import { promisify } from 'util';
import { Transform as CsvTransform } from '@json2csv/node';
import { Readable, Stream, Transform } from 'stream';
import { PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { Http2ServerRequest } from 'http2';
import { Upload } from '@aws-sdk/lib-storage';

const s3 = new S3Client({ region: 'us-east-1' });

const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * Get all users.
 * 
 * @returns 
 */
function getAll(): Promise<IUser[]> {
    return userRepo.getAll();
}


/**
 * Add one user.
 * 
 * @param user 
 * @returns 
 */
async function addOne(user: IUser, userPasswordInput: string): Promise<[{ [id: string]: number; }]> {
    const hashedPassword = await hashPassword(crypto.randomBytes(64).toString('hex'));
    return userRepo.save({...user, ...hashedPassword})
}

async function hashPassword(password: string) : Promise<{[key: string]: string | number}> {
    const salt = crypto.randomBytes(128).toString('base64');
    const iterations = 10000;
    const keylen = 512;
    const digest = 'sha512'
    const hash = await pbkdf2(password, salt, iterations, keylen, digest);

    return {
        password_salt: salt,
        password_hash: hash.toString('hex'),
        hash_iterations: iterations
    };
}

async function validatePassword(userId: number, maybePassword: string): Promise<boolean> {
    return true;
}

function streamUsersAsCsv(): Transform {
    return userRepo.streamGeneratedUsers().pipe(new CsvTransform({}, { objectMode: true, highWaterMark: 1000 })).setEncoding('utf8');
}

function streamToS3(stream: Readable, key: string): Promise<void> {
    console.log(process.env.S3_BUCKET_NAME)
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key + '.csv',
            Body: stream,
            ContentType: 'text/csv',
        },
    });

    return new Promise((resolve, reject) => {
        upload.on('httpUploadProgress', (progress) => {
            console.log(progress);
        });

        upload.done().then((data) => {
            console.log(data);
            resolve();
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}


/**
 * Update one user.
 * 
 * @param user 
 * @returns 
 */
async function updateOne(user: IUser): Promise<void> {
    return Promise.resolve();
    // const persists = await userRepo.persists(user.id);
    // if (!persists) {
    //     throw new UserNotFoundError();
    // }
    // return userRepo.update(user);
}


/**
 * Delete a user by their id.
 * 
 * @param id 
 * @returns 
 */
async function deleteOne(id: number): Promise<void> {
    return Promise.resolve();
    // const persists = await userRepo.persists(id);
    // if (!persists) {
    //     throw new UserNotFoundError();
    // }
    // return userRepo.delete(id);
}


// Export default
export default {
    getAll,
    addOne,
    updateOne,
    delete: deleteOne,
    streamToS3,
    streamUsersAsCsv,
} as const;
