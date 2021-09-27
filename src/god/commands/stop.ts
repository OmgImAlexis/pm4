import { GodCommand } from "../../common/types";
import { apps } from "../apps";
import { getAppStatus } from "../common/get-app-status";
import { stopApp } from "../common/stop-app";

export const stopCommand: GodCommand = {
    name: 'stop',
    async method([appName, ..._args], _flags) {
        // Get the app
        const app = apps.get(appName);
        if (!app) throw new Error(`No app found with name \`${appName}\`.`);

        // Stop the app
        await stopApp(app);
        
        // Return current status of the app
        return getAppStatus(appName);
    }
};

