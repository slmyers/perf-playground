import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import * as uuid from 'uuid';
import userModel from '@models/user-model';
import userService from '@services/user-service';
import { ParamMissingError } from '@shared/errors';
import { pipeline } from 'node:stream/promises';
import { Readable, Stream, Transform } from 'node:stream';
import { Transform as CsvTransform } from '@json2csv/node';



// Constants
const router = Router();
const { CREATED, OK } = StatusCodes;

// Paths
export const p = {
    get: '/all',
    add: '/add',
    update: '/update',
    delete: '/delete/:id',
    stream: '/stream',
    upload: '/uploadToS3',
} as const;

router.get(p.stream, async (_: Request, res: Response) => {
    await pipeline(
        userService.streamUsersAsCsv(),
        res,
    )
})

router.post(p.upload, async (_: Request, res: Response) => {
    const key = uuid.v4();
    await userService.streamToS3(
        userService.streamUsersAsCsv(), 
        key
    );
    return res.status(OK).json({key});
});

/**
 * Get all users.
 */
router.get(p.get, async (_: Request, res: Response) => {
    const users = await userService.getAll();
    return res.status(OK).json({users});
});


/**
 * Add one user.
 */
router.post(p.add, async (req: Request, res: Response) => {
    const { user: pendingUser } = req.body;
    if (!pendingUser) {
        throw new ParamMissingError();
    }
    console.log(JSON.stringify(pendingUser, null, 4))
    const user = userModel.new({ first_name: pendingUser.first_name, last_name: pendingUser.last_name, email: pendingUser.email});
    const result = await userService.addOne(user, pendingUser.passwordSubmission);
    return res.status(CREATED).end(JSON.stringify(result));
});


/**
 * Update one user.
 */
router.put(p.update, async (req: Request, res: Response) => {
    const { user } = req.body;
    // Check param
    if (!user) {
        throw new ParamMissingError();
    }
    // Fetch data
    await userService.updateOne(user);
    return res.status(OK).end();
});


/**
 * Delete one user.
 */
router.delete(p.delete, async (req: Request, res: Response) => {
    const { id } = req.params;
    // Check param
    if (!id) {
        throw new ParamMissingError();
    }
    // Fetch data
    await userService.delete(Number(id));
    return res.status(OK).end();
});


// Export default
export default router;
