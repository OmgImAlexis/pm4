import { store } from "../../common/config";
import { apps } from "../apps";
import { logger } from "./logger";

export const saveApps = () => {
    const deserializedApps = [...apps.values()].map(app => ({
        ...app,
        process: undefined,
        status: undefined,
        restarts: undefined
    }));
    
    logger.debug('Saving %s app%s to disk.', apps.size, apps.size === 1 ? '' : 's');
    store.set('apps', deserializedApps);
};
