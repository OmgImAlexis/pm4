import { store } from "../../common/config";
import { Command } from "../../common/types";
import { apps } from "../apps";
import { logger } from "../common";

export const saveCommand: Command = {
    name: 'save',
    async method(_args, _flags) {
        const deserializedApps = [...apps.values()].map(app => ({
            ...app,
            process: undefined,
            status: undefined,
            restarts: undefined
        }));
    
        logger.debug('Saving %s app%s to disk.', apps.size, apps.size === 1 ? '' : 's');
        store.set('apps', deserializedApps);

        return `${apps.size} app${apps.size === 1 ? '' : 's'} saved to disk`;
    }
};
