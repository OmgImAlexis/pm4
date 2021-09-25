import { Command } from "../../common/types";
import { apps } from "../apps";
import { getAppStatus } from "../common/get-app-status";

export const stopCommand: Command = {
    name: 'stop',
    async method([appName, ..._args], _flags) {
        // Get the app
        const app = apps.get(appName);
        if (!app) throw new Error(`No app found with name \`${appName}\`.`);
        if (app.status === 'STOPPED') throw new Error(`Cannot stop app as it's already \`${app.status}\`.`);

        // Stop the app
        app.process?.kill();
        apps.set(app.name, {
            ...app,
            process: undefined,
            status: 'STOPPED'
        });
        
        // Return current status of the app
        return getAppStatus(appName);
    }
};
