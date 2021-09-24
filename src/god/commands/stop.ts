import { Command } from "../../common/types";
import { apps } from "../apps";
import { getAppStatus } from "../common";

export const stopCommand: Command = {
    name: 'stop',
    async method([appName, ..._args], _flags) {
        // Get the app
        const app = apps.get(appName);
        if (!app) {
            throw new Error(`No app found with name \`${appName}\`.`);
        }

        // Stop the app
        if (app && app.status !== 'STOPPED') {
            app.process?.kill();
            apps.set(app.name, {
                ...app,
                process: undefined,
                status: 'STOPPED'
            });
        }
        
        // Return current status of the app
        return getAppStatus(appName);
    }
};
