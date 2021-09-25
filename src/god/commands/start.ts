import { readFileSync } from 'fs';
import { Command } from "../../common/types";
import { App, apps, Config } from '../apps';
import { startApp, getAppStatus } from '../common';

export const startCommand: Command = {
    name: 'start',
    async method([appName, ..._args], flags) {
        // The user provided config
        const config = flags.config ? JSON.parse(readFileSync(flags.config, 'utf8')) as Config : undefined;

        // Get the app
        const app: Partial<App> | undefined = apps.get(appName) ?? config?.apps?.find(app => app.name === appName);
        if (!app) {
            throw new Error(`No app found with name \`${appName}\`.`);
        }

        // If the app isn't stopped/crashed then bail
        if (app.status && !['CRASHED', 'STOPPED'].includes(app.status)) {
            throw new Error(`Cannot start app as it's currently \`${app.status}\`.`);
        }

        // Start the app
        if (app.script) await startApp(app);
        
        // Return current status of the app
        return getAppStatus(appName);
    }
};
