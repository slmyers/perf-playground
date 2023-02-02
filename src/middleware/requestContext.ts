import { AsyncLocalStorage } from "async_hooks";
import * as uuid from 'uuid'
export const context = new AsyncLocalStorage();
export function useRequestContext(req, res, next) {
    const store = new Map();
    context.run(store, () => {
        store.set('id', uuid.v5())
        store.set('t0', +new Date())
        next();
    });
}