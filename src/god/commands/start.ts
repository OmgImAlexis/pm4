import { readFileSync, existsSync } from 'fs';
import { Command } from "../../common/types";
import { App, apps, Config } from '../apps';
import { startApp, getAppStatus } from '../common';

const getConfig = (configPath: string) => {
    try {
        return JSON.parse(readFileSync(configPath, 'utf8')) as Config;
    } catch {
        return undefined;
    }
};

export const startCommand: Command = {
    name: 'start',
    async method([appName, ..._args], flags) {
        if (!appName) {
            throw new Error('No app name provided.');
        }

        // Ensure we only pass a string through
        const configPath = typeof flags.config === 'string' ? flags.config : undefined;

        // Check if the user provided config exists
        if (configPath && !existsSync(configPath)) throw new Error(`Config path ${configPath} doesn't exist.`);

        // Get the user's config
        const config = getConfig(configPath ?? './config.json');

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
