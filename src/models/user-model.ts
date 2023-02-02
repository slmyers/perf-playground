
// User schema
export interface IUser {
    id: number | undefined;
    first_name: string;
    last_name: string;
    password_hash: string;
    password_salt: string;
    hash_iterations: number;
}

/**
 * Get a new User object.
 * 
 * @returns 
 */
function getNew(input: Object): IUser {
    return {
        id: undefined,
        first_name: "",
        last_name: "",
        password_hash: "",
        password_salt: "",
        hash_iterations: -1,
        ...input,
    };
}


/**
 * Copy a user object.
 * 
 * @param user 
 * @returns 
 */
function copy(user: IUser): IUser {
    return {...user}
}


// Export default
export default {
    new: getNew,
    copy,
}
