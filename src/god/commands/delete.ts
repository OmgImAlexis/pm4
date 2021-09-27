import { GodCommand } from "../../common/types";
import { apps } from "../apps";
import { saveApps } from "../common/save-apps";
import { stopApp } from "../common/stop-app";

export const deleteCommand: GodCommand = {
    name: 'delete',
    async method([appName, ..._args], _flags) {
        if (!appName) throw new Error('No app name provided.');

        const app = apps.get(appName);
        if (!app) throw new Error(`No app found with name \`${appName}\`.`);
        
        // Stop the app if it's running
        if (!['CRASHED', 'STOPPED'].includes(app.status)) await stopApp(app);

        // Delete app
        apps.delete(appName);

        // Update apps on disk
        saveApps();

        return `Deleted ${appName}`;
    }
};
